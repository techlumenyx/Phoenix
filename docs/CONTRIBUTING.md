# Contributing — Christian Listings

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | https://nodejs.org |
| Docker Desktop | Latest | https://docker.com/products/docker-desktop |
| Nx CLI | ≥ 23 | `npm install -g nx` |
| Rover CLI | Latest | `npm install -g @apollo/rover` |

## First-Time Setup

```bash
# 1. Clone the repo
git clone <repo-url> christian-listings
cd christian-listings

# 2. Install all workspace dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Open .env and fill in MONGO_URI, FIREBASE_SERVICE_ACCOUNT_JSON,
# Cloudinary credentials, and VITE_FIREBASE_* values.
# See docs/ENVIRONMENT.md for details on each variable.

# 4. Compose the initial supergraph (requires Rover CLI)
#    Mac/Linux:
bash tools/scripts/compose-supergraph.sh
#    Windows:
tools\scripts\compose-supergraph.bat

# 5. Run GraphQL codegen to generate TypeScript types
nx run-many --target=codegen --all
```

## Running the Full Stack

```bash
# Start all 6 containers with hot reload
docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up

# Open in browser:
# - Web app:        http://localhost:5173
# - GraphQL sandbox: http://localhost:4000 (Apollo Router sandbox)
```

## Running Individual Services (Faster Iteration)

```bash
# Run a single subgraph with hot reload (outside Docker)
nx serve subgraph-identity
nx serve subgraph-events
nx serve subgraph-classifieds
nx serve subgraph-admin

# Run the web app
nx serve web
```

## Nx Command Reference

```bash
# Visualise the project dependency graph
nx graph

# Build all projects
nx run-many --target=build --all

# Lint all projects
nx run-many --target=lint --all

# Run all tests
nx run-many --target=test --all

# Type-check all projects
nx run-many --target=typecheck --all

# Run codegen (after any .graphql schema change)
nx run-many --target=codegen --all

# Only build/test/lint projects affected by your changes (CI-friendly)
nx affected --target=build
nx affected --target=test
```

## Schema Change Workflow

**Always follow this sequence when editing any `.graphql` file:**

```bash
# 1. Edit the schema file(s)
# e.g. apps/subgraph-events/src/schema/events.graphql

# 2. Regenerate TypeScript types
nx run-many --target=codegen --all

# 3. Recompose the supergraph (validates Federation constraints)
bash tools/scripts/compose-supergraph.sh  # or .bat on Windows

# 4. Commit all three together
git add apps/subgraph-events/src/schema/events.graphql \
        apps/gateway/supergraph.graphql \
        libs/types/src/generated/graphql.ts
git commit -m "feat(events): add recurring event fields to schema"
```

**Never commit a schema change without regenerating types and recomposing the supergraph.** CI will fail if the supergraph doesn't compose.

## Commit Convention

Format: `type(scope): short description`

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change with no new feature or bug fix |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Build tooling, deps, config |

**Scopes:** `web`, `identity`, `events`, `classifieds`, `admin`, `gateway`, `libs`, `docker`, `ci`

Examples:
```
feat(events): add RSVP three-stage funnel
fix(classifieds): correct currency pivot calculation for NGN
docs(contributing): add schema change workflow
chore(ci): add schema composition job to PR pipeline
```

## Branch Naming

```
feat/CL-<ticket>-short-description
fix/CL-<ticket>-short-description
chore/CL-<ticket>-short-description
```

## Pull Request Requirements

Before opening a PR:
1. CI must pass (lint + typecheck + test + schema composition)
2. `nx affected --target=test` passes locally
3. No cross-service imports (ESLint boundary rules enforced)
4. Schema changes must include codegen output and supergraph recomposition
5. New environment variables must be added to `.env.example` and `docs/ENVIRONMENT.md`

## Module Boundary Rules

The following cross-imports are **forbidden** and caught by ESLint:
- One subgraph importing from another subgraph's `src/` directory
- The web app importing from any backend package (Fastify, Mongoose, firebase-admin)
- Any `type:app` importing from another `type:app`

All cross-service data sharing must go through:
- `@christian-listings/types` for TypeScript interfaces
- GraphQL Federation for runtime data resolution
