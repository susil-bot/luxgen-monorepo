# LuxGen — Senior MERN Interview Notebook

> **Living handbook** tied to this production monorepo. Regenerate per-file analysis after major refactors.

## Quick start

| Doc | Use when |
|-----|----------|
| [01-project-overview](./01-project-overview.md) | "Tell me about your project" |
| [12-cheatsheet](./12-cheatsheet.md) | 30 minutes before any interview |
| [08-system-design](./08-system-design.md) | Architecture / system design rounds |
| [file-analysis/INDEX.md](../file-analysis/INDEX.md) | Deep dive on any source file |

## Regenerate file analyses

```bash
node scripts/generate-interview-prep.mjs
```

This walks **all** `apps/` and `packages/` `.ts/.tsx/.js` files (~1,591) and writes `docs/file-analysis/<slug>.md`.

## Scope

| Layer | Location | ~Files |
|-------|----------|--------|
| Web (Next.js 14) | `apps/web/` | 353 |
| API (GraphQL + Express) | `apps/api/` | 207 |
| UI library | `packages/ui/` | 776 |
| DB models | `packages/db/` | 48 |
| Auth, billing, agent | `packages/*` | rest |

## How to study (daily)

1. **Day A:** [03-react](./03-react.md) + `_app.tsx` + `AuthGuard` file analysis  
2. **Day B:** [05-node](./05-node.md) + [07-api](./07-api.md) + `apps/api/src/app.ts`  
3. **Day C:** [06-mongodb](./06-mongodb.md) + `Tenant` / `User` models  
4. **Day D:** [11-mock-interviews](./11-mock-interviews.md) out loud  
5. **Day E:** [10-coding-problems](./10-coding-problems.md) timed  

## Manual deep dives (hand-enriched ★)

| File | Analysis |
|------|----------|
| `_app.tsx` | [apps-web-pages-_app-tsx.md](../file-analysis/apps-web-pages-_app-tsx.md) |
| `AuthGuard.tsx` | [apps-web-components-auth-AuthGuard-tsx.md](../file-analysis/apps-web-components-auth-AuthGuard-tsx.md) |
| `session.ts` ★ | [apps-web-lib-session-ts.md](../file-analysis/apps-web-lib-session-ts.md) |
| `app.ts` (API) ★ | [apps-api-src-app-ts.md](../file-analysis/apps-api-src-app-ts.md) |
| `NavBar.tsx` ★ | [packages-ui-src-NavBar-NavBar-tsx.md](../file-analysis/packages-ui-src-NavBar-NavBar-tsx.md) |
| `tenant.ts` ★ | [packages-db-src-tenant-ts.md](../file-analysis/packages-db-src-tenant-ts.md) |
| `use-sidebar-sections.ts` ★ | [apps-web-lib-use-sidebar-sections-ts.md](../file-analysis/apps-web-lib-use-sidebar-sections-ts.md) |
| `context.ts` (API) ★ | [apps-api-src-context-ts.md](../file-analysis/apps-api-src-context-ts.md) |
| `client.ts` (Apollo) ★ | [apps-web-graphql-client-ts.md](../file-analysis/apps-web-graphql-client-ts.md) |

## Manual deep dives (enriched)

These files have **extra** hand-written analysis beyond the generator:

- See table above — ★ = P0/P1 batch (auth, API, nav, tenancy, RBAC, GraphQL client)
