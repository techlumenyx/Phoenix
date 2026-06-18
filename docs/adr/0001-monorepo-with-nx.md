# ADR 0001 — Monorepo with Nx

**Status:** Accepted

## Context

The Christian Listings platform has a Vite + React SPA, an Apollo Router gateway, and four independent Fastify subgraphs. These services share significant TypeScript code (auth logic, DB connection factory, types, utilities). Managing them as separate repos would require publishing and versioning shared packages for every change — high friction for a small team at early stage.

## Decision

Use a single **Nx monorepo** with an `apps/` directory for runnable services and a `libs/` directory for shared library code. All packages are managed from a single root `package.json` (integrated monorepo pattern, not package-based).

## Consequences

**Positive:**
- `nx affected --target=build` only rebuilds what changed — CI stays fast as the codebase grows.
- Shared libs (`@christian-listings/auth`, `@christian-listings/db`, etc.) are referenced by path alias — no publishing, no versioning friction.
- `@nx/enforce-module-boundaries` ESLint plugin enforces service isolation at the import level.
- `nx graph` gives a live dependency graph of all projects.

**Negative:**
- `npm install` at root installs all dependencies for all services — larger `node_modules` than per-service repos.
- Nx has a learning curve; `project.json`, target defaults, and plugin configuration must be understood before contributing.
- Generator commands must be run from the workspace root.
