/**
 * Silent access-token renewal using the httpOnly refresh cookie.
 *
 * Calls the *relative* path `/api/auth/refresh`, not the absolute cross-domain
 * API URL. `next.config.js` rewrites `/api/auth/:path*` to the real API host
 * server-side, so from the browser's point of view this is a same-origin
 * request (relative to whatever domain the dashboard is served from, e.g.
 * luxgen.shop) — the httpOnly refresh cookie set on login travels with it
 * either way, but routing through the same-origin rewrite is the more robust
 * choice since it also works before/without the sameSite:'none' cookie fix
 * (see apps/api/src/utils/refreshToken.ts) if that ever regresses.
 *
 * `credentials: 'include'` is set explicitly rather than relying on the
 * fetch default (`same-origin`) — this keeps the call correct even if a
 * future deployment points NEXT_PUBLIC_GRAPHQL_URL (and this call) directly
 * at the cross-domain API host instead of through the rewrite.
 */
import { updateStoredToken } from './session';

interface RefreshResponse {
  success: boolean;
  data?: { token: string; expiresIn?: string };
  message?: string;
}

// De-duplicate concurrent refresh attempts: if five GraphQL calls all get a
// 401 within the same tick, they should trigger exactly one network call to
// /api/auth/refresh, not five (which would also race on rotating the cookie).
let inFlightRefresh: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as RefreshResponse;
    if (!body.success || !body.data?.token) {
      return null;
    }

    updateStoredToken(body.data.token);
    return body.data.token;
  } catch {
    // Network error, offline, refresh endpoint unreachable, etc. — treat as
    // "refresh failed", the caller falls back to a normal logout/redirect.
    return null;
  }
}

/**
 * Attempt a silent token refresh. Returns the new access token on success,
 * or null if the refresh cookie is missing/expired/invalid — in which case
 * the caller should fall back to clearing the session and redirecting to
 * login, exactly as it already does when there's no refresh flow at all.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

/**
 * Best-effort server-side logout so the httpOnly refresh cookie is actually
 * revoked (cleared) too, not just the local access token. Fire-and-forget by
 * design — callers (performLogout) clear localStorage and redirect
 * synchronously and should not block on network for that.
 */
export async function revokeRefreshToken(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    // Non-fatal — the local session is already cleared by the caller
    // regardless of whether this network call succeeds (offline, API down).
  }
}
