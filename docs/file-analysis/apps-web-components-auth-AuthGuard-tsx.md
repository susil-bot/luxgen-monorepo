# AuthGuard.tsx — Deep Analysis (Hand-enriched)

## File Path

`apps/web/components/auth/AuthGuard.tsx`

## Purpose

Client-side route guard for **authenticated-only** paths. Works with `requiresAuth()` from `lib/auth-routes.ts`.

Does **not** replace server auth — API still enforces JWT.

## Key Functions

### `AuthGuardRedirect` — Lines 14–24

- **Effect:** `router.replace(buildLoginRedirect(returnPath, reason))` once
- **Pattern:** `useRef(didRedirect)` prevents redirect loop
- **UX:** Shows `AuthLoadingScreen` while redirecting

### `AuthGuard` — Lines 31–65

| Phase | Behavior |
|-------|----------|
| Public route | Render children (no auth check) |
| `!mounted` | Render children (SSR/hydration safe) |
| Invalid session | `AuthGuardRedirect` |
| Valid session | Render children |

### `authEpoch` state (line 33)

- Incremented on `AUTH_SESSION_CHANGE_EVENT` and `storage`
- Forces re-render → re-run `validateClientSession()`
- **Fixed bug:** was `setSessionVersion` after state removed (UI-98)

## Interview Questions

1. Why render children before mount on protected routes?  
2. Difference vs middleware-only auth?  
3. How to test AuthGuard with React Testing Library?

## Real-world usage

Wrapped in `_app.tsx` around every page component.

## Refactor option

Use Next middleware for coarse gate + AuthGuard for fine-grained client refresh (current hybrid).
