# LuxGen Product Timeline — Sprint Tracker

> Platform delivery tracker for auth, LMS, billing, and production readiness.  
> Update status as PRs merge: `⬜ pending` · `🟡 in progress` · `✅ done`

---

## Phase 0 — Auth & session hardening

| # | Task | Area | Status | PR / Notes |
|---|------|------|--------|------------|
| 0.1 | AuthGuard — redirect unauthenticated users from protected routes | Web | ✅ done | PR #5 `feat/auth-route-guard` |
| 0.2 | Session expiry — JWT `exp`, SessionMonitor, Apollo 401 link | Web | ✅ done | PR #7 `feat/auth-session-expiry` |
| 0.3 | Centralized logout — clear all session keys + Apollo cache | Web | ✅ done | PR #6 `feat/auth-centralized-logout` |
| 0.4 | GraphQL context rejects missing/invalid JWT on protected operations | API | ✅ done | `secureResolvers` + `assertAuthenticated` |
| 0.5 | Block deactivated accounts (`isActive` + `UserStatus`) | API | ✅ done | Login REST + GraphQL + auth middleware |
| 0.6 | Rate-limit login endpoint | API | ✅ done | `loginRateLimitMiddleware` + GraphQL login |
| 0.7 | Wire AuthGuard in `_app.tsx` (regression fix) | Web | ✅ done | Wrap `<Component />` with `AuthGuard` |
| 0.8 | iOS auth notice banners on login (`?reason=`) | Web | ✅ done | `AuthNoticeBanner` + `auth-notices.ts` |
| 0.9 | Session / logout redirects with reason codes | Web | ✅ done | SessionMonitor, Apollo link, `performLogout` |
| 0.10 | Friendly login errors (rate limit, deactivated) | Web | ✅ done | `formatLoginError()` in login page |
| 0.11 | Auth edge cases — tenant mismatch, mid-session expiry, cross-tab sync | Web | 🟡 in progress | `feat/auth-edge-cases` |

### Phase 0.11 — Auth edge cases

| Edge case | Behavior |
|-----------|----------|
| Wrong tenant subdomain at login | Block persist; snackbar + optional `tenant_mismatch` banner |
| Expired JWT mid-session | `SessionMonitor` + Apollo link → `/login?reason=session_expired` |
| Concurrent tabs | `SessionSync` listens for token/epoch changes; resets Apollo cache |
| Unauthenticated admin routes | `AuthGuard` + `validateClientSession()` → `/login?reason=unauthorized` |

Acceptance: login → dashboard on `demo.localhost:3000`; logged-out user cannot reach `/dashboard`.

### Phase 0 — Server details (0.4–0.6)

**GraphQL auth (`apps/api/src/graphql/authPolicy.ts`)**
- Public queries: `login`, `register`, `publishedListings`, `pricingPlans`, `currentUser`, …
- All other Query/Mutation fields require valid JWT via `secureResolvers()`
- Invalid token → `UNAUTHENTICATED`; deactivated account → `FORBIDDEN`

**Account status (`apps/api/src/utils/accountStatus.ts`)**
- Blocks when `isActive === false` or `status` is `INACTIVE` / `SUSPENDED`
- Enforced in REST `/api/auth/login`, GraphQL `login`, and `authMiddleware`

**Login rate limit (`apps/api/src/middleware/loginRateLimit.ts`)**
- Default: 10 attempts per 15 minutes per IP + email
- Env: `LOGIN_RATE_LIMIT_MAX`, `LOGIN_RATE_LIMIT_WINDOW_MS`
- Applied to REST login; GraphQL `login` uses same store via `ctx.req`

---

## Phase 0b — iOS UI gap sprint

| # | Task | Area | Status | Notes |
|---|------|------|--------|-------|
| 0b.1 | Shared `PageLoadingState` / `PageEmptyState` | Web | ✅ done | `components/common/PageStates.tsx` |
| 0b.2 | Dashboard, home, 404 iOS pass | Web | ✅ done | |
| 0b.3 | Users page iOS card + table | Web | ✅ done | GraphQL wired — Phase 1.1c |
| 0b.4 | Courses list/detail shell | Web | 🟡 partial | iOS headers + loading; mock data |
| 0b.5 | Groups detail/edit/members pass | Web | 🟡 partial | Loading/empty/forms; stat cards TBD |
| 0b.6 | PlanGate token fix | Web | ✅ done | |
| 0b.7 | UI audit doc | Docs | ✅ done | [IOS_UI_AUDIT.md](./IOS_UI_AUDIT.md) |

---

| # | Task | Area | Status |
|---|------|------|--------|
| 1.1 | Wire `/users`, `/courses`, `/groups` to GraphQL (remove mocks) | Web | ✅ done | Groups #11, courses #12, users #13 |
| 1.2 | Enrollment + progress model | API | ⬜ pending |
| 1.3 | Wire `/customers` learner page to real data | Web | ⬜ pending |
| 1.4 | Certificates on course completion | API + Web | ⬜ pending |

---

## Phase 2 — Monetization enforcement

| # | Task | Area | Status |
|---|------|------|--------|
| 2.1 | Audit server-side plan gates on all gated mutations | API | ⬜ pending |
| 2.2 | Enforce learner + automation usage limits | API | ⬜ pending |
| 2.3 | Stripe production hardening (dunning, webhooks) | API | ⬜ pending |

---

## Phase 3 — Production deploy

| # | Task | Area | Status |
|---|------|------|--------|
| 3.1 | Fix web production build (`@luxgen/agent` client bundle) | Web | ⬜ pending |
| 3.2 | API `tsc` build clean | API | ⬜ pending |
| 3.3 | Deploy staging (Vercel + Render + Atlas) | Ops | ⬜ pending |
| 3.4 | Set `REQUIRE_WEB_BUILD=1` in CI | Ops | ⬜ pending |

---

*Last updated: Phase 0 complete + iOS UI gap sprint (see [IOS_UI_AUDIT.md](./IOS_UI_AUDIT.md)).*
