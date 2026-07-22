import { useEffect } from 'react';

import { applyLearnTenantTheme } from '../../lib/learn-theme';
import { useTheme } from '../../lib/theme';
import { StorefrontNavBar } from '../layout/StorefrontNavBar';

interface LearnLayoutProps {
  tenantSubdomain: string;
  tenantName?: string;
  tenantSettings?: unknown;
  children: React.ReactNode;
}

export function LearnLayout({ tenantSubdomain, tenantName, tenantSettings, children }: LearnLayoutProps) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    applyLearnTenantTheme(tenantSettings, tenantSubdomain);
  }, [tenantSettings, tenantSubdomain, resolvedTheme]);

  const displayName = tenantName ?? tenantSubdomain;

  return (
    <div className="min-h-screen bg-primary">
      <StorefrontNavBar logoText="LuxGen Learn" logoHref="/learn" subtitle={displayName} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
