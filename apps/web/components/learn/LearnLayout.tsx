import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { applyLearnTenantTheme } from '../../lib/learn-theme';
import { useTheme } from '../../lib/theme';
import { getStoredUser, isStoredSessionExpired } from '../../lib/session';
import { buildLogoutRedirect } from '../../lib/auth-routes';

interface LearnLayoutProps {
  tenantSubdomain: string;
  tenantName?: string;
  tenantSettings?: unknown;
  children: React.ReactNode;
}

export function LearnLayout({ tenantSubdomain, tenantName, tenantSettings, children }: LearnLayoutProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(!isStoredSessionExpired() && Boolean(getStoredUser()));
  }, []);

  useEffect(() => {
    applyLearnTenantTheme(tenantSettings, tenantSubdomain);
  }, [tenantSettings, tenantSubdomain, resolvedTheme]);

  const displayName = tenantName ?? tenantSubdomain;

  return (
    <div className="min-h-screen bg-primary">
      <header
        className="border-b border-separator sticky top-0 z-20 backdrop-blur-md"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <Link href="/learn" className="font-semibold text-primary text-lg tracking-tight">
              LuxGen Learn
            </Link>
            <p className="text-xs text-secondary mt-0.5">{displayName}</p>
          </div>
          <nav className="flex items-center gap-2">
            {signedIn ? (
              <>
                <Link href="/dashboard" className="ios-btn-secondary text-sm py-2 px-4">
                  My learning
                </Link>
                <button
                  type="button"
                  className="ios-btn-plain text-sm"
                  onClick={() => void router.push(buildLogoutRedirect())}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent(router.asPath)}`}
                className="ios-btn-primary text-sm py-2 px-4"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
