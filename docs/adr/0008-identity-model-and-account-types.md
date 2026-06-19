# ADR 0008 — Identity Model and Account Type Separation

**Status:** Accepted

## Context

The platform serves three distinct principals: individual community members, faith organisations, and platform administrators. The initial scaffold treated these as variations of a single "user" concept. As onboarding flows and authorization requirements were defined, it became clear that the three types have meaningfully different data shapes, sign-up paths, and permission scopes.

Key questions resolved during design:
1. Should an organisation be a resource owned by a user (LinkedIn model), or its own account?
2. Should admins share the User collection with an elevated flag, or have their own identity?
3. Where does saved content (events, jobs, items) live — on the User document or in each content subgraph?

## Decision

### Three separate account types in one Firebase project

Each account type has its own Firebase Auth identity and its own MongoDB collection inside `cl_identity`:

| Account Type | Firebase Claim | Collection | Sign-up |
|---|---|---|---|
| User | `accountType: 'user'` | `users` | Email/password, Google, Facebook |
| Organisation | `accountType: 'organisation'` | `organisations` | Email/password only |
| Admin | `accountType: 'admin'` | `admins` | Manual provisioning only |

### Organisation is its own Firebase account

Organisations are not resources owned by a user — they are independent Firebase Auth accounts. The sign-up screen presents an explicit choice: "I'm an individual" vs "I'm an organisation". This was chosen over the LinkedIn model (user creates org pages) because:
- The platform's primary org use case is institutional (churches, charities, NGOs) rather than personal brand pages
- Org accounts have a distinct onboarding flow, verification requirement, and dashboard that differs fundamentally from a user's experience
- Sharing a login between a personal profile and org management adds complexity with little benefit at MVP scale

Consequence: a pastor who wants both a personal user account and to manage their church's organisation page needs two separate logins. This is an accepted trade-off for Phase 1.

### Admin is a separate account type, not a role flag on User

Admins are manually provisioned platform staff with access to a dedicated admin dashboard. They do not have `preferences`, `region`, or other community-facing fields. A minimal `admins` collection stores only `firebaseUid`, `name`, and `email` — the latter two for display in audit logs.

Admins can browse the platform (view events, listings) using their admin account since public read queries permit all authenticated account types. They cannot RSVP, follow, or apply — those mutations are gated to `accountType: 'user'`.

No self-registration path exists for admins. Account creation is done via a bootstrap script that:
1. Creates the Firebase Auth account
2. Sets `accountType: 'admin'` custom claim
3. Inserts the Admin document into `cl_identity`

### Saved content ownership moves to content subgraphs

Saved events, saved jobs, and saved marketplace items are **not** stored on the User document. Each content subgraph owns its own saved state:
- `subgraph-events` — RSVP with `stage: SAVED` covers saved events (no separate collection needed; RSVP stage enum is `INTERESTED | SAVED | CONFIRMED`)
- `subgraph-classifieds` — `SavedJob` and `SavedItem` collections

This eliminates cross-subgraph writes: saving content is a mutation in the subgraph that owns that content, not a mutation in identity.

### Region stored as display string + normalized code

Both `User` and `Organisation` store:
- `region` — human-readable display string from Google Maps API (e.g. "London, UK")
- `regionCode` — normalized filter key (e.g. "GB-LND") indexed for query performance

`region` and `regionCode` are nullable on `User` (collected in onboarding step 1, which is skippable). They are also nullable on `Organisation` (no region step in org onboarding flow; can be set later via profile edit).

### `isVerified` is an Organisation-only virtual

`isVerified` is a platform trust badge awarded to organisations by admins after manual document review. It is **not** a field on `User`. On `Organisation`, it is a Mongoose virtual derived from `verificationStatus === 'VERIFIED'` — not stored in the database. `verificationStatus` (enum: `PENDING_SUBMISSION | PENDING_REVIEW | VERIFIED | REJECTED`) is the single source of truth.

## Consequences

**Positive:**
- Clean separation of concerns — each account type has exactly the fields it needs and nothing else.
- Authorization is simple: `accountType` claim in the JWT is sufficient for 95% of resolver guards, with zero database lookups.
- Content subgraphs own their saved-state collections — no cross-subgraph writes during user interactions.
- `isVerified` virtual cannot get out of sync with `verificationStatus`.

**Negative:**
- A person who is both a community member and an org administrator needs two accounts. Acceptable for Phase 1; revisit in Phase 2 if user research shows this is a significant pain point.
- `followerCount` on `Organisation` is a denormalized counter. Every follow/unfollow must use `$inc`/`$dec` atomically — a bug in this logic would cause drift from the actual follow count. Consider a periodic reconciliation job in Phase 2.
