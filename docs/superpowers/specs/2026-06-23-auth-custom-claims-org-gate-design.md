# Auth Custom Claims, Token Refresh & Org Name Gate

**Date:** 2026-06-23
**Scope:** Points 3 & 4 of the auth setup plan — custom claims after account creation, forced token refresh, and the org name gate.

---

## Context

Firebase Auth handles authentication. MongoDB (via subgraph-identity) holds the application user/org records. The two are linked by `firebaseUid`. Custom token claims (`accountType: 'user' | 'organisation'`) allow resolvers across all subgraphs to gate operations by account type.

Currently:
- `subgraph-identity` resolvers are empty (`const resolvers = {}`)
- No `createUser` mutation exists in the schema
- Apollo Client is not initialised in the web app
- Signup creates a Firebase account but never creates a MongoDB document

---

## Section 1 — Backend: Schema + Resolvers

### 1.1 Schema changes (`apps/subgraph-identity/src/schema/identity.graphql`)

Add `createUser` mutation and input:

```graphql
type Mutation {
  createUser(input: CreateUserInput!): User!       # NEW
  updateProfile(input: UpdateProfileInput!): User!
  createOrganisation(input: CreateOrganisationInput!): Organisation!
  ...
}

input CreateUserInput {
  name: String!
}
```

Make `region` optional in `CreateOrganisationInput` (orgs supply it later during onboarding):

```graphql
input CreateOrganisationInput {
  name: String!
  description: String
  logoUrl: String
  region: String        # was String! — now optional
  websiteUrl: String
}
```

### 1.2 Resolver files

Create `apps/subgraph-identity/src/resolvers/`:

```
resolvers/
  mutation.createUser.ts
  mutation.createOrganisation.ts
  index.ts
```

**`mutation.createUser.ts`**

```
Preconditions: context.auth.isAuthenticated (throw GraphQL UNAUTHENTICATED if not)
Idempotent guard: if User with firebaseUid already exists in MongoDB → return it
Steps:
  1. admin.auth().setCustomUserClaims(firebaseUid, { accountType: 'user' })
  2. UserModel.create({ firebaseUid, email, name, ... defaults })
  3. Return the created document mapped to GraphQL User shape
```

Fields on new User document: `firebaseUid`, `email` (both from `context.auth`), `name` (from input), `region: null`, `regionCode: null`, `preferences: []`, `onboardingCompleted: false`, `roles: []`, `orgId: null`.

**`mutation.createOrganisation.ts`**

```
Preconditions: context.auth.isAuthenticated
Idempotent guard: if Organisation with createdBy === firebaseUid already exists → return it
Steps:
  1. admin.auth().setCustomUserClaims(firebaseUid, { accountType: 'organisation' })
  2. OrganisationModel.create({ createdBy: firebaseUid, name, region: null, ... defaults })
  3. Return created document mapped to GraphQL Organisation shape
```

Fields on new Organisation document: `createdBy` (from context), `name` (from input), `region: null`, `regionCode: null`, `verificationStatus: 'PENDING_SUBMISSION'`, `isVerified: false`, `onboardingCompleted: false`, `followerCount: 0`.

**`index.ts`** — merges and exports both mutation resolvers as the resolvers map used by `buildSubgraphSchema`.

### 1.3 Wire into main.ts

Replace:
```ts
const resolvers = {};
```
With:
```ts
import { resolvers } from './resolvers';
```

### 1.4 After schema changes

Run in order:
```bash
nx run-many --target=codegen --all
tools\scripts\compose-supergraph.bat
```

Commit: schema file + supergraph + generated types together.

---

## Section 2 — Apollo Client Setup

### 2.1 New file: `apps/christian-listing/src/lib/apollo-client.ts`

```ts
// Auth link: reads a fresh Firebase token before every request (not cached)
// HTTP link: points to process.env['CL_GRAPHQL_URL']
// Combined with ApolloLink.from([authLink, httpLink])
// Exported as a singleton ApolloClient with InMemoryCache
```

The auth link calls `getAuth().currentUser?.getIdToken()` (no `true` here — we only force-refresh explicitly after mutations that set claims). If no user, sends the request without an Authorization header (allows public queries).

### 2.2 Update `apps/christian-listing/src/main.tsx`

Wrap `<RouterProvider>` in `<ApolloProvider client={apolloClient}>`.

---

## Section 3 — Regular User Signup (Points 3 & 4)

### 3.1 GraphQL documents

New file: `apps/christian-listing/src/graphql/mutations.ts`

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    firebaseUid
    email
    name
  }
}

mutation CreateOrganisation($input: CreateOrganisationInput!) {
  createOrganisation(input: $input) {
    id
    name
  }
}
```

### 3.2 SignUpPage.tsx changes

After the existing `createUserWithEmailAndPassword` + `updateProfile` calls, append:

```
1. await createUser({ variables: { input: { name } } })   ← point 3
2. await getAuth().currentUser?.getIdToken(true)           ← point 4 (force refresh)
3. navigate('/')
```

Show a user-facing error if the mutation fails (e.g. "Account setup failed — please try again").

### 3.3 SignInModal.tsx signup tab

Same three steps appended to the existing signup handler.

**Error handling:** If `createUser` throws, do NOT sign the user out of Firebase. The mutation is idempotent — they can retry. Show the error inline, keep the form open.

---

## Section 4 — Org Flow: `/org/signup` + `/org/setup` Gate

### 4.1 Auth store update (`apps/christian-listing/src/store/authStore.ts`)

Add to `AuthState`:
```ts
accountType: 'user' | 'organisation' | 'admin' | null;
```

In the `onAuthStateChanged` callback, after setting `user`:
```ts
if (user) {
  const result = await user.getIdTokenResult();
  const accountType = (result.claims['accountType'] as string) ?? null;
  useAuthStore.setState({ accountType });
} else {
  useAuthStore.setState({ accountType: null });
}
```

Navigation is NOT done in the auth store (no router imports in stores). The `accountType` value drives two things: `OrgSignupPage` always navigates to `/org/setup` after auth; `ProtectedRoute` reads `accountType` from the store and redirects org users to `/org/setup` (see 4.4). The setup page itself decides whether to show the gate or pass through.

### 4.2 New page: `OrgSignupPage.tsx` at `/org/signup` (public)

UI: Firebase email/password form + Google sign-in button (mirrors `SignInPage` style).

After successful Firebase auth:
```
navigate('/org/setup')   // always — setup page decides whether to gate or pass through
```

No mutation here. This page is auth-only.

### 4.3 New page: `OrgSetupPage.tsx` at `/org/setup` (semi-protected)

**On mount:**
1. If `!user` → redirect to `/org/signup`
2. Run `myOrganisations` query (Apollo)
3. If query returns an org with a non-empty `name` → `navigate('/dashboard', { replace: true })`
4. Otherwise → render the name gate

**Name gate UI:**
- Heading: "Name your organisation"
- Single required text input: "Organisation name"
- "Continue" button (disabled while loading)
- No close/skip option

**On submit:**
```
1. await createOrganisation({ variables: { input: { name } } })   ← point 3
2. await getAuth().currentUser?.getIdToken(true)                   ← point 4
3. useAuthStore.setState({ accountType: 'organisation' })
4. navigate('/dashboard', { replace: true })
```

**Error handling:** Show inline error on mutation failure. Do not navigate away.

### 4.4 "Every login" guarantee

The `authStore`'s `onAuthStateChanged` fires on every login. It reads `accountType` from the token. If the org user navigates to any protected route (e.g. `/dashboard`), `ProtectedRoute` checks:

```ts
if (accountType === 'organisation') {
  // redirect to /org/setup — setup page passes through if org already has a name
  return <Navigate to="/org/setup" replace />;
}
```

This guarantees that on every login where the org has no name, they cannot reach the dashboard.

### 4.5 Router additions

```ts
// public routes
{ path: 'org/signup', element: <OrgSignupPage /> }
{ path: 'org/setup',  element: <OrgSetupPage />  }
```

Both added as siblings to `signin` and `signup` under `RootLayout`.

---

## Data Flow Summary

```
User signup:
  Firebase createUser → updateProfile → createUser mutation
  → setCustomUserClaims({ accountType: 'user' })
  → MongoDB User doc created
  → getIdToken(true) → claim live in next request

Org first login:
  /org/signup → Firebase auth → navigate('/org/setup')
  → myOrganisations query → no org found → show name gate
  → createOrganisation mutation
  → setCustomUserClaims({ accountType: 'organisation' })
  → MongoDB Organisation doc created
  → getIdToken(true) → navigate('/dashboard')

Org return login (no name):
  Any login → authStore reads claim → ProtectedRoute redirects to /org/setup
  → myOrganisations query → no name → show name gate → same as above

Org return login (name set):
  Any login → ProtectedRoute redirects to /org/setup
  → myOrganisations query → org with name found → navigate('/dashboard')
```

---

## Files Changed

| File | Change |
|------|--------|
| `apps/subgraph-identity/src/schema/identity.graphql` | Add `createUser` mutation + input; make `region` optional in `CreateOrganisationInput` |
| `apps/subgraph-identity/src/resolvers/mutation.createUser.ts` | New |
| `apps/subgraph-identity/src/resolvers/mutation.createOrganisation.ts` | New |
| `apps/subgraph-identity/src/resolvers/index.ts` | New |
| `apps/subgraph-identity/src/main.ts` | Import and wire resolvers |
| `apps/christian-listing/src/lib/apollo-client.ts` | New |
| `apps/christian-listing/src/main.tsx` | Wrap with ApolloProvider |
| `apps/christian-listing/src/graphql/mutations.ts` | New — CREATE_USER + CREATE_ORGANISATION documents |
| `apps/christian-listing/src/store/authStore.ts` | Add `accountType` field |
| `apps/christian-listing/src/pages/SignUpPage.tsx` | Add createUser mutation + force refresh |
| `apps/christian-listing/src/components/layout/SignInModal.tsx` | Add createUser mutation + force refresh to signup tab |
| `apps/christian-listing/src/pages/OrgSignupPage.tsx` | New |
| `apps/christian-listing/src/pages/OrgSetupPage.tsx` | New |
| `apps/christian-listing/src/components/routing/ProtectedRoute.tsx` | Add org accountType redirect |
| `apps/christian-listing/src/router/index.tsx` | Add org/signup and org/setup routes |
| `apps/subgraph-identity/src/resolvers/query.myOrganisations.ts` | New — required by OrgSetupPage |

---

## Out of Scope

- Admin provisioning (separate script, separate task)
- Org onboarding steps beyond the name gate (region, description, logo)
- Facebook OAuth wiring (Firebase provider setup is a console task)
- `updateProfile` and `updateOrganisation` resolver implementations
