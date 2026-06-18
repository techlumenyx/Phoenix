# ADR 0004 — MongoDB Per-Service Database Isolation

**Status:** Accepted

## Context

The platform uses MongoDB Atlas. Microservices must not share database state to avoid coupling. Options:
1. Separate Atlas clusters per service (expensive)
2. Same cluster, same database, separate collections per service
3. Same cluster, separate named databases per service (logical isolation)

## Decision

Use a **single MongoDB Atlas cluster** with **separate named databases per subgraph**:

| Subgraph | Database |
|----------|----------|
| subgraph-identity | `cl_identity` |
| subgraph-events | `cl_events` |
| subgraph-classifieds | `cl_classifieds` |
| subgraph-admin | `cl_admin` |

Each subgraph connects via `createMongoConnection(process.env.MONGO_URI, 'cl_<service>')` from `@christian-listings/db`, which uses `mongoose.createConnection` (not `mongoose.connect`) to produce isolated Connection instances.

## Consequences

**Positive:**
- A single Atlas cluster is cost-effective at MVP scale. Scaling to separate clusters later is possible without changing application code — just update `MONGO_URI`.
- `mongoose.createConnection` prevents model name collisions between services (each Connection has its own model registry).
- Service code physically cannot import another service's Mongoose models — the connection is scoped.
- Database-level Atlas audit logs per database are possible.

**Negative:**
- MongoDB transactions crossing multiple databases require separate session management — not currently needed (cross-service writes go through Federation mutations, not direct DB calls).
- All services share the same Atlas credentials via `MONGO_URI` — no per-service credential isolation at the DB layer. This is acceptable for MVP but should be revisited for production hardening.
