import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { client } from '../../graphql/client';
import { buildLoginRedirect, requiresAuth } from '../../lib/auth-routes';
import { AUTH_STORAGE_KEYS } from '../../lib/session';

/**
 * Keeps tabs in sync when login/logout happens in another window.
 * Uses localStorage `storage` events (same-origin only).
 */
export function SessionSync() {
  const router = useRouter();
  const handlingRef = useRef(false);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || handlingRef.current) return;

      const { key, newValue, oldValue } = event;

      if (key === AUTH_STORAGE_KEYS.token) {
        if (!newValue && oldValue) {
          handlingRef.current = true;
          void client.clearStore();
          if (requiresAuth(router.pathname)) {
            void router.replace(buildLoginRedirect(router.asPath, 'session_replaced'));
          } else {
            handlingRef.current = false;
          }
          return;
        }

        if (newValue && newValue !== oldValue) {
          void client.resetStore();
        }
      }

      if (key === AUTH_STORAGE_KEYS.sessionEpoch && newValue !== oldValue) {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
        if (!token && requiresAuth(router.pathname)) {
          handlingRef.current = true;
          void client.clearStore();
          void router.replace(buildLoginRedirect(router.asPath, 'session_replaced'));
        } else if (token) {
          void client.resetStore();
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  return null;
}
