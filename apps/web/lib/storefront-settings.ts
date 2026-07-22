/** Re-export @luxgen/storefront settings layer for apps/web consumers. */
export {
  DEFAULT_STOREFRONT_ROUTES,
  STOREFRONT_LANDING_PATH,
  LUXGEN_STOREFRONT_TENANT_SUBDOMAINS,
  defaultStorefrontSettings,
  resolveStorefrontSettings,
  isTrainerLandingEnabled,
  toStorefrontPayload,
  landingPathFromSlug,
  matchesStorefrontSlug,
} from '@luxgen/storefront';

export type { StorefrontRouteSettings, TenantStorefrontSettings, StorefrontSettingsPayload } from '@luxgen/storefront';
