import { useEffect } from 'react';

import { useGlobalContext } from '@luxgen/ui';

import { applyTenantDesignTokens, resolveTenantAccent } from '../../lib/tenant-theme';
import { useTheme } from '../../lib/theme';

/**
 * Applies tenant + appearance tokens globally on every admin page.
 * Learn/store layouts call applyLearnTenantTheme for API-driven branding overrides.
 */
export function TenantThemeBridge() {
  const { resolvedTheme } = useTheme();
  const { currentTenant, tenantConfig } = useGlobalContext();

  useEffect(() => {
    const accent = resolveTenantAccent({
      theme: tenantConfig.theme,
      branding: tenantConfig.branding,
    });

    applyTenantDesignTokens({
      tenantId: currentTenant,
      scheme: resolvedTheme,
      accent,
    });
  }, [resolvedTheme, currentTenant, tenantConfig]);

  return null;
}
