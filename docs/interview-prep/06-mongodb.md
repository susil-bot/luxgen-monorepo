# 06 — MongoDB & Mongoose (LuxGen)

> **Junior Q&A:** [15-junior-qa-mern.md](./15-junior-qa-mern.md) — section **MONGODB**.

## Hot files

| File | What to know |
|------|----------------|
| `packages/db/src/tenant.ts` | Tenant schema, indexes `292-294`, model guard `295-296` |
| `packages/db/src/user.ts` | User + `UserRole` enum |
| `packages/db/src/connection.ts` | `connectDB()` |

## Junior facts

- **Document** = one JSON-like record in a **collection**
- **Schema** = field types + validation (Mongoose)
- **Index** = faster lookups (`subdomain` on every request)
- **tenantId** on documents = multi-tenant isolation

★ Deep dive: [packages-db-src-tenant-ts.md](../file-analysis/packages-db-src-tenant-ts.md)
