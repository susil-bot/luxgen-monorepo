import { AuthLoadingScreen } from './AuthNoticeBanner';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { buildLoginRedirect, requiresAuth } from '../../lib/auth-routes';
import { validateClientSession } from '../../lib/session-guard';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Redirects unauthenticated users away from protected app routes.
 * Distinguishes missing token, expired JWT, and wrong-tenant sessions.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const path = router.pathname;
    const needsAuth = requiresAuth(path);

    if (!needsAuth) {
      setAllowed(true);
      setRedirecting(false);
      return;
    }

    const validation = validateClientSession();
    if (validation.ok) {
      setAllowed(true);
      setRedirecting(false);
      return;
    }

    setRedirecting(true);
    const returnPath = router.asPath || path;
    void router.replace(buildLoginRedirect(returnPath, validation.reason));
  }, [router.isReady, router.pathname, router.asPath, router]);

  if (!router.isReady) {
    return <AuthLoadingScreen label="Loading…" />;
  }

  if (redirecting || (requiresAuth(router.pathname) && !allowed)) {
    return <AuthLoadingScreen label="Redirecting to sign in…" />;
  }

  return <>{children}</>;
}
