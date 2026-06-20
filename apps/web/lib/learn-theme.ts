import { applyTenantDesignTokens, resolveColorScheme, resolveTenantAccent } from './tenant-theme';

/** Apply tenant accent from GraphQL tenant.settings (learn / store public pages). */
export function applyLearnTenantTheme(settings: unknown, tenantId?: string): void {
  const accent = resolveTenantAccent({ settings });
  applyTenantDesignTokens({
    tenantId: tenantId ?? 'demo',
    scheme: resolveColorScheme(),
    accent,
  });
}

export { resolveTenantAccent } from './tenant-theme';
