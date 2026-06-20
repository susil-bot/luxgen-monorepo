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
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
}

export const AUTH_SESSION_CHANGE_EVENT = 'luxgen-auth-change';

function notifyAuthSessionChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
}

export const AUTH_STORAGE_KEYS = {
  token: 'authToken',
  user: 'currentUser',
  tenant: 'currentTenant',
  expiresAt: 'authTokenExpiresAt',
  /** Bumped on login/logout — cross-tab session sync via storage events */
  sessionEpoch: 'authSessionEpoch',
} as const;

interface JwtPayload {
  exp?: number;
  iat?: number;
}

/** Decode JWT payload without verifying signature (client-side expiry only). */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiresAt(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

export function isTokenExpired(token: string | null, skewMs = 30_000): boolean {
  if (!token) return true;
  const expiresAt = getTokenExpiresAt(token);
  if (!expiresAt) return true; // no exp claim = treat as expired (security default)
  return Date.now() >= expiresAt - skewMs;
}

export function getStoredTokenExpiresAt(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.expiresAt);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function isStoredSessionExpired(skewMs = 30_000): boolean {
  if (typeof window === 'undefined') return true;
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  if (!token) return true;

  const storedExpiry = getStoredTokenExpiresAt();
  const expiresAt = storedExpiry ?? getTokenExpiresAt(token);
  if (!expiresAt) return false;
  return Date.now() >= expiresAt - skewMs;
}

/** Persist auth session after login or register. */
export function persistSession(token: string, user: SessionUser): void {
  if (typeof window === 'undefined') return;

  const expiresAt = getTokenExpiresAt(token);

  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(AUTH_STORAGE_KEYS.tenant, user.tenant.subdomain);
  localStorage.setItem(AUTH_STORAGE_KEYS.sessionEpoch, String(Date.now()));
  if (expiresAt) {
    localStorage.setItem(AUTH_STORAGE_KEYS.expiresAt, String(expiresAt));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEYS.expiresAt);
  }

  // Keep @luxgen/ui UserProvider in sync (reads luxgen_user)
  localStorage.setItem(
    'luxgen_user',
    JSON.stringify({
      name: `${user.firstName} ${user.lastName}`.trim() || user.email,
      email: user.email,
      role: user.role,
      tenant: user.tenant,
    }),
  );

  notifyAuthSessionChange();
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
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
  return next;
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
    if (key !== AUTH_STORAGE_KEYS.sessionEpoch) {
      localStorage.removeItem(key);
    }
  });
  // Legacy UI cache — must stay in sync with canonical session keys
  localStorage.removeItem('luxgen_user');
  localStorage.setItem(AUTH_STORAGE_KEYS.sessionEpoch, String(Date.now()));
  notifyAuthSessionChange();
}

export function getMsUntilExpiry(): number | null {
  const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEYS.token) : null;
  if (!token) return null;

  const expiresAt = getStoredTokenExpiresAt() ?? getTokenExpiresAt(token);
  if (!expiresAt) return null;
  return Math.max(0, expiresAt - Date.now());
}
