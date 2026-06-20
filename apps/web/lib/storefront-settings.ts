import {
  DEFAULT_STOREFRONT_SLUG,
  landingPathFromSlug,
  type StorefrontContentSettings,
  type StorefrontThemeSettings,
} from './storefront-profile';
import { getTenantStorefrontPreset } from './tenant-storefront-presets';

export interface StorefrontRouteSettings {
  landing: string;
  courses: string;
  programs: string;
  login: string;
  register: string;
}

export interface TenantStorefrontSettings {
  landingEnabled: boolean;
  slug: string;
  routes: StorefrontRouteSettings;
  content?: Partial<import('./storefront-profile').StorefrontContentSettings>;
  theme?: Partial<import('./storefront-profile').StorefrontThemeSettings>;
}

/** Subdomains that ship with the LuxGen trainer landing enabled by default (dev + product demo). */
export const LUXGEN_STOREFRONT_TENANT_SUBDOMAINS = new Set(['demo', 'luxgen']);

export const DEFAULT_STOREFRONT_ROUTES: StorefrontRouteSettings = {
  landing: '/store/mentors',
  courses: '/learn',
  programs: '/store/product',
  login: '/login',
  register: '/register',
};

/** Default public URL for the trainer/mentor landing page */
export const STOREFRONT_LANDING_PATH = DEFAULT_STOREFRONT_ROUTES.landing;

export function defaultStorefrontSettings(subdomain: string): TenantStorefrontSettings {
  const preset = getTenantStorefrontPreset(subdomain);
  const slug = preset?.slug ?? DEFAULT_STOREFRONT_SLUG;
  return {
    landingEnabled: LUXGEN_STOREFRONT_TENANT_SUBDOMAINS.has(subdomain),
    slug,
    routes: {
      ...DEFAULT_STOREFRONT_ROUTES,
      landing: landingPathFromSlug(slug),
    },
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

  const dbSlug = typeof storefront.slug === 'string' ? storefront.slug.trim() : undefined;
  const slug = dbSlug || defaults.slug;
  const dbLanding = typeof routes?.landing === 'string' ? routes.landing.trim() : '';
  const landingPath = dbLanding ? normalizeRoute(dbLanding, defaults.routes.landing) : landingPathFromSlug(slug);

  return {
    landingEnabled:
      typeof storefront.landingEnabled === 'boolean' ? storefront.landingEnabled : defaults.landingEnabled,
    slug,
    routes: {
      landing: landingPath,
      courses: normalizeRoute(routes?.courses, defaults.routes.courses),
      programs: normalizeRoute(routes?.programs, defaults.routes.programs),
      login: normalizeRoute(routes?.login, defaults.routes.login),
      register: normalizeRoute(routes?.register, defaults.routes.register),
    },
    ...(storefront.content ? { content: storefront.content as Partial<StorefrontContentSettings> } : {}),
    ...(storefront.theme ? { theme: storefront.theme as Partial<StorefrontThemeSettings> } : {}),
  };
}

export function isTrainerLandingEnabled(subdomain: string, settings: unknown): boolean {
  return resolveStorefrontSettings(subdomain, settings).landingEnabled;
}

/** Payload for PATCH /api/tenant/storefront */
export interface StorefrontSettingsPayload {
  landingEnabled: boolean;
  slug: string;
  routes: StorefrontRouteSettings;
  content?: Partial<StorefrontContentSettings>;
  theme?: Partial<StorefrontThemeSettings>;
}

export function toStorefrontPayload(settings: TenantStorefrontSettings): StorefrontSettingsPayload {
  return {
    landingEnabled: settings.landingEnabled,
    slug: settings.slug,
    routes: { ...settings.routes },
    ...(settings.content ? { content: settings.content } : {}),
    ...(settings.theme ? { theme: settings.theme } : {}),
  };
}
