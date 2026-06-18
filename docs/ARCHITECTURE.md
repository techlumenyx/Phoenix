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

## Authentication Flow

```
[Browser / App]
  1. User signs in via Firebase Auth (client SDK)
  2. Firebase issues an ID token (JWT, ~1hr expiry)
  3. Client attaches token: Authorization: Bearer <idToken>
  4. Request hits Apollo Router
  5. Router propagates the Authorization header to all subgraphs
  6. Each subgraph calls verifyFirebaseToken(idToken) from @christian-listings/auth
  7. Decoded user info (firebaseUid, email) is attached to the GraphQL context
  8. Resolvers read context.auth.firebaseUid to identify the caller
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

## Region Filtering

All list resolvers (events, jobs, marketplace items) prepend a `{ region }` filter:

```typescript
const region = getRegionFromRequest(request); // from @christian-listings/utils
const items = await ItemModel.find({ region, ...otherFilters });
```

`getRegionFromRequest` reads the `x-cl-region` request header (set by the web app based on the user's profile region), falls back to the authenticated user's stored region, then defaults to `'GB'`.

The Apollo Router propagates the `x-cl-region` header to all subgraphs (configured in `apps/gateway/router.yaml`).

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
