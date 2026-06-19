import type { AuthRedirectReason } from './auth-notices';
import { AUTH_STORAGE_KEYS, clearStoredSession, getStoredUser, isStoredSessionExpired } from './session';
import { isSessionTenantMismatch } from './tenant-auth';

export type SessionValidation =
  | { ok: true }
  | { ok: false; reason: AuthRedirectReason };

/**
 * Validate browser session for protected routes.
 * Clears invalid sessions (expired or wrong tenant) before returning.
 */
export function validateClientSession(): SessionValidation {
  if (typeof window === 'undefined') {
    return { ok: false, reason: 'unauthorized' };
  }

  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  if (!token) {
    return { ok: false, reason: 'unauthorized' };
  }

  if (isStoredSessionExpired()) {
    clearStoredSession();
    return { ok: false, reason: 'session_expired' };
  }

  const user = getStoredUser();
  if (isSessionTenantMismatch(user)) {
    clearStoredSession();
    return { ok: false, reason: 'tenant_mismatch' };
  }

  return { ok: true };
}

/** Map GraphQL / network auth failures to login redirect reason */
export function resolveAuthRedirectReason(
  graphQLErrors?: ReadonlyArray<{ message?: string; extensions?: { code?: string } }>,
  networkStatusCode?: number,
): AuthRedirectReason | null {
  const messages = graphQLErrors?.map((e) => e.message ?? '') ?? [];

  if (
    messages.some((m) => /not valid for this tenant|tenant mismatch|token tenant mismatch/i.test(m))
  ) {
    return 'tenant_mismatch';
  }

  if (
    graphQLErrors?.some((e) => e.extensions?.code === 'UNAUTHENTICATED') ||
    messages.some((m) => /expired|invalid token|authentication required/i.test(m)) ||
    networkStatusCode === 401
  ) {
    return 'session_expired';
  }

  if (
    graphQLErrors?.some((e) => e.extensions?.code === 'FORBIDDEN') ||
    networkStatusCode === 403
  ) {
    return 'unauthorized';
  }

  return null;
}
