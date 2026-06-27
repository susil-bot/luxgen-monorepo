# 01 — Project Overview (Interview Narrative)

## Elevator pitch (60 seconds)

> **LuxGen** is a multi-tenant learning and commerce platform: LMS + storefront + automations + billing + optional AI agent studio.  
> **Frontend:** Next.js 14 Pages Router (`apps/web`), shared design system (`@luxgen/ui`).  
> **Backend:** Express + Apollo GraphQL (`apps/api`), MongoDB via Mongoose (`@luxgen/db`).  
> **Tenancy:** Subdomain routing (`demo.localhost`) + JWT `tenant` claim (Mongo id, not subdomain string).  
> **Real-time:** GraphQL subscriptions over WebSocket; agent chat via SSE from Next API routes.

## Tech stack (MERN+)

| Layer | Technology | Where |
|-------|------------|-------|
| **M**ongoDB | Mongoose 7 | `packages/db` |
| **E**xpress | REST + middleware pipeline | `apps/api/src/app.ts` |
| **R**eact | 18 + Next.js 14 | `apps/web`, `packages/ui` |
| **N**ode | 20+ | API, agent-worker, scripts |
| GraphQL | Apollo Server 3 | `apps/api/src/schema` |
| Client cache | Apollo Client | `apps/web/graphql/client.ts` |
| Auth | JWT + localStorage session | `apps/web/lib/session.ts` |
| Billing | Stripe + plan gates | `@luxgen/billing`, `PlanGate` |
| Queue | Redis (agent jobs) | `apps/agent-worker` |

## What makes this *senior* work

1. **Multi-tenancy end-to-end** — subdomain → tenant middleware → GraphQL context → Mongo queries scoped by `tenantId`.
2. **Monorepo boundaries** — UI package consumed by web; DB never imported in client bundles (recent fixes: auth roles decoupled from Mongoose).
3. **Auth session contract** — canonical keys (`authToken`, `currentUser`, `authSessionEpoch`); guest NavBar vs authenticated user menu.
4. **GraphQL as BFF** — pages use colocated queries; some performance work (`orderRows` API vs client-side joins).
5. **Plan-gated features** — automations, analytics, agent studio behind `@luxgen/billing` feature flags.

## Folder map (interview whiteboard)

```
apps/web/pages/     → routes (Pages Router)
apps/web/lib/       → session, tenant, hooks, transformers
apps/web/components/→ app-specific UI (auth, agent, billing)
packages/ui/src/    → NavBar, Sidebar, layouts, forms
apps/api/src/schema/→ GraphQL domains (user, course, billing…)
packages/db/src/    → Mongoose models (Tenant, User, Course…)
```

## STAR story templates

### Auth regression you fixed

- **S:** Login UI showed fake user when session expired.  
- **T:** Restore guest NavBar without fabricating users.  
- **A:** `useLayoutUser()`, `clearStoredSession()`, `AuthGuard` re-validation on `luxgen-auth-change`.  
- **R:** Guest sees Login/Sign Up; no "John Doe" fallback.

### Performance / data fetching

- **S:** Orders page ran 3 GraphQL queries and joined client-side.  
- **T:** Reduce double-fetch and N+1 at page level.  
- **A:** `orderRows` query + `cache-first` for stable data + virtualized table rows.  
- **R:** Single network round-trip for order list; smoother scroll on 50+ rows.

## Questions interviewers ask about *your* project

| Question | Answer anchor |
|----------|----------------|
| Why monorepo? | Shared UI + types; Turborepo CI; one PR for full-stack features |
| Why Pages Router not App Router? | Legacy + `getServerSideProps` tenant props; migration cost |
| Why GraphQL? | Typed schema, subscriptions, mobile reuse |
| Hardest bug? | Mongoose `OverwriteModelError` from stale `.js` + bundling `@luxgen/db` into web |
| How do you test? | Vitest (api/ui), Playwright e2e (`apps/web/e2e`) |

## Next reads

- [02-folder-analysis](./02-folder-analysis.md)  
- [08-system-design](./08-system-design.md)  
- [docs/ARCHITECTURE.md](../ARCHITECTURE.md)
