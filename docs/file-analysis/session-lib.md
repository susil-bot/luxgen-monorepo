# File Analysis: apps/web/lib/session.ts

## File Path and Purpose

**Path:** `apps/web/lib/session.ts`

This is the canonical client-side session persistence library for the Next.js frontend. It manages storing, reading, updating, and clearing the JWT and user profile in `localStorage`, mirrors critical fields into browser cookies for SSR layout access (the Next.js App Router reads cookies on the server), and broadcasts session state changes cross-tab via `window.dispatchEvent` and the Storage API.

---

## Full Annotated Code

```typescript
/**
 * Client-side session persistence and JWT expiry handling.
 * Tokens are issued by the API; we decode `exp` locally (no signature verify).
 */

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
}
// The client-side user shape. Intentionally a subset of IUser from the backend —
// we only store what the UI needs in localStorage.

export const AUTH_SESSION_CHANGE_EVENT = 'luxgen-auth-change';
// Custom browser event name. Components subscribe to this to react to
// login/logout without polling. Using a named constant prevents typos
// across the codebase (one source of truth for the event name).

function notifyAuthSessionChange(): void {
  if (typeof window === 'undefined') return;
  // Guard for SSR — this module may be imported in server components;
  // window.dispatchEvent would throw in a Node.js context.
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
}

export const AUTH_STORAGE_KEYS = {
  token:        'authToken',
  user:         'currentUser',
  tenant:       'currentTenant',
  expiresAt:    'authTokenExpiresAt',
  sessionEpoch: 'authSessionEpoch',
} as const;
// `as const` makes this a readonly object with literal types, not just string types.
// This enables exhaustive checks and ensures key names can't be accidentally mutated.
// sessionEpoch is bumped on every login/logout — cross-tab sync via storage events.

/** Cookie names mirrored from localStorage for SSR layout user (UI-09). */
export const SSR_AUTH_COOKIE_NAMES = {
  token:      'authToken',
  layoutUser: 'layoutUser',
} as const;
// Two separate constants (STORAGE_KEYS vs COOKIE_NAMES) because some keys
// (e.g., sessionEpoch) live only in localStorage, not cookies.

function cookieMaxAgeSeconds(token: string): number {
  const expiresAt = getTokenExpiresAt(token);
  if (!expiresAt) return 60 * 60 * 24 * 7; // 7 days fallback if no exp claim
  return Math.max(60, Math.floor((expiresAt - Date.now()) / 1000));
  // Math.max(60, ...) ensures the cookie lasts at least 60 seconds —
  // prevents setting a cookie that expires immediately due to clock skew.
}

function setSessionCookies(token: string, user: SessionUser): void {
  const maxAge = cookieMaxAgeSeconds(token);
  const base = `path=/; SameSite=Lax; max-age=${maxAge}`;
  // SameSite=Lax: cookie is sent on top-level navigations from external sites
  // but not on cross-site subresource requests (fetch, XHR). This protects
  // against CSRF while allowing login links from emails to work.
  // SameSite=Strict would block email login links; None would allow CSRF.
  // Lax is the correct choice for a web app with SSR.
  // NOTE: 'Secure' flag is missing. In production, cookies carrying JWTs
  // MUST be Secure to prevent transmission over HTTP.

  const layoutUser = JSON.stringify({
    name: `${user.firstName} ${user.lastName}`.trim() || user.email,
    email: user.email,
    role: user.role,
    tenant: user.tenant.subdomain,
    avatarUrl: user.avatar,
  });
  // layoutUser is a minimal user shape for SSR rendering (not the full JWT).
  // The SSR layout can render the user's name/avatar without re-hitting the API.

  document.cookie = `${SSR_AUTH_COOKIE_NAMES.token}=${encodeURIComponent(token)}; ${base}`;
  document.cookie = `${SSR_AUTH_COOKIE_NAMES.layoutUser}=${encodeURIComponent(layoutUser)}; ${base}`;
  // document.cookie assignment appends/updates (not replaces all cookies).
  // encodeURIComponent handles special characters in token ('+', '/') that
  // would break cookie parsing.
  // SECURITY NOTE: The JWT itself is stored in a cookie WITHOUT HttpOnly.
  // This means JavaScript can read it (same as localStorage). HttpOnly cookies
  // would prevent XSS from stealing the token, but HttpOnly cookies can't be
  // set by JavaScript — they require the server to Set-Cookie. This is a
  // known architectural tradeoff of the client-side session approach.
}

function clearSessionCookies(): void {
  const base = 'path=/; max-age=0';
  // max-age=0 instructs the browser to immediately delete the cookie.
  // This is the correct way to delete cookies in JavaScript — setting
  // an expiry in the past also works but max-age=0 is cleaner.
  document.cookie = `${SSR_AUTH_COOKIE_NAMES.token}=; ${base}`;
  document.cookie = `${SSR_AUTH_COOKIE_NAMES.layoutUser}=; ${base}`;
}

interface JwtPayload {
  exp?: number;   // Expiry: seconds since Unix epoch
  iat?: number;   // Issued at: seconds since Unix epoch
}

/** Decode JWT payload without verifying signature (client-side expiry only). */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1]; // Get the payload (middle) segment
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    // JWT uses Base64URL encoding (- instead of +, _ instead of /).
    // atob() expects standard Base64, so we must convert.
    // Note: atob() does not handle padding ('=') — JWT payloads may lack padding.
    // For short payloads this could fail. A robust fix adds padding:
    // const padded = part + '='.repeat((4 - part.length % 4) % 4);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null; // Malformed JWT — treat as no payload
  }
}

export function getTokenExpiresAt(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000; // Convert seconds to milliseconds for Date.now() comparison
}

export function isTokenExpired(token: string | null, skewMs = 30_000): boolean {
  if (!token) return true;
  const expiresAt = getTokenExpiresAt(token);
  if (!expiresAt) return true; // No exp claim = treat as expired (secure default)
  return Date.now() >= expiresAt - skewMs;
  // skewMs (default 30s): expire the token 30 seconds before its actual expiry.
  // This prevents sending a request with a token that will expire during transit.
  // 30 seconds is a standard NTP-drift allowance.
}

export function getStoredTokenExpiresAt(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.expiresAt);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
  // Number.isFinite guards against 'null', 'undefined', 'NaN', 'Infinity'
  // being stored in localStorage by a bug and causing Date comparison issues.
}

export function isStoredSessionExpired(skewMs = 30_000): boolean {
  if (typeof window === 'undefined') return true;
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  if (!token) return true;

  const storedExpiry = getStoredTokenExpiresAt();
  const expiresAt = storedExpiry ?? getTokenExpiresAt(token);
  // Priority: use the pre-cached expiresAt from localStorage (fast, no decode).
  // Fall back to decoding the token if the stored value is missing.

  if (!expiresAt) return false;
  // SECURITY NOTE: if we can't determine expiry, we treat the session as
  // NOT expired (returns false). This is permissive. The API will reject
  // the token on the next request — but the user won't be proactively logged out.
  // A stricter default would return true here.

  return Date.now() >= expiresAt - skewMs;
}

/** Persist auth session after login or register. */
export function persistSession(token: string, user: SessionUser): void {
  if (typeof window === 'undefined') return; // SSR guard

  const expiresAt = getTokenExpiresAt(token);

  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(AUTH_STORAGE_KEYS.tenant, user.tenant.subdomain);
  localStorage.setItem(AUTH_STORAGE_KEYS.sessionEpoch, String(Date.now()));
  // sessionEpoch bumped on login → other tabs listening to `storage` events
  // can detect the login and refresh their state.

  if (expiresAt) {
    localStorage.setItem(AUTH_STORAGE_KEYS.expiresAt, String(expiresAt));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEYS.expiresAt);
    // Don't store 'null' as a string — remove the key entirely so
    // getStoredTokenExpiresAt() correctly returns null.
  }

  // Keep @luxgen/ui UserProvider in sync (reads 'luxgen_user')
  localStorage.setItem(
    'luxgen_user',
    JSON.stringify({
      name: `${user.firstName} ${user.lastName}`.trim() || user.email,
      email: user.email,
      role: user.role,
      tenant: user.tenant,
      avatar: user.avatar,
    }),
  );
  // This is a legacy key for the UI package's UserContext. Having two keys
  // (AUTH_STORAGE_KEYS.user AND 'luxgen_user') with overlapping data is a
  // maintenance risk — they can drift. The comment correctly identifies this debt.

  setSessionCookies(token, user);
  notifyAuthSessionChange();
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null; // Malformed JSON in localStorage — treat as no user
  }
}

/** Merge profile fields into persisted session (after updateUser or local edit) */
export function updateStoredUser(partial: Partial<SessionUser>): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const user = getStoredUser();
  if (!user) return null;
  const next = { ...user, ...partial };
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(next));
  localStorage.setItem(AUTH_STORAGE_KEYS.sessionEpoch, String(Date.now()));
  // NOTE: Does NOT update 'luxgen_user' or the cookies. If avatar changes
  // via updateStoredUser, the SSR cookie shows the old avatar until full
  // page reload triggers persistSession.
  return next;
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
    if (key !== AUTH_STORAGE_KEYS.sessionEpoch) {
      localStorage.removeItem(key);
    }
  });
  // sessionEpoch is NOT cleared — it's bumped instead (below).
  // This ensures cross-tab listeners detect the logout even if they
  // check the epoch value rather than the token.

  localStorage.removeItem('luxgen_user'); // Clear legacy UI cache key
  clearSessionCookies();

  localStorage.setItem(AUTH_STORAGE_KEYS.sessionEpoch, String(Date.now()));
  notifyAuthSessionChange();
}

export function getMsUntilExpiry(): number | null {
  const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEYS.token) : null;
  if (!token) return null;

  const expiresAt = getStoredTokenExpiresAt() ?? getTokenExpiresAt(token);
  if (!expiresAt) return null;
  return Math.max(0, expiresAt - Date.now());
  // Math.max(0, ...) prevents returning a negative number for already-expired tokens.
  // Callers can use this to schedule a refresh: setTimeout(refresh, getMsUntilExpiry() - 60_000)
}

/**
 * Canonical client auth persistence (UI-190).
 * @luxgen/ui UserContext reads the same keys via getSessionUserAsUserMenu() in userService.
 */
export const CANONICAL_SESSION_DOC = 'apps/web/lib/session.ts' as const;
// This constant is a self-referential marker — it documents that THIS FILE
// is the authoritative source for session storage key names. Any other file
// that reads localStorage auth state should import from here.
```

---

## Exported Functions

| Name | Inputs | Outputs | Complexity | Side Effects | Pure? |
|---|---|---|---|---|---|
| `decodeJwtPayload` | `token: string` | `JwtPayload \| null` | O(n) token length | None | Pure |
| `getTokenExpiresAt` | `token: string` | `number \| null` | O(n) | None | Pure |
| `isTokenExpired` | `token \| null, skewMs?` | `boolean` | O(n) | None | Impure (reads `Date.now()`) |
| `getStoredTokenExpiresAt` | none | `number \| null` | O(1) | Reads localStorage | Impure |
| `isStoredSessionExpired` | `skewMs?` | `boolean` | O(n) | Reads localStorage | Impure |
| `persistSession` | `token, user` | `void` | O(1) | Writes localStorage, cookies, dispatches event | Impure |
| `getStoredUser` | none | `SessionUser \| null` | O(1) | Reads localStorage | Impure |
| `updateStoredUser` | `partial: Partial<SessionUser>` | `SessionUser \| null` | O(1) | Writes localStorage | Impure |
| `clearStoredSession` | none | `void` | O(k) k = key count | Clears localStorage, cookies, dispatches event | Impure |
| `getMsUntilExpiry` | none | `number \| null` | O(n) | Reads localStorage | Impure |

---

## Design Patterns Used

**Observer / Event Bus:** `window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT))` plus `window.addEventListener('luxgen-auth-change', ...)` in consuming components. This is a lightweight pub-sub pattern using the browser's native event system — no third-party dependency needed.

**Cross-Tab Sync:** `sessionEpoch` is bumped on every login/logout. Cross-tab sync is achieved via the browser's `storage` event (automatically fired in other tabs when localStorage changes). Components in other tabs listen to `storage` events and call `getStoredUser()` to refresh.

**Separation of Pure and Impure:** Token decoding functions (`decodeJwtPayload`, `getTokenExpiresAt`, `isTokenExpired`) are pure and testable without a browser environment. Storage functions require a browser.

**Dual Store (localStorage + cookies):** Cookies enable SSR reads (Next.js server components can read `Request.cookies`). localStorage enables client-side reads without an extra API call. This is a deliberate hybrid approach.

---

## Security Considerations

**Well-handled:**
- `isTokenExpired` with a 30-second skew prevents sending near-expired tokens
- Base64URL decoding handles JWT's non-standard encoding correctly
- `SameSite=Lax` prevents CSRF attacks on cookie-authenticated requests
- SSR guard (`typeof window === 'undefined'`) prevents Node.js crashes

**Gaps:**
1. **`Secure` flag missing on cookies.** `authToken` cookie set without `; Secure` means it could be transmitted over HTTP in mixed-content environments. In production, add `${location.protocol === 'https:' ? '; Secure' : ''}` dynamically.
2. **JWT stored in localStorage is XSS-accessible.** Any XSS vulnerability anywhere on the page can steal the token. HttpOnly+Secure cookie (set server-side) would prevent this. The tradeoff is that SSR would require a different approach to reading the token client-side.
3. **`atob()` without padding normalization.** JWT payloads with length not divisible by 4 will throw in some browsers. Add `part + '='.repeat((4 - part.length % 4) % 4)` before `atob()`.
4. **`updateStoredUser` doesn't update `luxgen_user` or cookies.** An avatar/name update via the profile page doesn't reflect in the SSR layout cookie until the next full login. The user sees stale data in SSR renders.

---

## Performance Considerations

- All functions are O(1) or O(n=token-length) — no meaningful compute cost
- `decodeJwtPayload` is called repeatedly (`isTokenExpired` → `getTokenExpiresAt` → `decodeJwtPayload`). For high-frequency polling, memoize with the token string as key
- `clearStoredSession` iterates `Object.values(AUTH_STORAGE_KEYS)` (5 keys) — O(5) = negligible
- `persistSession` writes 6 localStorage keys + 2 cookies — 8 storage operations on login. This is fine for a once-per-session operation

---

## 10 Interview Questions

1. Why is the JWT decoded client-side (without verifying the signature) for expiry checking? Is this safe?
2. What is the difference between `SameSite=Strict`, `SameSite=Lax`, and `SameSite=None` for cookies? Why is `Lax` used here?
3. What is `Base64URL` encoding and how does it differ from standard Base64? Why does `decodeJwtPayload` do the `-` → `+` and `_` → `/` replacements?
4. Why does `clearStoredSession` bump `sessionEpoch` instead of clearing it? How does this enable cross-tab logout?
5. If two tabs are open and the user logs out in tab A, what mechanism causes tab B to update? Trace the code path.
6. What is the `Secure` cookie flag? What attack does its absence enable? Why can JavaScript not set `HttpOnly` cookies?
7. `updateStoredUser` returns `SessionUser | null`. When would it return `null`, and what should the caller do in that case?
8. Why is `CANONICAL_SESSION_DOC = 'apps/web/lib/session.ts' as const` exported? What problem is this solving?
9. `isStoredSessionExpired` returns `false` when `expiresAt` is null. Is this secure? What alternative behavior would you implement?
10. Describe a race condition that could occur if two browser tabs both call `persistSession` simultaneously (e.g., after a token refresh).

---

## What Would You Change? — 3 Concrete Improvements

**1. Add Base64URL padding and dynamic Secure flag for cookies:**
```typescript
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const padded = part.replace(/-/g, '+').replace(/_/g, '/');
    const withPadding = padded + '='.repeat((4 - padded.length % 4) % 4);
    return JSON.parse(atob(withPadding)) as JwtPayload;
  } catch { return null; }
}

function setSessionCookies(token: string, user: SessionUser): void {
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  const base = `path=/; SameSite=Lax; max-age=${maxAge}${secure}`;
  // ... rest unchanged
}
```

**2. Sync `luxgen_user` and cookies in `updateStoredUser`:**
```typescript
export function updateStoredUser(partial: Partial<SessionUser>): SessionUser | null {
  // ... existing merge logic ...
  // Add:
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  if (token) setSessionCookies(token, next);
  localStorage.setItem('luxgen_user', JSON.stringify({
    name: `${next.firstName} ${next.lastName}`.trim() || next.email,
    email: next.email, role: next.role, tenant: next.tenant, avatar: next.avatar,
  }));
  notifyAuthSessionChange();
  return next;
}
```

**3. Memoize JWT decode to avoid repeated parsing:**
```typescript
const jwtPayloadCache = new Map<string, JwtPayload | null>();
export function decodeJwtPayload(token: string): JwtPayload | null {
  if (jwtPayloadCache.has(token)) return jwtPayloadCache.get(token)!;
  // ... decode logic ...
  jwtPayloadCache.set(token, result);
  return result;
}
// Clear cache on session clear to prevent memory leak on logout.
```

---

## Related Concepts to Review

- JWT structure: header, payload, signature — Base64URL encoding
- Browser Storage APIs: `localStorage`, `sessionStorage`, `document.cookie`
- Cookie attributes: `HttpOnly`, `Secure`, `SameSite`, `max-age`, `expires`, `path`
- Cross-tab communication: `storage` event, `BroadcastChannel` API
- XSS attack vectors and token theft
- CSRF attack and SameSite cookie protection
- SSR/CSR hydration in Next.js — when code runs on server vs. client
- `typeof window === 'undefined'` as an SSR guard
