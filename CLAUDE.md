# Christian Listings — AI Agent Instructions

## Project Overview

Faith-community platform (Events, Jobs, Marketplace) for diaspora audiences. Nx monorepo with GraphQL Federation v2. Read `Christian-Listings-Project-Blueprint.md` for full feature scope and roadmap.

## Tech Stack

- **Frontend**: `apps/christian-listing` (port 3000) and `apps/cl-admin` (port 3001) — Webpack 5 + React 18 + TypeScript + Tailwind CSS + Apollo Client + Zustand
- **Gateway**: `apps/gateway` — Apollo Router (Rust binary) federating 4 subgraphs
- **Backend**: 4 Fastify + Apollo Server 4 subgraphs (see service map below)
- **Database**: MongoDB Atlas — Mongoose, one named DB per subgraph
- **Auth**: Firebase Auth (client SDK on web, Admin SDK token verification on backends)
- **Media**: Cloudinary (via `@christian-listings/utils`)

## Service Map

| App | Port | Database | Tags |
|-----|------|----------|------|
| `apps/christian-listing` | 3000 | — | `scope:web, type:app` |
| `apps/cl-admin` | 3001 | — | `scope:admin-ui, type:app` |
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
- Use `buildAuthPlugin({ optional: true })` for public routes (browse without login). `subgraph-admin` deliberately uses `optional: false` (mandatory auth) since it's admin-only.
- `/health` is always exempt from the auth check (`fastify-auth.plugin.ts` special-cases it) regardless of a subgraph's `optional` setting — container healthchecks and infra monitoring must never need a Firebase token.
- The browser apps read `CL_FIREBASE_*` env vars for the client SDK.
- The backend reads `FIREBASE_SERVICE_ACCOUNT_JSON` (base64 JSON) for the Admin SDK.

### Docker / Deployment
- `apps/gateway` (Apollo Router) is **not** a Node app — it has no `nx build` target and must never be built with `docker/Dockerfile.node`. It has its own `docker/Dockerfile.router`, based on the official `ghcr.io/apollographql/router` image.
- `apps/gateway/router.yaml` must keep `supergraph.listen: 0.0.0.0:4000` explicit — the router defaults to `127.0.0.1:4000`, unreachable from outside its own container. (`nx serve gateway` overrides this via `--listen` on the CLI, so this only bites in Docker.)
- `docker/Dockerfile.node` runs `npm ci --legacy-peer-deps`. The `--legacy-peer-deps` is required: `mongodb` (via `mongoose`) declares `gcp-metadata`/`gaxios`/`https-proxy-agent`/`agent-base` as optional peer dependencies for unused GCP auth features, and `npm ci`'s strict lock-sync check flags them as "missing from lock file" inconsistently across npm versions/platforms without this flag.
- Container healthchecks must hit `127.0.0.1`, never `localhost` — Alpine/musl can resolve `localhost` to the IPv6 loopback (`::1`) first, and since Fastify only binds the IPv4 wildcard (`0.0.0.0`), that gets an instant connection-refused even though the app is genuinely up.
- `apps/gateway/supergraph.graphql` is gitignored (composed, not committed) — any CI job that builds the gateway image must run `rover supergraph compose --config rover.yaml --output apps/gateway/supergraph.graphql` first (see `.github/workflows/deploy.yml`'s `build-and-push` job).

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
