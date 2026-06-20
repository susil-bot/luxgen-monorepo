import type { NextRouter } from 'next/router';
import { safeClearApolloStore } from '../graphql/safe-apollo-store';
import { buildLogoutRedirect } from './auth-routes';
import { clearStoredSession } from './session';

export interface LogoutOptions {
  /** Next.js router — uses client navigation when set */
  router?: Pick<NextRouter, 'push' | 'replace'>;
  /** Defaults to /login */
  redirectTo?: string;
  /** When true, redirect to login with signed-out notice (default true for router logout) */
  showLoggedOutNotice?: boolean;
  /** Reset Apollo cache (default true) */
  resetApolloCache?: boolean;
}

/**
 * Clear all auth session keys and optionally reset Apollo cache.
 * Clears: authToken, currentUser, currentTenant, authTokenExpiresAt
 */
export function performLogout(options: LogoutOptions = {}): void {
  const { router, redirectTo, resetApolloCache = true, showLoggedOutNotice = true } = options;
  const destination = redirectTo ?? (showLoggedOutNotice ? buildLogoutRedirect() : '/login');

  clearStoredSession();

  if (resetApolloCache) {
    void safeClearApolloStore();
  }

  if (router) {
    void router.push(destination);
  } else if (typeof window !== 'undefined') {
    window.location.href = destination;
  }
}

export type UserAction = 'profile' | 'settings' | 'logout';

/**
 * Shared sidebar/header user menu handler — use instead of per-page logout copies.
 */
export function createHandleUserAction(router: Pick<NextRouter, 'push'>) {
  return (action: UserAction) => {
    switch (action) {
      case 'profile':
        void router.push('/profile');
        break;
      case 'settings':
        void router.push('/settings');
        break;
      case 'logout':
        performLogout({ router });
        break;
    }
  };
}
