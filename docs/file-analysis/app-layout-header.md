# File Analysis: apps/web/lib/app-layout-header.ts

## File Path and Purpose

**Path:** `apps/web/lib/app-layout-header.ts`

This file exports a single React hook, `useAppLayoutHeader`, that assembles all the props needed by the top-level application layout's header bar: theme toggle state, session validity, notification count, and a search handler. It wires together three subsystems — the theme library, the auth session event bus, and the notifications polling hook — into one composable return value, so the header component stays declarative and side-effect-free.

---

## Full Annotated Code

```typescript
import { useCallback, useEffect, useState } from 'react';
// useCallback: stable search handler reference across renders
// useEffect: subscribe to auth change events on mount, clean up on unmount
// useState: local sessionOk boolean state

import { useTheme as useAppearanceTheme } from './theme';
// Aliased import: avoids collision if a consumer also imports from a theme library.
// useAppearanceTheme returns { resolvedTheme: 'light' | 'dark', toggleTheme }

import { dispatchToggleNotifications } from './global-notifications';
// Imperative event dispatch — triggers the notification panel to open/close.
// This is a global event pattern rather than React state lifting, which
// avoids prop-drilling the toggle function through the layout tree.

import { useNotificationCount } from '../hooks/useNotificationCount';
// Polls or subscribes for the user's unread notification count.
// Takes a polling interval (ms); 0 or falsy disables polling.

import { validateClientSession } from './session-guard';
// Returns { ok: boolean } — checks localStorage for a valid, non-expired token.
// Synchronous, no I/O.

/** Shared header props: search bar + light/dark toggle for AppLayout */
export function useAppLayoutHeader() {
  const { resolvedTheme, toggleTheme } = useAppearanceTheme();
  // resolvedTheme: 'light' | 'dark' — the active theme after system preference
  // resolution. Using resolvedTheme (not theme) avoids 'system' as a value.

  const [sessionOk, setSessionOk] = useState(false);
  // Local state: true if the user has a valid, non-expired session.
  // Initializes to false (not logged in) — corrected by useEffect on mount.
  // This prevents SSR hydration mismatch: server renders "not logged in" state;
  // client confirms session validity after hydration.

  const notificationCount = useNotificationCount(sessionOk ? 60_000 : 0);
  // Passes polling interval: 60 seconds when logged in, 0 (disabled) when not.
  // This is a clean pattern: one line disables the entire notification polling
  // system for anonymous users without a conditional hook call.
  // IMPORTANT: hook call order is stable (not conditional) — React rules preserved.

  useEffect(() => {
    const refresh = () => setSessionOk(validateClientSession().ok);
    // Closure: refresh reads the latest session state from localStorage each time.
    // Does NOT need to close over the old sessionOk value.

    refresh(); // Run immediately on mount to sync with current session state.

    window.addEventListener('luxgen-auth-change', refresh);
    // Subscribe to auth change events dispatched by session.ts on login/logout.
    // When the user logs in: AUTH_SESSION_CHANGE_EVENT fires → refresh() →
    // setSessionOk(true) → React re-renders → notificationCount polling starts.

    return () => window.removeEventListener('luxgen-auth-change', refresh);
    // Cleanup on unmount: removes the event listener to prevent memory leaks
    // and stale state updates on unmounted components.
    // This is correct cleanup — without it, multiple mounts (Strict Mode double-mount,
    // fast refresh) would accumulate duplicate listeners.
  }, []);
  // Empty dependency array: run once on mount, clean up on unmount.
  // The effect doesn't depend on any reactive values — `refresh` is redefined
  // each render but that's fine; the listener always calls the latest closure.

  const onSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q || typeof window === 'undefined') return;
    // Guard: skip empty queries and SSR calls (typeof window check).

    const path = window.location.pathname;
    const url = new URL(window.location.href);
    url.searchParams.set('search', q);

    if (
      path.startsWith('/products') ||
      path.startsWith('/groups') ||
      path.startsWith('/users') ||
      path.startsWith('/courses') ||
      path.startsWith('/customers')
    ) {
      // In-page search: update the URL query param and fire a synthetic popstate.
      // This triggers the current page's useSearchParams/router to re-fetch
      // with the new search parameter — no full page navigation.
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
      // NOTE: window.history.pushState does NOT fire a popstate event by itself.
      // This manual dispatch is necessary for route-aware components that listen
      // to popstate rather than using React Router's useLocation.
      return;
    }

    // Cross-page search: navigate to /search with the query.
    const tenant = new URLSearchParams(window.location.search).get('tenant');
    const searchUrl = `/search?q=${encodeURIComponent(q)}${tenant ? `&tenant=${encodeURIComponent(tenant)}` : ''}`;
    window.location.assign(searchUrl);
    // location.assign triggers a full navigation (new browser history entry).
    // encodeURIComponent ensures special characters in the query don't break the URL.
    // tenant parameter is forwarded to preserve tenant context in the search results.
  }, []);
  // Empty dependency array for useCallback: onSearch captures no reactive values.
  // window.location is read inside the function (not at capture time) — correct.
  // This means the callback is stable across renders — the header component's
  // SearchInput won't re-render due to onSearch reference changes.

  return {
    showSearch: true,         // Always show — could be made conditional on session/plan
    showThemeToggle: true,    // Always show
    isDarkMode: resolvedTheme === 'dark',
    onThemeToggle: toggleTheme,
    onSearch,
    searchPlaceholder: 'Search groups, products, users…',
    showNotifications: sessionOk,    // Hide notification bell for anonymous users
    notificationCount,
    onNotificationClick: dispatchToggleNotifications,
  };
}
```

---

## Exported Functions

| Name | Inputs | Outputs | Complexity | Side Effects | Pure? |
|---|---|---|---|---|---|
| `useAppLayoutHeader` | none | `object` with 9 header prop fields | O(1) per render | `window.addEventListener` on mount, `removeEventListener` on unmount | Impure (React hook with side effects) |

**Note:** `useCallback` memoizes `onSearch` — it's only re-created on component mount. `useEffect` runs once on mount. `useState` triggers re-renders on session change.

---

## Design Patterns Used

**Façade / Composition Hook:** `useAppLayoutHeader` is a composition hook that aggregates multiple hooks (`useTheme`, `useState`, `useNotificationCount`) and one effect into a single interface. The consuming component (`AppLayout`) imports one hook and gets all header-related behavior — this is the "logic layer separated from presentation" pattern.

**Controlled Polling Gate:** Passing `sessionOk ? 60_000 : 0` to `useNotificationCount` is an elegant way to conditionally enable polling without breaking React's hook rules (hooks cannot be called conditionally). The `0` polling interval disables the internal `setInterval` inside `useNotificationCount`.

**Custom Event Bus:** `window.addEventListener('luxgen-auth-change', refresh)` and `notifyAuthSessionChange()` in session.ts form a lightweight pub-sub channel scoped to a single browser tab. For cross-tab sync, this would need to be combined with a `storage` event listener.

**Stable Callback Reference:** `useCallback(fn, [])` with an empty dependency array creates a function reference that never changes. This is important when passed as a prop to `React.memo`-wrapped components — prevents unnecessary re-renders of the search input.

---

## Security Considerations

1. **`encodeURIComponent` on search query:** Correctly prevents XSS-via-URL-construction. A query containing `"><script>` would be safely encoded.

2. **Tenant parameter forwarded in search URL:** `tenant` is read from `window.location.search` and passed to `/search`. This relies on the tenant already being in the URL (trustworthy — set by the app's own routing). If tenant came from an untrusted source, encodeURIComponent would still prevent injection.

3. **`window.location.assign` vs `router.push`:** Using the native browser API rather than Next.js router means the search navigation bypasses any Next.js middleware (including auth guards). If `/search` is a protected route, the middleware would still run (it's server-side), but the client-side auth guard in Next.js routing wouldn't intercept first.

4. **`PopStateEvent` manual dispatch:** Dispatching a synthetic popstate event means any listener that expects popstate (including browser history management code) receives a synthetic event. This is generally safe but could interact unexpectedly with browser extensions or analytics libraries that listen to popstate.

---

## Performance Considerations

- `useCallback(onSearch, [])` prevents new function identity on every render — correct for preventing unnecessary child component re-renders.
- `useNotificationCount` with `60_000` ms polling interval means at most 1 network request per minute per logged-in user — reasonable.
- `validateClientSession().ok` is synchronous and reads localStorage — O(1) per call. Safe to call on every `luxgen-auth-change` event.
- The `typeof window === 'undefined'` check inside `onSearch` is redundant in a client component (the hook can only run in the browser since it uses `useState` and `useEffect`), but it's a defensive guard that doesn't hurt.

---

## 10 Interview Questions

1. Why does `useAppLayoutHeader` pass `0` to `useNotificationCount` when the user is not logged in instead of not calling the hook?
2. Explain the cleanup function in the `useEffect`. What bug would occur if the `return () => window.removeEventListener(...)` line were missing?
3. `window.history.pushState` does not fire a `popstate` event. Why is a manual `window.dispatchEvent(new PopStateEvent('popstate'))` necessary, and what components depend on it?
4. Why is `useCallback` used for `onSearch` with an empty dependency array? What happens to child component rendering if you remove `useCallback`?
5. What is the difference between `window.location.assign(url)` and `window.location.href = url`? Does the choice matter here?
6. The hook initializes `sessionOk` to `false`. What user-visible flicker could this cause, and how would you mitigate it?
7. `validateClientSession().ok` is called synchronously on every `luxgen-auth-change` event. If this function were async (e.g., it called the API to validate the token), how would the `useEffect` need to change?
8. How would you extend `useAppLayoutHeader` to support per-tenant feature flags (e.g., `showNotifications` is false for tenants on the free plan)?
9. `dispatchToggleNotifications` is a global imperative event dispatch rather than a React state setter. What are the tradeoffs? When would you prefer lifting state vs. using a global event?
10. This hook uses the browser's `storage` event indirectly (via `luxgen-auth-change`). Describe how you would extend this to support cross-tab session sync (logout in one tab should update all tabs).

---

## What Would You Change? — 3 Concrete Improvements

**1. Use `router.push` for cross-page search navigation (Next.js App Router):**
```typescript
import { useRouter } from 'next/navigation';
// inside the hook:
const router = useRouter();
// in onSearch cross-page branch:
router.push(searchUrl); // Uses Next.js navigation, triggers middleware, shallow transitions
```
This allows client-side navigation (no full page reload), preserves scroll position restoration, and triggers Next.js middleware on the client-side navigation path.

**2. Listen to storage events for cross-tab session sync:**
```typescript
useEffect(() => {
  const refresh = () => setSessionOk(validateClientSession().ok);
  refresh();
  window.addEventListener('luxgen-auth-change', refresh);

  // Cross-tab: detect epoch change from other tabs
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'authSessionEpoch') refresh();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener('luxgen-auth-change', refresh);
    window.removeEventListener('storage', onStorage);
  };
}, []);
```

**3. Avoid initial `false` flash for `sessionOk` by initializing from `validateClientSession`:**
```typescript
const [sessionOk, setSessionOk] = useState(() => validateClientSession().ok);
// Lazy useState initializer: runs validateClientSession once on mount
// (synchronously, before render) rather than starting false and correcting
// in a useEffect. Eliminates the false→true flash for logged-in users.
// Note: still runs client-side only; SSR renders with the lazy init value
// resolved on the server, which is false (no localStorage). This is acceptable
// because the header with notification state is client-rendered.
```

---

## Related Concepts to Review

- React hooks rules: no conditional hook calls, stable identity across renders
- `useCallback` and `useMemo` — when they help and when they're premature optimization
- `useEffect` cleanup functions — memory leak prevention
- Custom browser events vs React state for cross-component communication
- `window.history.pushState` vs `popstate` event — why pushState doesn't fire popstate
- Next.js App Router: `useRouter().push` vs `window.location.assign`
- Polling patterns in React — setInterval inside hooks, AbortController
- React `useState` lazy initializer pattern — `useState(() => computeValue())`
