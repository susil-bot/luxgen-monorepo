import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { buildLoginRedirect, requiresAuth } from '../../lib/auth-routes';
import { validateClientSession } from '../../lib/session-guard';

const CHECK_INTERVAL_MS = 30_000;

interface SessionMonitorProps {
  onSessionExpired?: () => void;
}

/**
 * Periodically validates JWT expiry and tenant match; redirects with the right reason.
 * Pair with Apollo error link in graphql/client.ts for API-side 401 handling.
 */
export function SessionMonitor({ onSessionExpired }: SessionMonitorProps) {
  const router = useRouter();
  const handlingRef = useRef(false);

  useEffect(() => {
    const handleInvalid = (reason: 'session_expired' | 'tenant_mismatch') => {
      if (handlingRef.current) return;
      handlingRef.current = true;

      onSessionExpired?.();

      const returnPath = router.asPath || router.pathname;
      const onProtected = requiresAuth(router.pathname);

      if (onProtected) {
        void router.replace(buildLoginRedirect(returnPath, reason));
      } else {
        handlingRef.current = false;
      }
    };

    const check = () => {
      const validation = validateClientSession();
      if (!validation.ok && validation.reason !== 'unauthorized') {
        handleInvalid(validation.reason as 'session_expired' | 'tenant_mismatch');
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
