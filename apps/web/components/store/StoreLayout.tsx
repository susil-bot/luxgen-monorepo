import Link from 'next/link';
import { useEffect } from 'react';

import { applyLearnTenantTheme } from '../../lib/learn-theme';
import { useTheme } from '../../lib/theme';
import { StorefrontNavBar } from '../layout/StorefrontNavBar';
import { StoreNav } from './StoreNav';

interface StoreLayoutProps {
  tenantSubdomain: string;
  tenantName?: string;
  tenantSettings?: unknown;
  children: React.ReactNode;
}

export function StoreLayout({ tenantSubdomain, tenantName, tenantSettings, children }: StoreLayoutProps) {
  const { resolvedTheme } = useTheme();

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
      <div className="relative">
        <StorefrontNavBar logoText="GPT Store" logoHref="/store/product" subtitle={displayName} />
      </div>
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <StoreNav />
        {children}
      </main>
    </div>
  );
}
