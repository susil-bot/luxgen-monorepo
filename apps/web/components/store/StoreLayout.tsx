import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { applyLearnTenantTheme } from '../../lib/learn-theme';
import { useTheme } from '../../lib/theme';
import { getStoredUser, isStoredSessionExpired } from '../../lib/session';
import { buildLogoutRedirect } from '../../lib/auth-routes';
import { StoreNav } from './StoreNav';

interface StoreLayoutProps {
  tenantSubdomain: string;
  tenantName?: string;
  tenantSettings?: unknown;
  children: React.ReactNode;
}

export function StoreLayout({ tenantSubdomain, tenantName, tenantSettings, children }: StoreLayoutProps) {
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,122,255,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(175,82,222,0.12), transparent)',
        }}
      />
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{
          borderColor: 'var(--color-separator)',
          backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 85%, transparent)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <Link href="/store/product" className="flex items-center gap-2 group">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}
              >
                AI
              </span>
              <div>
                <span className="font-semibold text-primary text-lg tracking-tight block">GPT Store</span>
                <span className="text-[10px] uppercase tracking-widest text-secondary">{displayName}</span>
              </div>
            </Link>
          </div>
          <nav className="flex items-center gap-2">
            {signedIn ? (
              <>
                <Link href="/learn/subscriptions" className="ios-btn-secondary text-sm py-2 px-3">
                  Subscriptions
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
                className="text-sm py-2 px-4 rounded-full font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #007AFF, #0A84FF)' }}
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <StoreNav />
        {children}
      </main>
    </div>
  );
}
