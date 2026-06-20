/** Public trainer/mentor storefront landing — per-tenant flag and nav routes */

export interface StorefrontRouteSettings {
  landing: string;
  courses: string;
  programs: string;
  login: string;
  register: string;
}

export interface TenantStorefrontSettings {
  landingEnabled: boolean;
  routes: StorefrontRouteSettings;
}

/** Subdomains that ship with the LuxGen trainer landing enabled by default (dev + product demo). */
export const LUXGEN_STOREFRONT_TENANT_SUBDOMAINS = new Set(['demo', 'luxgen']);

export const DEFAULT_STOREFRONT_ROUTES: StorefrontRouteSettings = {
  landing: '/mentors',
  courses: '/learn',
  programs: '/store/product',
  login: '/login',
  register: '/register',
};

/** Default public URL for the trainer/mentor landing page */
export const STOREFRONT_LANDING_PATH = DEFAULT_STOREFRONT_ROUTES.landing;

export function defaultStorefrontSettings(subdomain: string): TenantStorefrontSettings {
  return {
    landingEnabled: LUXGEN_STOREFRONT_TENANT_SUBDOMAINS.has(subdomain),
    routes: { ...DEFAULT_STOREFRONT_ROUTES },
  };
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null;
}

function normalizeRoute(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const path = value.trim();
  return path.startsWith('/') ? path : `/${path}`;
}

/** Read storefront settings from tenant.settings (GraphQL or REST config blob). */
export function resolveStorefrontSettings(subdomain: string, settings: unknown): TenantStorefrontSettings {
  const defaults = defaultStorefrontSettings(subdomain);
  const settingsObj = asRecord(settings);
  const config = asRecord(settingsObj?.config);
  const storefront = asRecord(config?.storefront);
  const routes = asRecord(storefront?.routes);

  if (!storefront) {
    return defaults;
  }

  return {
    landingEnabled:
      typeof storefront.landingEnabled === 'boolean' ? storefront.landingEnabled : defaults.landingEnabled,
    routes: {
      landing: normalizeRoute(routes?.landing, defaults.routes.landing),
      courses: normalizeRoute(routes?.courses, defaults.routes.courses),
      programs: normalizeRoute(routes?.programs, defaults.routes.programs),
      login: normalizeRoute(routes?.login, defaults.routes.login),
      register: normalizeRoute(routes?.register, defaults.routes.register),
    },
  };
}

export function isTrainerLandingEnabled(subdomain: string, settings: unknown): boolean {
  return resolveStorefrontSettings(subdomain, settings).landingEnabled;
}

/** Payload for PATCH /api/tenant/storefront */
export interface StorefrontSettingsPayload {
  landingEnabled: boolean;
  routes: StorefrontRouteSettings;
}

export function toStorefrontPayload(settings: TenantStorefrontSettings): StorefrontSettingsPayload {
  return {
    landingEnabled: settings.landingEnabled,
    routes: { ...settings.routes },
  };
}
