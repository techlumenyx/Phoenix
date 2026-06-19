# Architecture — Christian Listings

## System Diagram

```
                  [ Vite + React SPA — port 5173 ]
                              │
                    HTTPS / GraphQL / WebSockets
                              │
                    [ Apollo Router — port 4000 ]
                    (Federation v2 Gateway)
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼        ▼
┌──────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ subgraph-identity│  │ subgraph-events │  │subgraph-classif.│  │ subgraph-admin   │
│   port 4001      │  │   port 4002     │  │   port 4003     │  │   port 4004      │
│  db: cl_identity │  │  db: cl_events  │  │db: cl_classified│  │  db: cl_admin    │
└──────────────────┘  └─────────────────┘  └─────────────────┘  └──────────────────┘
         │                    │                    │                    │
         └────────────────────┴────────────────────┴────────────────────┘
                                        │
                               [ MongoDB Atlas Cluster ]
                            (4 separate named databases)
```

## Federation Topology

The single GraphQL endpoint at `http://localhost:4000/graphql` (or the deployed gateway URL) is served by **Apollo Router**. The Router holds a pre-composed `supergraph.graphql` — a merged schema built from all four subgraph SDLs by the **Rover CLI**.

When a client query arrives:
1. Apollo Router analyses the query plan against the supergraph schema.
2. It dispatches sub-queries to the relevant subgraph(s) in parallel where possible.
3. It assembles the federated response and returns a single JSON payload.

The client never communicates with individual subgraphs directly.

**Key Federation directives used:**
- `@key(fields: "id")` — marks an entity's primary key so other subgraphs can reference it
- `extend type` / `@external` — a subgraph declares a stub of an entity it extends
- `@provides` — hints to the Router that a resolver can supply specific fields inline

## Account Types

The platform has three distinct account types, all within a single Firebase project. The account type is stored as a Firebase custom claim set at registration time and is available in every subgraph resolver via `context.auth.decodedToken.accountType`.

| Account Type | Firebase Claim | MongoDB Collection | Created By |
|---|---|---|---|
| Individual user | `accountType: 'user'` | `cl_identity → users` | Self-registration (email/password, Google, Facebook) |
| Organisation | `accountType: 'organisation'` | `cl_identity → organisations` | Self-registration (email/password only) |
| Admin | `accountType: 'admin'` | `cl_identity → admins` | Manually provisioned via script |

**Sign-up is an explicit choice** — the sign-up screen presents "I'm an individual" vs "I'm an organisation" before collecting any details.

**Resolver authorization pattern:**
```typescript
// Content creation (events, jobs, listings) — organisations only
if (context.auth.decodedToken?.accountType !== 'organisation') throw new GraphQLError('Forbidden');

// RSVP, follow, apply — users only
if (context.auth.decodedToken?.accountType !== 'user') throw new GraphQLError('Forbidden');

// Admin dashboard operations
if (context.auth.decodedToken?.accountType !== 'admin') throw new GraphQLError('Forbidden');

// Public browsing — all account types permitted (optional auth)
```

## Authentication Flow

```
[Browser / App]
  1. User/Org signs in via Firebase Auth (client SDK)
  2. Firebase issues an ID token (JWT, ~1hr expiry)
     Token carries custom claims: { accountType: 'user' | 'organisation' | 'admin' }
  3. Client attaches token: Authorization: Bearer <idToken>
  4. Request hits Apollo Router
  5. Router propagates the Authorization header to all subgraphs
  6. Each subgraph calls verifyFirebaseToken(idToken) from @christian-listings/auth
  7. Decoded token attached to GraphQL context:
     { firebaseUid, email, accountType, isAuthenticated, decodedToken }
  8. Resolvers read context.auth to identify caller and enforce authorization
```

Public routes (browse without login) use `buildAuthPlugin({ optional: true })` — token errors are swallowed.

## Database Isolation Strategy

Each subgraph connects to a **separate named database** on the shared MongoDB Atlas cluster using `createMongoConnection(uri, dbName)` from `@christian-listings/db`.

| Subgraph | Database Name |
|----------|--------------|
| subgraph-identity | `cl_identity` |
| subgraph-events | `cl_events` |
| subgraph-classifieds | `cl_classifieds` |
| subgraph-admin | `cl_admin` |

**Why this matters:** Subgraph code physically cannot import another subgraph's Mongoose models. Cross-service data assembly happens only through Federation (runtime query planning) or the `@christian-listings/types` shared interfaces (compile-time TypeScript).

## Media Pipeline

```
[Web App]
  → User selects image/video
  → POST to subgraph mutation (e.g. createMarketplaceItem)
  → Subgraph receives file buffer
  → Calls cloudinaryClient.upload() from @christian-listings/utils
  → Cloudinary returns CDN URL
  → URL stored in MongoDB document
  → URL returned in GraphQL response
  → Web app renders image from Cloudinary CDN
```

Cloudinary handles compression, resizing, format conversion, and CDN delivery. The web app never calls Cloudinary directly.

## Identity Subgraph Data Model

`subgraph-identity` owns four collections inside `cl_identity`:

| Collection | Key Fields | Purpose |
|---|---|---|
| `users` | `firebaseUid`, `email`, `name`, `region`, `regionCode`, `preferences`, `onboardingCompleted` | Individual user profiles |
| `organisations` | `firebaseUid`, `phoneNumber`, `name`, `organisationType`, `missionStatement`, `region`, `regionCode`, `verificationDetails`, `verificationStatus`, `onboardingCompleted`, `followerCount` | Organisation profiles and verification state |
| `admins` | `firebaseUid`, `name`, `email` | Minimal admin identity for audit log display |
| `followrelationships` | `followerFirebaseUid`, `organisationId` | User → Organisation follows (compound unique index) |

**Key design decisions:**
- `region` stores the Google Maps display string (e.g. "London, UK"); `regionCode` stores the normalized filter key (e.g. "GB-LND"). Both are set during onboarding and are nullable until the user completes that step.
- `Organisation.isVerified` is a Mongoose virtual (`verificationStatus === 'VERIFIED'`) — not stored in the database. `verificationStatus` is the single source of truth.
- `Organisation.followerCount` is a denormalized counter updated atomically with `$inc` on every follow/unfollow — never read-then-write.
- `savedItems` are **not** stored in identity. Each subgraph owns its own saved state (events subgraph owns saved events via RSVP stage, classifieds subgraph owns saved jobs/items).

## Content Ownership

All content (events, job listings, marketplace items) is created and owned by **organisations**. Individual users interact with content but never create it.

| Action | Permitted account type |
|---|---|
| Create/edit events, jobs, listings | `organisation` |
| RSVP, apply, follow, save | `user` |
| Moderate, review, ban | `admin` |
| Browse/view (public) | any (unauthenticated allowed) |

## Region Filtering

All list resolvers (events, jobs, marketplace items) filter on `regionCode` for consistent matching:

```typescript
const items = await ItemModel.find({ regionCode: user.regionCode, ...otherFilters });
```

`regionCode` is the normalized region key stored on both `User` and `Organisation` documents. The `x-cl-region` header (propagated by Apollo Router from `router.yaml`) carries this value to subgraphs that don't have direct access to the user's document.

## Moderation Flow (Async Safety)

When a user reports content:
1. A `ModerationReport` document is created in `cl_admin` (via subgraph-admin).
2. The subgraph-admin checks the report count for the flagged content ID.
3. If count reaches **3**, subgraph-admin emits an internal status mutation back to the origin subgraph (currently via a direct HTTP call to the subgraph's health/internal endpoint — to be replaced with a message queue in Phase 2).
4. The origin subgraph sets `status: PENDING_REVIEW` on the document.
5. The content is hidden from public queries while under review.

## Port Map

| Service | Local Port | Docker Internal |
|---------|-----------|-----------------|
| web (Vite dev) | 5173 | web:5173 |
| gateway (Apollo Router) | 4000 | gateway:4000 |
| subgraph-identity | 4001 | identity:4001 |
| subgraph-events | 4002 | events:4002 |
| subgraph-classifieds | 4003 | classifieds:4003 |
| subgraph-admin | 4004 | admin:4004 |
| Apollo Router health | 8088 | gateway:8088 |

## Service Dependency Graph

```
apps/web
  └─ @christian-listings/types (codegen hooks)

apps/gateway
  └─ (no libs — pure config + Router binary)

apps/subgraph-identity
  ├─ @christian-listings/auth
  ├─ @christian-listings/db
  └─ @christian-listings/types

apps/subgraph-events
  ├─ @christian-listings/auth
  ├─ @christian-listings/db
  ├─ @christian-listings/types
  └─ @christian-listings/utils (region helpers)

apps/subgraph-classifieds
  ├─ @christian-listings/auth
  ├─ @christian-listings/db
  ├─ @christian-listings/types
  └─ @christian-listings/utils (CurrencyConverter + Cloudinary)

apps/subgraph-admin
  ├─ @christian-listings/auth
  ├─ @christian-listings/db
  └─ @christian-listings/types
```
