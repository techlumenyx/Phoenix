# Christian Listings — AI Agent Instructions

## Project Overview

Faith-community platform (Events, Jobs, Marketplace) for diaspora audiences. Nx monorepo with GraphQL Federation v2. Read `Christian-Listings-Project-Blueprint.md` for full feature scope and roadmap.

## Tech Stack

- **Frontend**: `apps/web` — Vite + React 18 + TypeScript + Tailwind CSS + Apollo Client + Zustand
- **Gateway**: `apps/gateway` — Apollo Router (Rust binary) federating 4 subgraphs
- **Backend**: 4 Fastify + Apollo Server 4 subgraphs (see service map below)
- **Database**: MongoDB Atlas — Mongoose, one named DB per subgraph
- **Auth**: Firebase Auth (client SDK on web, Admin SDK token verification on backends)
- **Media**: Cloudinary (via `@christian-listings/utils`)

## Service Map

| App | Port | Database | Tags |
|-----|------|----------|------|
| `apps/web` | 5173 | — | `scope:web, type:app` |
| `apps/gateway` | 4000 | — | `scope:gateway, type:app` |
| `apps/subgraph-identity` | 4001 | `cl_identity` | `scope:identity, type:app` |
| `apps/subgraph-events` | 4002 | `cl_events` | `scope:events, type:app` |
| `apps/subgraph-classifieds` | 4003 | `cl_classifieds` | `scope:classifieds, type:app` |
| `apps/subgraph-admin` | 4004 | `cl_admin` | `scope:admin, type:app` |

## Shared Libraries

| Library | Import Path | Purpose |
|---------|-------------|---------|
| `libs/auth` | `@christian-listings/auth` | Firebase Admin token verification + Fastify auth plugin |
| `libs/db` | `@christian-listings/db` | `createMongoConnection(uri, dbName)` factory |
| `libs/types` | `@christian-listings/types` | Codegen output + hand-written model interfaces |
| `libs/utils` | `@christian-listings/utils` | CurrencyConverter stub, pagination, region helpers, Cloudinary client |

## Critical Rules

### Service Isolation
- Subgraphs **cannot import from each other's `src/` folders**. This is enforced by ESLint (`@nx/enforce-module-boundaries`).
- Cross-service data travels through **GraphQL Federation** at runtime or shared interfaces in `@christian-listings/types`.
- Check tags in each `project.json` — `type:app` may only depend on `type:lib`.

### Database
- **Always** use `createMongoConnection(uri, dbName)` from `@christian-listings/db`. Never call `mongoose.connect()` directly.
- Each subgraph hardcodes its DB name: `cl_identity`, `cl_events`, `cl_classifieds`, `cl_admin`.

### Authentication
- **Always** call `buildAuthContext(request)` from `@christian-listings/auth` in every subgraph's Apollo context function.
- Use `buildAuthPlugin({ optional: true })` for public routes (browse without login).
- The web app reads `VITE_FIREBASE_*` env vars for the client SDK.
- The backend reads `FIREBASE_SERVICE_ACCOUNT_JSON` (base64 JSON) for the Admin SDK.

### Schema Changes
After editing any `.graphql` file:
1. `nx run-many --target=codegen --all` — regenerate TypeScript types
2. `tools/scripts/compose-supergraph.sh` — recompose the supergraph
3. Commit the schema file, supergraph.graphql, and generated types together

### Media Uploads
- The **web app never calls Cloudinary directly**.
- Upload goes: web → subgraph mutation → Cloudinary SDK via `@christian-listings/utils`.
- `subgraph-classifieds` and `subgraph-events` are the only services that call Cloudinary.

## Key Commands

```bash
# Start full stack (Docker)
docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up

# Run a single service locally (hot reload, faster iteration)
nx serve subgraph-identity

# Codegen (run after any .graphql schema change)
nx run-many --target=codegen --all

# Recompose supergraph (run after codegen)
tools/scripts/compose-supergraph.sh      # Mac/Linux
tools\scripts\compose-supergraph.bat     # Windows

# Lint everything
nx run-many --target=lint --all

# Run all tests
nx run-many --target=test --all

# Visualise project dependency graph
nx graph

# Only build/test/lint projects affected by your changes
nx affected --target=build
```

## Environment Variables

See `docs/ENVIRONMENT.md` for the full catalogue. Copy `.env.example` to `.env` and fill in values before running anything.

## Architecture Decision Records

See `docs/adr/` for the rationale behind key decisions:
- `0001` — Why Nx monorepo
- `0002` — Why GraphQL Federation v2
- `0003` — Firebase Auth strategy
- `0004` — MongoDB per-service database isolation
- `0005` — Apollo Router over `@apollo/gateway` package
- `0006` — Cloudinary for media
- `0007` — CurrencyConverter stub strategy

## Development Phase

Currently in **Phase 1 (MVP)**. See the blueprint's Development Roadmap table for which features are in scope. Do not implement Standard-tier features until Basic features are complete and signed off.
