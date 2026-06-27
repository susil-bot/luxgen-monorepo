import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';

import { buildLoginRedirect, requiresAuth } from '../../lib/auth-routes';
import type { AuthRedirectReason } from '../../lib/auth-notices';
import { AUTH_SESSION_CHANGE_EVENT } from '../../lib/session';
import { validateClientSession } from '../../lib/session-guard';
import { AuthLoadingScreen } from './AuthNoticeBanner';

interface AuthGuardProps {
  children: ReactNode;
}

function AuthGuardRedirect({ returnPath, reason }: { returnPath: string; reason: AuthRedirectReason }) {
  const router = useRouter();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) return;
    didRedirect.current = true;
    void router.replace(buildLoginRedirect(returnPath, reason));
  }, [router, returnPath, reason]);

  return <AuthLoadingScreen label="Redirecting to sign in…" />;
}

/**
 * Redirects unauthenticated users away from protected app routes.
 * Re-validates synchronously on each render and when the session changes (post-login).
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [, setAuthEpoch] = useState(0);

  useEffect(() => {
    setMounted(true);
    const bump = () => setAuthEpoch((v) => v + 1);
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  // Public routes must match SSR HTML — do not gate on router.isReady
  if (!requiresAuth(router.pathname)) {
    return <>{children}</>;
  }

  // SSR + first client paint: render page shell (AppLayout/sidebar) so HTML matches hydration.
  // Auth redirect runs only after mount when localStorage is available.
  if (!mounted) {
    return <>{children}</>;
  }

  const validation = validateClientSession();
  if (!validation.ok) {
    return <AuthGuardRedirect returnPath={router.asPath || router.pathname} reason={validation.reason} />;
  }

  return <>{children}</>;
}
