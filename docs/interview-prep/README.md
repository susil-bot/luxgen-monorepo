# LuxGen — MERN Interview Notebook

> **Junior Q&A** with file:line citations + optional senior deep dives.

## Quick start (junior)

| Doc | Use when |
|-----|----------|
| **[14-junior-qa-react](./14-junior-qa-react.md)** | React / Next.js / hooks / AuthGuard |
| **[15-junior-qa-mern](./15-junior-qa-mern.md)** | Node, GraphQL, MongoDB, auth, tenancy |
| **[16-junior-qa-javascript](./16-junior-qa-javascript.md)** | JS fundamentals with repo examples |
| [12-cheatsheet](./12-cheatsheet.md) | 30 minutes before interview |
| [01-project-overview](./01-project-overview.md) | "Tell me about your project" |

## Quick start (senior)

| Doc | Use when |
|-----|----------|
| [08-system-design](./08-system-design.md) | Architecture rounds |
| [file-analysis/INDEX.md](../file-analysis/INDEX.md) | Per-file lookup |
| [11-mock-interviews](./11-mock-interviews.md) | Practice out loud |

## Regenerate file analyses

```bash
node scripts/generate-interview-prep.mjs
```

This walks **all** `apps/` and `packages/` `.ts/.tsx/.js` files (~1,591) and writes **brief junior Q&A** `docs/file-analysis/<slug>.md` (★ hand-enriched files are skipped).

## Scope

| Layer | Location | ~Files |
|-------|----------|--------|
| Web (Next.js 14) | `apps/web/` | 353 |
| API (GraphQL + Express) | `apps/api/` | 207 |
| UI library | `packages/ui/` | 776 |
| DB models | `packages/db/` | 48 |
| Auth, billing, agent | `packages/*` | rest |

## How to study (daily)

1. **Day A:** [14-junior-qa-react](./14-junior-qa-react.md) — open cited files in IDE  
2. **Day B:** [15-junior-qa-mern](./15-junior-qa-mern.md) + `session.ts`, `context.ts`  
3. **Day C:** ★ file-analysis brief Q&A (auth + tenant)  
4. **Day D:** [11-mock-interviews](./11-mock-interviews.md)  
5. **Day E:** [10-coding-problems](./10-coding-problems.md)  

## Manual deep dives (★ brief + junior Q&A)

| File | Analysis |
|------|----------|
| `_app.tsx` | [apps-web-pages-_app-tsx.md](../file-analysis/apps-web-pages-_app-tsx.md) |
| `AuthGuard.tsx` | [apps-web-components-auth-AuthGuard-tsx.md](../file-analysis/apps-web-components-auth-AuthGuard-tsx.md) |
| `session.ts` | [apps-web-lib-session-ts.md](../file-analysis/apps-web-lib-session-ts.md) |
| `app.ts` (API) | [apps-api-src-app-ts.md](../file-analysis/apps-api-src-app-ts.md) |
| `NavBar.tsx` | [packages-ui-src-NavBar-NavBar-tsx.md](../file-analysis/packages-ui-src-NavBar-NavBar-tsx.md) |
| `tenant.ts` | [packages-db-src-tenant-ts.md](../file-analysis/packages-db-src-tenant-ts.md) |
| `use-sidebar-sections.ts` | [apps-web-lib-use-sidebar-sections-ts.md](../file-analysis/apps-web-lib-use-sidebar-sections-ts.md) |
| `context.ts` (API) | [apps-api-src-context-ts.md](../file-analysis/apps-api-src-context-ts.md) |
| `client.ts` (Apollo) | [apps-web-graphql-client-ts.md](../file-analysis/apps-web-graphql-client-ts.md) |

Full junior Q&A notebooks: **[14](./14-junior-qa-react.md)** · **[15](./15-junior-qa-mern.md)** · **[16](./16-junior-qa-javascript.md)**
