# ADR 0002 — GraphQL Federation v2

**Status:** Accepted

## Context

The platform has three independent content domains (Identity, Events, Classifieds/Jobs, Admin) that need to be surfaced through a single API endpoint to the web client. Options considered:

1. Monolithic GraphQL schema in a single server
2. REST APIs per service
3. GraphQL Federation (distributed schema)
4. Schema stitching (manual)

## Decision

Use **Apollo Federation v2** with Apollo Router as the gateway. Each domain is an independent subgraph. The supergraph schema is composed from all SDL files using the Rover CLI.

Key Federation patterns used:
- `@key(fields: "id")` on owned entity types
- `extend type` + `@external` for cross-service entity extension
- `@provides` for inline field resolution optimisation

## Consequences

**Positive:**
- The web app has a single GraphQL endpoint — no client-side service discovery.
- Subgraphs are independently deployable. A new event field requires only recomposing the supergraph, not touching identity or classifieds.
- Apollo Router handles query planning, parallel sub-query dispatch, and response assembly automatically.
- Federation v2 has improved directive support and removed some v1 restrictions.

**Negative:**
- `supergraph.graphql` must be recomposed on every schema change. This adds a step to the schema change workflow.
- The Apollo Router is a Rust binary — custom JS plugins are not possible without Rhai scripting. For complex request/response transforms, use subgraph-level logic instead.
- Cross-service queries (e.g., `me { events { id } }`) make N+1 resolution possible if resolvers aren't carefully written with `DataLoader`.
