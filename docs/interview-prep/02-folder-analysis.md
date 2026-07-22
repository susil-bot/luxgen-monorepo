# 02 — Folder Analysis

## Repository scale

- **~1,591** TypeScript/JavaScript source files in `apps/` + `packages/`
- **Dominant package:** `packages/ui` (~776 TS/TSX files)
- **Dominant app:** `apps/web` (~353 files)

Full per-file index: [docs/file-analysis/INDEX.md](../file-analysis/INDEX.md)

## `apps/web/` — Next.js frontend

| Path | Purpose | Interview focus |
|------|---------|-----------------|
| `pages/_app.tsx` | Global providers, auth shell | Provider order, SSR hydration |
| `pages/_document.tsx` | HTML shell | No viewport in _document (Next rule) |
| `pages/*.tsx` | Routes | `getTenantPageProps`, `getServerSideProps` |
| `pages/api/` | Next API routes | Agent SSE, `users/me`, search stub |
| `lib/session.ts` | JWT + localStorage session | Canonical auth keys |
| `lib/app-layout-user.ts` | Layout user hooks | SSR cookie + client sync |
| `lib/use-sidebar-sections.ts` | Role/plan sidebar filter | RBAC in UI |
| `components/auth/` | AuthGuard, SessionMonitor | Protected routes |
| `graphql/queries/` | Apollo operations | `fetchPolicy` choices |
| `middleware.ts` | Subdomain → tenant query | Edge middleware |

## `apps/api/` — GraphQL + REST

| Path | Purpose |
|------|---------|
| `src/index.ts` | Bootstrap: Mongo, seed, listen |
| `src/app.ts` | Express + Apollo + WS + middleware stack |
| `src/schema/` | Merged typeDefs + resolvers by domain |
| `src/middleware/` | auth, tenant routing, rate limits |
| `src/routes/` | REST: auth, billing, tenant, notifications |
| `src/services/` | Business logic layer |
| `src/context.ts` | GraphQL context (user, tenant) |

## `packages/ui/` — Design system

| Path | Purpose |
|------|---------|
| `src/NavBar/` | Login vs user menu, search, theme toggle |
| `src/Sidebar/` | Navigation, `onNavigate` vs deprecated `onItemClick` |
| `src/AdminDashboardLayout/` | Admin analytics shell |
| `src/LoginForm/`, `RegisterForm/` | Auth UI + `SocialLoginButtons` |
| `src/context/` | GlobalProvider, UserContext, NavigationContext |
| `src/index.ts` | Barrel exports (tree-shaking concerns) |

## `packages/db/` — Mongoose

| Model | File | Indexes (examples) |
|-------|------|-------------------|
| Tenant | `tenant.ts` | subdomain, domain, status |
| User | `user.ts` | tenantId + email |
| Course | `course.ts` | tenantId |
| Enrollment | `enrollment.ts` | tenantId, userId |
| Automation | `automation.ts` | tenant workflows |

## `packages/auth/` — JWT + roles

- `roles.ts` — `UserRole`, `hasRoleAtLeast`, `hasPermission`
- `jwt.ts` — sign/verify
- **Important:** roles defined locally (not importing `@luxgen/db` in web bundle)

## Naming conventions (CODING_STANDARDS)

- Pages: `getTenantPageProps` for tenant + optional SSR layout user
- Hooks: `use*` in `lib/` or `hooks/`
- GraphQL: `GET_*`, `CREATE_*` in `graphql/queries/`
- UI: PascalCase components in `packages/ui/src/<Name>/`

## Dependency rules (senior)

```
apps/web  →  @luxgen/ui, @apollo/client, (NOT @luxgen/db in client components)
apps/api  →  @luxgen/db, @luxgen/auth, @luxgen/billing
packages/ui  →  React only; no Mongoose
```

## File analysis lookup

```bash
# Example: find analysis for session.ts
ls docs/file-analysis/ | rg session
# → apps-web-lib-session-ts.md
```
