# ADR 0003 — Firebase Auth Strategy

**Status:** Accepted

## Context

Authentication is a prerequisite for every protected operation. The Firebase project already exists and is configured. Options:
1. Custom JWT implementation with a User table
2. Auth0 or similar third-party service
3. Continue using Firebase Auth

## Decision

Use **Firebase Auth** for the full client token lifecycle (sign-up, sign-in, token refresh, password reset, social providers). Backend services use the **Firebase Admin SDK exclusively for token verification** — they never create, update, or delete Firebase users.

Shared auth logic lives in `libs/auth`:
- `getFirebaseAdmin()` — lazy singleton initialised from `FIREBASE_SERVICE_ACCOUNT_JSON`
- `verifyFirebaseToken(idToken)` — verifies and decodes the JWT
- `buildAuthPlugin({ optional })` — Fastify `onRequest` hook factory
- `buildAuthContext(request)` — produces `{ firebaseUid, email, accountType, isAuthenticated, decodedToken }` for the resolver context

### Account types and custom claims

The platform has three account types, differentiated via **Firebase custom claims** set at registration:

| Account Type | Custom Claim | Sign-up Method | Notes |
|---|---|---|---|
| Individual user | `accountType: 'user'` | Email/password, Google, Facebook | Self-registration |
| Organisation | `accountType: 'organisation'` | Email/password only | Has own Firebase Auth account |
| Admin | `accountType: 'admin'` | Email/password only | Manually provisioned, no self-registration |

Custom claims are set immediately after Firebase account creation via `admin.auth().setCustomUserClaims(uid, { accountType })`. Every subsequent token issued by Firebase carries these claims — resolvers read `context.auth.decodedToken.accountType` to enforce authorization without a database lookup.

**Sign-up is a deliberate choice** — the sign-up screen presents "I'm an individual" vs "I'm an organisation" before collecting credentials. Organisation accounts are separate Firebase Auth identities, not resources owned by a user account.

**Admin provisioning** is intentionally manual: a bootstrap script creates the Firebase Auth account, sets `accountType: 'admin'`, and inserts the minimal Admin document into `cl_identity`. There is no self-registration path for admins.

## Consequences

**Positive:**
- Firebase Auth handles token expiry, refresh, MFA, and social login — no custom implementation.
- The `firebaseUid` is a stable, globally unique identifier used as the primary link between Firebase Auth and MongoDB documents across all three account types.
- All four subgraphs share the same auth plugin from `libs/auth` — no divergence.
- Custom claims are embedded in the JWT — account type checks in resolvers require zero extra database queries.

**Negative:**
- `FIREBASE_SERVICE_ACCOUNT_JSON` must be base64-encoded to avoid newline issues in env vars — a non-obvious setup step.
- Firebase Admin SDK cold-starts the first verification request. Warm-up time is ~200–500ms on first invocation per container.
- Custom claims are cached in the token until it expires (~1hr). If an account type changes (rare), the user must re-authenticate to pick up the new claim.
- Migrating away from Firebase Auth in the future would require re-keying all documents across three collections in `cl_identity`.
