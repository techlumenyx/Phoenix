# ADR 0005 — Apollo Router over @apollo/gateway Package

**Status:** Accepted

## Context

Apollo Federation v2 can be served by two options:
1. `@apollo/gateway` — JavaScript/Node.js package, customisable with plugins
2. **Apollo Router** — Rust binary, high performance, native Federation v2 support

## Decision

Use **Apollo Router** (Rust binary). The gateway app (`apps/gateway`) downloads and executes the Router binary configured via `router.yaml`.

## Consequences

**Positive:**
- Apollo Router has significantly higher throughput than the JS gateway for the same hardware — critical for the home feed which fans out to all four subgraphs simultaneously.
- Native Federation v2 directive support (no compatibility layer needed).
- Router is configured declaratively in YAML — no TypeScript boilerplate in the gateway.
- Header propagation (`x-cl-region`, `x-request-id`) is configured centrally in `router.yaml`, not scattered across subgraphs.

**Negative:**
- Custom plugins require Rhai scripting (Router's built-in scripting language), not TypeScript/JavaScript. Complex request transforms must be done in subgraph resolvers instead.
- Updating the Router requires downloading a new binary version and updating the gateway Dockerfile — it's not managed by `npm update`.
- The Router sandbox UI (replacing Apollo Sandbox) requires enabling it in `router.yaml` — disabled in production.
