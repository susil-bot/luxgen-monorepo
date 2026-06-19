import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { buildLoginRedirect, requiresAuth } from '../../lib/auth-routes';
import { clearStoredSession, isStoredSessionExpired } from '../../lib/session';

const CHECK_INTERVAL_MS = 60_000;

interface SessionMonitorProps {
  onSessionExpired?: () => void;
}

/**
 * Periodically checks JWT expiry and clears stale sessions.
 * Pair with Apollo error link in graphql/client.ts for API-side 401 handling.
 */
export function SessionMonitor({ onSessionExpired }: SessionMonitorProps) {
  const router = useRouter();
  const handlingRef = useRef(false);

  useEffect(() => {
    const handleExpired = () => {
      if (handlingRef.current) return;
      handlingRef.current = true;

      clearStoredSession();
      onSessionExpired?.();

      const returnPath = router.asPath || router.pathname;
      const onProtected = requiresAuth(router.pathname);

      if (onProtected) {
        void router.replace(buildLoginRedirect(returnPath, 'session_expired'));
      } else {
        handlingRef.current = false;
      }
    };

    const check = () => {
      if (isStoredSessionExpired()) {
        handleExpired();
      }
    };

    check();
    const id = window.setInterval(check, CHECK_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [router, onSessionExpired]);

  return null;
}
