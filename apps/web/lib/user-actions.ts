import type { NextRouter } from 'next/router';
import { client } from '../graphql/client';
import { clearStoredSession } from './session';

export interface LogoutOptions {
  /** Next.js router — uses client navigation when set */
  router?: Pick<NextRouter, 'push' | 'replace'>;
  /** Defaults to /login */
  redirectTo?: string;
  /** Reset Apollo cache (default true) */
  resetApolloCache?: boolean;
}

/**
 * Clear all auth session keys and optionally reset Apollo cache.
 * Clears: authToken, currentUser, currentTenant, authTokenExpiresAt
 */
export function performLogout(options: LogoutOptions = {}): void {
  const { router, redirectTo = '/login', resetApolloCache = true } = options;

  clearStoredSession();

  if (resetApolloCache) {
    void client.clearStore();
  }

  if (router) {
    void router.push(redirectTo);
  } else if (typeof window !== 'undefined') {
    window.location.href = redirectTo;
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
