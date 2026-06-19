# Auth UI — iOS Design Reference

> Client-side auth UX for LuxGen web: route guards, session expiry, logout, and login error states.  
> Follow `skills/ios-design/SKILL.md` — use `var(--color-*)` tokens and `.ios-*` utilities only.

---

## Components

| Component | Path | Purpose |
|-----------|------|---------|
| `AuthGuard` | `apps/web/components/auth/AuthGuard.tsx` | Blocks protected routes; shows iOS loading screen while redirecting |
| `SessionMonitor` | `apps/web/components/auth/SessionMonitor.tsx` | Polls JWT expiry + tenant match; redirects with `reason=` |
| `SessionSync` | `apps/web/components/auth/SessionSync.tsx` | Cross-tab login/logout via `localStorage` events |
| `AuthNoticeBanner` | `apps/web/components/auth/AuthNoticeBanner.tsx` | Inline notice on login (session expired, signed out, etc.) |
| `AuthLoadingScreen` | Same file as banner | Full-screen spinner for guard redirects |

### Wiring in `_app.tsx`

```tsx
<SessionMonitor />
<SessionSync />
<AuthGuard>
  <Component {...pageProps} />
</AuthGuard>
```

`SessionMonitor` runs globally. `SessionSync` keeps tabs aligned when login/logout happens elsewhere. `AuthGuard` wraps all pages and redirects unauthenticated users from protected prefixes.

---

## Redirect reasons (`?reason=`)

Defined in `apps/web/lib/auth-notices.ts`:

| Query value | Trigger | Banner variant |
|-------------|---------|----------------|
| `session_expired` | JWT past `exp`, SessionMonitor, Apollo 401 | warning |
| `unauthorized` | AuthGuard on protected route without token | warning |
| `logged_out` | `performLogout()` via sidebar/header | info |
| `tenant_mismatch` | Wrong subdomain vs account tenant (login, guard, API) | error |
| `session_replaced` | Logout or new login in another tab (`SessionSync`) | info |

`buildLoginRedirect(returnPath, reason?)` in `apps/web/lib/auth-routes.ts` sets both `redirect` and optional `reason`.

---

## Login error mapping

`formatLoginError()` maps API messages to user-friendly snackbar copy:

- Rate limit → “Too many sign-in attempts…”
- Deactivated / suspended → “This account is deactivated…”
- Invalid credentials → “Incorrect email or password…”
- Tenant mismatch → “This account is not valid for this workspace…”

Tenant helpers: `apps/web/lib/tenant-auth.ts` (`normalizeTenantSubdomain`, `isSessionTenantMismatch`). Session validation: `apps/web/lib/session-guard.ts`.

Used in `apps/web/pages/login.tsx` with `@luxgen/ui` `SnackbarProvider`.

---

## CSS utilities

Added in `apps/web/styles/globals.css`:

- `.auth-notice`, `.auth-notice--info|warning|error` — login banners
- `.auth-loading-screen` — guard loading state
- Reuses `.ios-spinner`, `.ios-btn-plain` for dismiss

---

## Related server auth (Phase 0)

| Feature | Doc |
|---------|-----|
| GraphQL JWT enforcement | [PRODUCT_TIMELINE.md](./PRODUCT_TIMELINE.md) § 0.4 |
| Deactivated accounts | § 0.5 |
| Login rate limit | § 0.6, `apps/api/.env.example` |

---

## Protected route prefixes

See `PROTECTED_PREFIXES` in `apps/web/lib/auth-routes.ts`. Public routes: `/`, `/login`, `/register`, `/listings` (index only).

---

*Last updated: Phase 0 iOS auth UI (AuthGuard wiring + notice banners).*
