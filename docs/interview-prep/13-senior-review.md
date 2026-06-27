# 13 — Senior Review

## Would FAANG approve?

| Area | Verdict | Notes |
|------|---------|-------|
| Monorepo structure | ✅ | Clear apps/packages split |
| Auth/session | ✅ (after fixes) | Canonical keys, guest UI rules documented |
| Multi-tenancy | ✅ | Middleware + JWT tenant id |
| UI package size | ⚠️ | 850 files; barrel export hurts tree-shaking |
| Stale .js in packages | ❌→✅ | Removed from auth/db; needs CI guard |
| Test coverage | ⚠️ | Vitest exists; not uniform on all pages |
| Type safety | ⚠️ | `ignoreBuildErrors: true` on web — tech debt |

## How Staff Engineer would improve

1. **CI:** Fail if `*.js` appears in `packages/*/src` (except explicit exceptions)  
2. **Boundary lint:** `eslint-plugin-boundaries` — web cannot import `@luxgen/db`  
3. **GraphQL codegen:** Generated types for all operations  
4. **App Router migration plan:** RSC for public pages, keep client islands  
5. **Design tokens:** Already iOS-style; consolidate Chip/Badge → Tag (done in audit)

## Netflix-style

- Chaos: test API kill switch; client ErrorBoundary + retry  
- Performance budgets: Lighthouse on `/dashboard`, `/login`  
- Feature flags: expand billing flags pattern to all gates  

## Amazon-style

- Working backwards from PR/FAQ for major features  
- Two-pizza team ownership per domain (billing, automations, listings)  
- Operational excellence: runbooks in `docs/technical/operations/`  

## Meta-style

- Component explorer (Storybook) for `@luxgen/ui`  
- Relay-style GraphQL colocation (already partial)  
- Rigorous perf profiling on feed-like pages (orders, users lists)  

## Hot-path files to know cold

| Priority | File | Analysis |
|----------|------|----------|
| P0 | `apps/web/pages/_app.tsx` | [★ file-analysis](../file-analysis/apps-web-pages-_app-tsx.md) |
| P0 | `apps/web/lib/session.ts` | [★ file-analysis](../file-analysis/apps-web-lib-session-ts.md) |
| P0 | `apps/web/components/auth/AuthGuard.tsx` | [★ file-analysis](../file-analysis/apps-web-components-auth-AuthGuard-tsx.md) |
| P0 | `apps/api/src/app.ts` | [★ file-analysis](../file-analysis/apps-api-src-app-ts.md) |
| P0 | `packages/ui/src/NavBar/NavBar.tsx` | [★ file-analysis](../file-analysis/packages-ui-src-NavBar-NavBar-tsx.md) |
| P0 | `packages/db/src/tenant.ts` | [★ file-analysis](../file-analysis/packages-db-src-tenant-ts.md) |
| P0 | `apps/web/lib/use-sidebar-sections.ts` | [★ file-analysis](../file-analysis/apps-web-lib-use-sidebar-sections-ts.md) |
| P1 | `apps/api/src/context.ts` | [★ file-analysis](../file-analysis/apps-api-src-context-ts.md) |
| P1 | `apps/web/graphql/client.ts` | [★ file-analysis](../file-analysis/apps-web-graphql-client-ts.md) |
| P2 | `packages/ui/src/Sidebar/Sidebar.tsx` | [file-analysis INDEX](../file-analysis/INDEX.md) |

## Refactoring priorities

| Module | Problem | Refactor |
|--------|---------|----------|
| `@luxgen/ui` barrel | Side effects, bundle size | Subpath exports `@luxgen/ui/nav` |
| `transformer.ts` | God file | Split by domain |
| Duplicate ProductCard | web + ui | Single component with variants |
| Session dual systems | UserContext + session.ts | Document + bridge (UI-190) |

## Enterprise readiness gaps

- SSO/SAML pages exist (`organization/security/saml`) — verify E2E  
- Audit logs: agent-audit, mcp-audit models exist  
- Need formal SLOs and alerting docs for production  

## Your interview story

"I maintain a 200-item UI/architecture audit, ship incremental PRs, and recently fixed production issues around session providers, Mongoose model double-registration, and GraphQL data-fetching patterns — demonstrating full-stack ownership in a real MERN monorepo."
