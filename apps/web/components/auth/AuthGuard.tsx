import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { getAuthToken } from '../lib/auth';
import { buildLoginRedirect, requiresAuth } from '../lib/auth-routes';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Redirects unauthenticated users away from protected app routes.
 * Wrap once in `_app.tsx` — individual pages do not need their own checks.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const path = router.pathname;
    const needsAuth = requiresAuth(path);

    if (!needsAuth) {
      setAllowed(true);
      return;
    }

    const token = getAuthToken();
    if (token) {
      setAllowed(true);
      return;
    }

    const returnPath = router.asPath || path;
    void router.replace(buildLoginRedirect(returnPath));
  }, [router.isReady, router.pathname, router.asPath, router]);

  if (!router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="ios-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (requiresAuth(router.pathname) && !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="ios-spinner" aria-label="Redirecting to login" />
      </div>
    );
  }

  return <>{children}</>;
}
