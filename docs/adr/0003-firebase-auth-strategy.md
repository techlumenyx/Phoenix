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
- `buildAuthContext(request)` — produces `{ firebaseUid, email, isAuthenticated }` for the resolver context

## Consequences

**Positive:**
- Firebase Auth handles token expiry, refresh, MFA, and social login — no custom implementation.
- The `firebaseUid` is a stable, globally unique identifier. User documents in `cl_identity` are keyed by this field.
- All four subgraphs share the same auth plugin from `libs/auth` — no divergence.

**Negative:**
- `FIREBASE_SERVICE_ACCOUNT_JSON` must be base64-encoded to avoid newline issues in env vars — a non-obvious setup step.
- Firebase Admin SDK cold-starts the first verification request. Warm-up time is ~200–500ms on first invocation per container.
- Migrating away from Firebase Auth in the future would require re-keying all User documents.
