# Auth Custom Claims, Token Refresh & Org Name Gate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up Firebase custom claims (`accountType`) immediately after account creation, force a token refresh so the claim is live on the next request, and gate org users behind a name-entry screen they cannot bypass.

**Architecture:** Backend resolvers set custom claims then create MongoDB documents. The web app calls those resolvers after Firebase auth, force-refreshes the token, and — for org users — redirects every login through `/org/setup`, which passes through to the dashboard when the org already has a name.

**Tech Stack:** Fastify + Apollo Server 4 + `firebase-admin` (backend), React 18 + Apollo Client 3 + Firebase JS SDK + Zustand (frontend), MongoDB/Mongoose, Jest, Nx monorepo.

## Global Constraints

- Import `@christian-listings/db`, `@christian-listings/auth`, etc. — never reach across subgraph `src/` boundaries.
- Use `createMongoConnection` from `@christian-listings/db`; never call `mongoose.connect()` directly.
- All resolvers call `buildAuthContext(request)` via the existing `context.ts` — never replicate token verification.
- Firebase Admin is already initialised by `@christian-listings/auth` at server start; import `getAuth` from `firebase-admin/auth` directly in resolvers.
- Tailwind classes only — no inline styles except where they already exist in the file being modified.
- Run `nx run-many --target=codegen --all` then `tools\scripts\compose-supergraph.bat` after every `.graphql` change; commit schema + supergraph + generated types together.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/subgraph-identity/src/schema/identity.graphql` | Modify | Add `createUser` mutation + input; loosen `Organisation` nullability |
| `apps/subgraph-identity/src/models/user.model.ts` | Modify | Export `UserModel` |
| `apps/subgraph-identity/src/models/organisation.model.ts` | Modify | Export `OrganisationModel`; make `phoneNumber` non-required |
| `apps/subgraph-identity/src/resolvers/mutation.createUser.ts` | Create | Resolver: claim + MongoDB User doc |
| `apps/subgraph-identity/src/resolvers/mutation.createOrganisation.ts` | Create | Resolver: claim + MongoDB Organisation doc |
| `apps/subgraph-identity/src/resolvers/query.myOrganisations.ts` | Create | Resolver: fetch caller's orgs |
| `apps/subgraph-identity/src/resolvers/index.ts` | Create | Merge and export resolvers map |
| `apps/subgraph-identity/src/main.ts` | Modify | Import resolvers |
| `apps/christian-listing/src/lib/apollo-client.ts` | Create | ApolloClient singleton with auth link |
| `apps/christian-listing/src/main.tsx` | Modify | Wrap app in ApolloProvider |
| `apps/christian-listing/src/graphql/mutations.ts` | Create | `CREATE_USER`, `CREATE_ORGANISATION`, `MY_ORGANISATIONS` documents |
| `apps/christian-listing/src/pages/SignUpPage.tsx` | Modify | Add `createUser` mutation + force refresh |
| `apps/christian-listing/src/components/layout/SignInModal.tsx` | Modify | Add `createUser` mutation + force refresh to signup handler |
| `apps/christian-listing/src/store/authStore.ts` | Modify | Add `accountType` field from token claims |
| `apps/christian-listing/src/pages/OrgSignupPage.tsx` | Create | Firebase auth form for orgs |
| `apps/christian-listing/src/pages/OrgSetupPage.tsx` | Create | Org name gate — blocks without name |
| `apps/christian-listing/src/components/routing/ProtectedRoute.tsx` | Modify | Redirect org users to `/org/setup` |
| `apps/christian-listing/src/router/index.tsx` | Modify | Add `org/signup` and `org/setup` routes |

---

### Task 1: Schema + Model Prep

**Files:**
- Modify: `apps/subgraph-identity/src/schema/identity.graphql`
- Modify: `apps/subgraph-identity/src/models/user.model.ts`
- Modify: `apps/subgraph-identity/src/models/organisation.model.ts`

**Interfaces:**
- Produces: `UserModel` (Mongoose model), `OrganisationModel` (Mongoose model), updated GraphQL schema with `createUser` mutation

- [ ] **Step 1: Add `createUser` mutation and loosen Organisation nullability in the GraphQL schema**

Open `apps/subgraph-identity/src/schema/identity.graphql`. Make these changes:

Change `Organisation.region` from `String!` to `String` (org won't have a region at creation time):
```graphql
type Organisation @key(fields: "id") {
  id: ID!
  name: String!
  description: String
  logoUrl: String
  region: String
  isVerified: Boolean!
  verificationTier: VerificationTier!
  followerCount: Int!
  websiteUrl: String
  socialLinks: SocialLinks
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

Add `createUser` to the `Mutation` type (insert before `updateProfile`):
```graphql
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateProfile(input: UpdateProfileInput!): User!
  createOrganisation(input: CreateOrganisationInput!): Organisation!
  updateOrganisation(id: ID!, input: UpdateOrganisationInput!): Organisation!
  submitVerification(organisationId: ID!, documentUrls: [String!]!): VerificationRequest!
}
```

Add `CreateUserInput` after the existing `SocialLinksInput`:
```graphql
input CreateUserInput {
  name: String!
}
```

Change `region` in `CreateOrganisationInput` from `String!` to `String`:
```graphql
input CreateOrganisationInput {
  name: String!
  description: String
  logoUrl: String
  region: String
  websiteUrl: String
}
```

- [ ] **Step 2: Export `UserModel` from the user model file**

At the bottom of `apps/subgraph-identity/src/models/user.model.ts`, add:
```typescript
export const UserModel =
  (mongoose.models['User'] as mongoose.Model<IUser>) ??
  mongoose.model<IUser>('User', UserSchema);
```

- [ ] **Step 3: Export `OrganisationModel` and remove `phoneNumber` required constraint**

In `apps/subgraph-identity/src/models/organisation.model.ts`:

Change `phoneNumber` from `required: true` to `default: null` (phone is collected during onboarding step 1, not during the name gate):
```typescript
phoneNumber:  { type: String, default: null },
```

At the bottom of the file, add:
```typescript
export const OrganisationModel =
  (mongoose.models['Organisation'] as mongoose.Model<IOrganisation>) ??
  mongoose.model<IOrganisation>('Organisation', OrganisationSchema);
```

- [ ] **Step 4: Commit schema + model prep**

```bash
git add apps/subgraph-identity/src/schema/identity.graphql \
        apps/subgraph-identity/src/models/user.model.ts \
        apps/subgraph-identity/src/models/organisation.model.ts
git commit -m "feat(identity): add createUser schema, export models, loosen org nullability"
```

---

### Task 2: `createUser` Resolver

**Files:**
- Create: `apps/subgraph-identity/src/resolvers/mutation.createUser.ts`
- Create: `apps/subgraph-identity/src/resolvers/mutation.createUser.spec.ts`

**Interfaces:**
- Consumes: `UserModel` from `../models/user.model`, `GraphQLContext` from `../context`, `getAuth` from `firebase-admin/auth`
- Produces: `createUser(_, args, context)` — async resolver function, default export

- [ ] **Step 1: Create the test file**

Create `apps/subgraph-identity/src/resolvers/mutation.createUser.spec.ts`:

```typescript
import { GraphQLError } from 'graphql';

const mockSetCustomUserClaims = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ setCustomUserClaims: mockSetCustomUserClaims }),
}));

jest.mock('../models/user.model', () => ({
  UserModel: { findOne: mockFindOne, create: mockCreate },
}));

import { createUser } from './mutation.createUser';

const baseContext = {
  auth: {
    isAuthenticated: true,
    firebaseUid: 'uid-abc',
    email: 'test@example.com',
    decodedToken: null,
  },
  request: {} as never,
};

beforeEach(() => jest.clearAllMocks());

describe('createUser', () => {
  it('throws UNAUTHENTICATED when not logged in', async () => {
    const ctx = { ...baseContext, auth: { ...baseContext.auth, isAuthenticated: false } };
    await expect(createUser({}, { input: { name: 'John' } }, ctx)).rejects.toThrow(GraphQLError);
  });

  it('returns existing user without re-creating', async () => {
    const existing = { _id: 'id1', firebaseUid: 'uid-abc', name: 'John' };
    mockFindOne.mockResolvedValue(existing);
    const result = await createUser({}, { input: { name: 'John' } }, baseContext);
    expect(result).toBe(existing);
    expect(mockSetCustomUserClaims).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('sets custom claim and creates user document', async () => {
    mockFindOne.mockResolvedValue(null);
    const created = { _id: 'id2', firebaseUid: 'uid-abc', email: 'test@example.com', name: 'John' };
    mockCreate.mockResolvedValue(created);

    const result = await createUser({}, { input: { name: 'John' } }, baseContext);

    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('uid-abc', { accountType: 'user' });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ firebaseUid: 'uid-abc', email: 'test@example.com', name: 'John' }),
    );
    expect(result).toBe(created);
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx nx test subgraph-identity --testFile=src/resolvers/mutation.createUser.spec.ts
```

Expected: `Cannot find module './mutation.createUser'`

- [ ] **Step 3: Implement the resolver**

Create `apps/subgraph-identity/src/resolvers/mutation.createUser.ts`:

```typescript
import { getAuth } from 'firebase-admin/auth';
import { GraphQLError } from 'graphql';
import { UserModel } from '../models/user.model';
import type { GraphQLContext } from '../context';

export async function createUser(
  _: unknown,
  args: { input: { name: string } },
  context: GraphQLContext,
) {
  if (!context.auth.isAuthenticated || !context.auth.firebaseUid) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  }

  const { firebaseUid, email } = context.auth;

  const existing = await UserModel.findOne({ firebaseUid });
  if (existing) return existing;

  await getAuth().setCustomUserClaims(firebaseUid, { accountType: 'user' });

  return UserModel.create({
    firebaseUid,
    email,
    name: args.input.name,
    region: null,
    regionCode: null,
    preferences: [],
    onboardingCompleted: false,
    roles: [],
    orgId: null,
    orgInvitedBy: null,
    orgJoinedAt: null,
  });
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx nx test subgraph-identity --testFile=src/resolvers/mutation.createUser.spec.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/subgraph-identity/src/resolvers/mutation.createUser.ts \
        apps/subgraph-identity/src/resolvers/mutation.createUser.spec.ts
git commit -m "feat(identity): implement createUser resolver with custom claim"
```

---

### Task 3: `createOrganisation` + `myOrganisations` Resolvers

**Files:**
- Create: `apps/subgraph-identity/src/resolvers/mutation.createOrganisation.ts`
- Create: `apps/subgraph-identity/src/resolvers/mutation.createOrganisation.spec.ts`
- Create: `apps/subgraph-identity/src/resolvers/query.myOrganisations.ts`
- Create: `apps/subgraph-identity/src/resolvers/query.myOrganisations.spec.ts`

**Interfaces:**
- Consumes: `OrganisationModel` from `../models/organisation.model`, `GraphQLContext` from `../context`
- Produces: `createOrganisation(_, args, context)`, `myOrganisations(_, __, context)`

- [ ] **Step 1: Create the createOrganisation test file**

Create `apps/subgraph-identity/src/resolvers/mutation.createOrganisation.spec.ts`:

```typescript
import { GraphQLError } from 'graphql';

const mockSetCustomUserClaims = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ setCustomUserClaims: mockSetCustomUserClaims }),
}));

jest.mock('../models/organisation.model', () => ({
  OrganisationModel: { findOne: mockFindOne, create: mockCreate },
}));

import { createOrganisation } from './mutation.createOrganisation';

const baseContext = {
  auth: {
    isAuthenticated: true,
    firebaseUid: 'uid-org',
    email: 'org@example.com',
    decodedToken: null,
  },
  request: {} as never,
};

beforeEach(() => jest.clearAllMocks());

describe('createOrganisation', () => {
  it('throws UNAUTHENTICATED when not logged in', async () => {
    const ctx = { ...baseContext, auth: { ...baseContext.auth, isAuthenticated: false } };
    await expect(createOrganisation({}, { input: { name: 'My Church' } }, ctx)).rejects.toThrow(GraphQLError);
  });

  it('returns existing org without re-creating', async () => {
    const existing = { _id: 'org1', createdBy: 'uid-org', name: 'My Church' };
    mockFindOne.mockResolvedValue(existing);
    const result = await createOrganisation({}, { input: { name: 'My Church' } }, baseContext);
    expect(result).toBe(existing);
    expect(mockSetCustomUserClaims).not.toHaveBeenCalled();
  });

  it('sets organisation claim and creates org document', async () => {
    mockFindOne.mockResolvedValue(null);
    const created = { _id: 'org2', createdBy: 'uid-org', name: 'My Church' };
    mockCreate.mockResolvedValue(created);

    const result = await createOrganisation({}, { input: { name: 'My Church' } }, baseContext);

    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('uid-org', { accountType: 'organisation' });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'uid-org', name: 'My Church' }),
    );
    expect(result).toBe(created);
  });
});
```

- [ ] **Step 2: Create the myOrganisations test file**

Create `apps/subgraph-identity/src/resolvers/query.myOrganisations.spec.ts`:

```typescript
const mockFind = jest.fn();

jest.mock('../models/organisation.model', () => ({
  OrganisationModel: { find: mockFind },
}));

import { myOrganisations } from './query.myOrganisations';

const authedContext = {
  auth: { isAuthenticated: true, firebaseUid: 'uid-org', email: 'org@example.com', decodedToken: null },
  request: {} as never,
};

const anonContext = {
  auth: { isAuthenticated: false, firebaseUid: null, email: null, decodedToken: null },
  request: {} as never,
};

beforeEach(() => jest.clearAllMocks());

describe('myOrganisations', () => {
  it('returns empty array when unauthenticated', async () => {
    const result = await myOrganisations({}, {}, anonContext);
    expect(result).toEqual([]);
    expect(mockFind).not.toHaveBeenCalled();
  });

  it('queries orgs by createdBy firebaseUid', async () => {
    const orgs = [{ _id: 'org1', name: 'My Church' }];
    mockFind.mockResolvedValue(orgs);
    const result = await myOrganisations({}, {}, authedContext);
    expect(mockFind).toHaveBeenCalledWith({ createdBy: 'uid-org' });
    expect(result).toBe(orgs);
  });
});
```

- [ ] **Step 3: Run both test files and confirm they fail**

```bash
npx nx test subgraph-identity --testFile=src/resolvers/mutation.createOrganisation.spec.ts
npx nx test subgraph-identity --testFile=src/resolvers/query.myOrganisations.spec.ts
```

Expected: both fail with `Cannot find module`.

- [ ] **Step 4: Implement createOrganisation**

Create `apps/subgraph-identity/src/resolvers/mutation.createOrganisation.ts`:

```typescript
import { getAuth } from 'firebase-admin/auth';
import { GraphQLError } from 'graphql';
import { OrganisationModel } from '../models/organisation.model';
import type { GraphQLContext } from '../context';

export async function createOrganisation(
  _: unknown,
  args: { input: { name: string; region?: string | null } },
  context: GraphQLContext,
) {
  if (!context.auth.isAuthenticated || !context.auth.firebaseUid) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  }

  const { firebaseUid } = context.auth;

  const existing = await OrganisationModel.findOne({ createdBy: firebaseUid });
  if (existing) return existing;

  await getAuth().setCustomUserClaims(firebaseUid, { accountType: 'organisation' });

  return OrganisationModel.create({
    createdBy: firebaseUid,
    name: args.input.name,
    region: args.input.region ?? null,
    regionCode: null,
    verificationStatus: 'PENDING_SUBMISSION',
    onboardingCompleted: false,
    followerCount: 0,
  });
}
```

- [ ] **Step 5: Implement myOrganisations**

Create `apps/subgraph-identity/src/resolvers/query.myOrganisations.ts`:

```typescript
import { OrganisationModel } from '../models/organisation.model';
import type { GraphQLContext } from '../context';

export async function myOrganisations(
  _: unknown,
  __: unknown,
  context: GraphQLContext,
) {
  if (!context.auth.isAuthenticated || !context.auth.firebaseUid) return [];
  return OrganisationModel.find({ createdBy: context.auth.firebaseUid });
}
```

- [ ] **Step 6: Run tests and confirm they pass**

```bash
npx nx test subgraph-identity --testFile=src/resolvers/mutation.createOrganisation.spec.ts
npx nx test subgraph-identity --testFile=src/resolvers/query.myOrganisations.spec.ts
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/subgraph-identity/src/resolvers/
git commit -m "feat(identity): implement createOrganisation and myOrganisations resolvers"
```

---

### Task 4: Wire Resolvers + Codegen

**Files:**
- Create: `apps/subgraph-identity/src/resolvers/index.ts`
- Modify: `apps/subgraph-identity/src/main.ts`

**Interfaces:**
- Consumes: `createUser`, `createOrganisation`, `myOrganisations` from the resolver files
- Produces: resolvers map wired into `buildSubgraphSchema`

- [ ] **Step 1: Create the resolvers index**

Create `apps/subgraph-identity/src/resolvers/index.ts`:

```typescript
import { createUser } from './mutation.createUser';
import { createOrganisation } from './mutation.createOrganisation';
import { myOrganisations } from './query.myOrganisations';

export const resolvers = {
  Query: {
    myOrganisations,
  },
  Mutation: {
    createUser,
    createOrganisation,
  },
};
```

- [ ] **Step 2: Wire resolvers into main.ts**

In `apps/subgraph-identity/src/main.ts`, replace:

```typescript
const resolvers = {};
```

With:

```typescript
import { resolvers } from './resolvers';
```

Move the import to the top of the file with the other imports.

- [ ] **Step 3: Run codegen**

```bash
nx run-many --target=codegen --all
```

Expected: completes without errors, generated types updated.

- [ ] **Step 4: Recompose the supergraph**

```bash
tools\scripts\compose-supergraph.bat
```

Expected: `supergraph.graphql` updated.

- [ ] **Step 5: Verify the subgraph builds**

```bash
npx nx build subgraph-identity
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add apps/subgraph-identity/src/resolvers/index.ts \
        apps/subgraph-identity/src/main.ts \
        supergraph.graphql
git add -u  # picks up any codegen output changes
git commit -m "feat(identity): wire resolvers into subgraph, run codegen"
```

---

### Task 5: Apollo Client Setup

**Files:**
- Create: `apps/christian-listing/src/lib/apollo-client.ts`
- Modify: `apps/christian-listing/src/main.tsx`

**Interfaces:**
- Produces: `apolloClient` singleton (ApolloClient instance) consumed by ApolloProvider

- [ ] **Step 1: Create the Apollo Client module**

Create `apps/christian-listing/src/lib/apollo-client.ts`:

```typescript
import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAuth } from 'firebase/auth';

const httpLink = createHttpLink({
  uri: process.env['CL_GRAPHQL_URL'] ?? 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const user = getAuth().currentUser;
  const token = user ? await user.getIdToken() : null;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
```

- [ ] **Step 2: Wrap the app in ApolloProvider**

Replace the contents of `apps/christian-listing/src/main.tsx` with:

```typescript
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apollo-client';
import router from './router';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </StrictMode>
);
```

- [ ] **Step 3: Verify the web app builds**

```bash
npx nx build christian-listing
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/christian-listing/src/lib/apollo-client.ts \
        apps/christian-listing/src/main.tsx
git commit -m "feat(web): initialise Apollo Client with Firebase auth link"
```

---

### Task 6: User Signup Mutations (Points 3 & 4)

**Files:**
- Create: `apps/christian-listing/src/graphql/mutations.ts`
- Modify: `apps/christian-listing/src/pages/SignUpPage.tsx`
- Modify: `apps/christian-listing/src/components/layout/SignInModal.tsx`

**Interfaces:**
- Consumes: `apolloClient` (via `useMutation` hook), `getAuth` from Firebase JS SDK
- Produces: `CREATE_USER` and `CREATE_ORGANISATION` gql documents; `MY_ORGANISATIONS` query document

- [ ] **Step 1: Create the GraphQL documents file**

Create `apps/christian-listing/src/graphql/mutations.ts`:

```typescript
import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      firebaseUid
      email
      name
    }
  }
`;

export const CREATE_ORGANISATION = gql`
  mutation CreateOrganisation($input: CreateOrganisationInput!) {
    createOrganisation(input: $input) {
      id
      name
    }
  }
`;

export const MY_ORGANISATIONS = gql`
  query MyOrganisations {
    myOrganisations {
      id
      name
    }
  }
`;
```

- [ ] **Step 2: Update SignUpPage.tsx to call createUser and force token refresh**

Replace the entire file `apps/christian-listing/src/pages/SignUpPage.tsx` with:

```typescript
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, getAuth } from 'firebase/auth';
import { useMutation } from '@apollo/client';
import { firebaseAuth } from '../firebase';
import { CREATE_USER } from '../graphql/mutations';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createUser] = useMutation(CREATE_USER);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(user, { displayName: name });
      await createUser({ variables: { input: { name } } });
      await getAuth().currentUser?.getIdToken(true);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">Create an account</h1>
        <p className="text-sm text-gray-500 mb-6">Join the Christian Listings community.</p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="name">Full name</label>
            <input
              id="name" type="text" required value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input
              id="password" type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              placeholder="Min. 6 characters"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="mt-2 w-full py-2.5 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold hover:bg-[#b8965e] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#1B1B1B] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update SignInModal.tsx signup handler**

In `apps/christian-listing/src/components/layout/SignInModal.tsx`, add the `useMutation` import and `CREATE_USER` import at the top:

```typescript
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '../../graphql/mutations';
```

Inside the `SignInModal` component, add the mutation hook (below the existing state declarations):

```typescript
const [createUser] = useMutation(CREATE_USER);
```

Replace `handleSignUp` with:

```typescript
async function handleSignUp(e: FormEvent) {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const { user } = await createUserWithEmailAndPassword(firebaseAuth, signupEmail, signupPassword);
    if (fullName) await updateProfile(user, { displayName: fullName });
    await createUser({ variables: { input: { name: fullName } } });
    await getAuth().currentUser?.getIdToken(true);
    close();
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Sign up failed.');
  } finally {
    setLoading(false);
  }
}
```

Also add `getAuth` to the existing firebase/auth import line:

```typescript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
  getAuth,
} from 'firebase/auth';
```

- [ ] **Step 4: Verify the web app builds**

```bash
npx nx build christian-listing
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/christian-listing/src/graphql/mutations.ts \
        apps/christian-listing/src/pages/SignUpPage.tsx \
        apps/christian-listing/src/components/layout/SignInModal.tsx
git commit -m "feat(web): call createUser mutation and force token refresh after signup"
```

---

### Task 7: Auth Store — `accountType` Field

**Files:**
- Modify: `apps/christian-listing/src/store/authStore.ts`

**Interfaces:**
- Produces: `accountType: string | null` on `AuthState`, read by `ProtectedRoute` and `OrgSetupPage`

- [ ] **Step 1: Update the auth store**

Replace the entire contents of `apps/christian-listing/src/store/authStore.ts`:

```typescript
import { create } from 'zustand';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { firebaseAuth } from '../firebase';

interface AuthState {
  user: User | null;
  accountType: string | null;
  /** True once OrgSetupPage has confirmed the org has a name this session. Resets on page refresh. */
  orgSetupChecked: boolean;
  loading: boolean;
  initialized: boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accountType: null,
  orgSetupChecked: false,
  loading: true,
  initialized: false,

  logout: async () => {
    await signOut(firebaseAuth);
  },
}));

onAuthStateChanged(firebaseAuth, async (user) => {
  if (user) {
    const result = await user.getIdTokenResult();
    const accountType = (result.claims['accountType'] as string) ?? null;
    // Reset orgSetupChecked on every login so OrgSetupPage re-validates each session.
    useAuthStore.setState({ user, accountType, orgSetupChecked: false, loading: false, initialized: true });
  } else {
    useAuthStore.setState({ user: null, accountType: null, orgSetupChecked: false, loading: false, initialized: true });
  }
});
```

- [ ] **Step 2: Verify the web app builds**

```bash
npx nx build christian-listing
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/christian-listing/src/store/authStore.ts
git commit -m "feat(web): add accountType to auth store from Firebase token claims"
```

---

### Task 8: OrgSignupPage

**Files:**
- Create: `apps/christian-listing/src/pages/OrgSignupPage.tsx`

**Interfaces:**
- Consumes: `firebaseAuth` from `../firebase`, `useNavigate` from react-router-dom
- Produces: page component at `/org/signup`; on successful auth navigates to `/org/setup`

- [ ] **Step 1: Create OrgSignupPage**

Create `apps/christian-listing/src/pages/OrgSignupPage.tsx`:

```typescript
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { firebaseAuth } from '../firebase';

export default function OrgSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      }
      navigate('/org/setup', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      navigate('/org/setup', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">Organisation Account</h1>
        <p className="text-sm text-gray-500 mb-6">Sign up or sign in to manage your organisation.</p>

        <div className="flex rounded-xl overflow-hidden mb-5" style={{ background: '#ede9e4' }}>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
              mode === 'signup' ? 'bg-[#1a1007] text-white shadow' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
              mode === 'signin' ? 'bg-[#1a1007] text-white shadow' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="org-email">Email</label>
            <input
              id="org-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              placeholder="org@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="org-password">Password</label>
            <input
              id="org-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              placeholder="Min. 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold hover:bg-[#b8965e] transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Continue' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[#1a1007] text-white text-sm font-semibold hover:bg-[#2d1e0d] transition-colors disabled:opacity-50"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/christian-listing/src/pages/OrgSignupPage.tsx
git commit -m "feat(web): add OrgSignupPage at /org/signup"
```

---

### Task 9: OrgSetupPage — The Name Gate

**Files:**
- Create: `apps/christian-listing/src/pages/OrgSetupPage.tsx`

**Interfaces:**
- Consumes: `MY_ORGANISATIONS` query, `CREATE_ORGANISATION` mutation from `../graphql/mutations`, `useAuthStore`, `getAuth` from Firebase
- Produces: page at `/org/setup` — redirects to dashboard if org has name, otherwise shows name form

- [ ] **Step 1: Create OrgSetupPage**

Create `apps/christian-listing/src/pages/OrgSetupPage.tsx`:

```typescript
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { getAuth } from 'firebase/auth';
import { useAuthStore } from '../store/authStore';
import { MY_ORGANISATIONS, CREATE_ORGANISATION } from '../graphql/mutations';

// useAuthStore is also called directly (not just via hook) to set orgSetupChecked imperatively.

export default function OrgSetupPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, loading: queryLoading } = useQuery(MY_ORGANISATIONS, {
    skip: !user,
  });

  const [createOrganisation] = useMutation(CREATE_ORGANISATION);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate('/org/signup', { replace: true });
      return;
    }
    const orgs: { id: string; name: string | null }[] = data?.myOrganisations ?? [];
    const hasName = orgs.some((o) => o.name && o.name.trim().length > 0);
    if (hasName) {
      useAuthStore.setState({ orgSetupChecked: true });
      navigate('/dashboard', { replace: true });
    }
  }, [initialized, user, data, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await createOrganisation({ variables: { input: { name: orgName.trim() } } });
      await getAuth().currentUser?.getIdToken(true);
      useAuthStore.setState({ orgSetupChecked: true });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save organisation name.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!initialized || queryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">Name your organisation</h1>
        <p className="text-sm text-gray-500 mb-6">
          This is how your organisation appears on Christian Listings. You can update it later.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="org-name">
              Organisation name
            </label>
            <input
              id="org-name"
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              placeholder="e.g. Grace Community Church"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !orgName.trim()}
            className="mt-2 w-full py-2.5 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold hover:bg-[#b8965e] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/christian-listing/src/pages/OrgSetupPage.tsx
git commit -m "feat(web): add OrgSetupPage org name gate"
```

---

### Task 10: ProtectedRoute Update + Router

**Files:**
- Modify: `apps/christian-listing/src/components/routing/ProtectedRoute.tsx`
- Modify: `apps/christian-listing/src/router/index.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (reads `accountType`), `OrgSignupPage`, `OrgSetupPage`
- Produces: org users always redirected to `/org/setup` when hitting a protected route

- [ ] **Step 1: Read the current ProtectedRoute**

Open `apps/christian-listing/src/components/routing/ProtectedRoute.tsx` and check its current content. The file currently redirects unauthenticated users to `/signin`. We are adding a second check: authenticated org users without a completed setup are redirected to `/org/setup`.

- [ ] **Step 2: Update ProtectedRoute**

Replace the entire contents of `apps/christian-listing/src/components/routing/ProtectedRoute.tsx`:

```typescript
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute() {
  const { user, accountType, orgSetupChecked, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Redirect org users to the setup gate until OrgSetupPage confirms the org has a name.
  // orgSetupChecked resets to false on every login (see authStore), so this runs once per session.
  if (accountType === 'organisation' && !orgSetupChecked) {
    return <Navigate to="/org/setup" replace />;
  }

  return <Outlet />;
}
```

- [ ] **Step 3: Add org routes to the router**

Replace the contents of `apps/christian-listing/src/router/index.tsx`:

```typescript
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import HomePage from '../pages/HomePage';
import EventsPage from '../pages/EventsPage';
import MarketplacePage from '../pages/MarketplacePage';
import JobsPage from '../pages/JobsPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import OrgSignupPage from '../pages/OrgSignupPage';
import OrgSetupPage from '../pages/OrgSetupPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // ── Public routes ──────────────────────────────────────────────
      { index: true, element: <HomePage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'signin', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'org/signup', element: <OrgSignupPage /> },
      { path: 'org/setup', element: <OrgSetupPage /> },

      // ── Protected routes (auth required) ───────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },

      // ── Fallback ───────────────────────────────────────────────────
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
```

- [ ] **Step 4: Verify the full web app builds**

```bash
npx nx build christian-listing
```

Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/christian-listing/src/components/routing/ProtectedRoute.tsx \
        apps/christian-listing/src/router/index.tsx
git commit -m "feat(web): redirect org users to /org/setup, add org routes to router"
```

---

## End-to-End Smoke Test (Manual)

After all tasks are complete, verify the following flows manually:

**User signup flow:**
1. Go to `/signup`, fill name/email/password, submit
2. Backend creates MongoDB User doc and sets `accountType: 'user'` claim
3. Token refresh happens — subsequent requests carry the claim
4. Lands on `/`

**Org first-time flow:**
1. Go to `/org/signup`, create account
2. Redirected to `/org/setup`
3. `myOrganisations` query returns empty — name gate is shown
4. Fill in org name, submit
5. Backend creates MongoDB Organisation doc and sets `accountType: 'organisation'` claim
6. Token refresh happens — lands on `/dashboard`

**Org return login (name already set):**
1. Log in via `/org/signup` or regular sign-in
2. Token has `accountType: 'organisation'` — `ProtectedRoute` sends to `/org/setup`
3. `myOrganisations` query returns org with name — immediate redirect to `/dashboard`

**Org return login (name not set — edge case):**
1. Same as above but `myOrganisations` returns org with `name: null`
2. Name gate is shown — cannot proceed until name is filled
