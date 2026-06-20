import { DEFAULT_STOREFRONT_SLUG } from './defaults';
import type { TenantStorefrontSettings } from './types';

export function landingPathFromSlug(slug: string): string {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, '');
  if (!normalized) return '/store/mentors';
  if (normalized.startsWith('store/')) return `/${normalized}`;
  return `/store/${normalized}`;
}

/** Extract slug segment from a landing path like /store/coaching */
export function slugFromLandingPath(landingPath: string): string {
  const trimmed = landingPath.trim().replace(/\/+$/, '');
  const match = trimmed.match(/^\/store\/([^/]+)/);
  return match?.[1]?.toLowerCase() ?? DEFAULT_STOREFRONT_SLUG;
}

/** Whether the URL slug matches this tenant's configured storefront landing */
export function matchesStorefrontSlug(requestedSlug: string, settings: TenantStorefrontSettings): boolean {
  const normalized = requestedSlug.trim().toLowerCase();
  if (!normalized) return false;
  if (settings.slug.toLowerCase() === normalized) return true;
  return slugFromLandingPath(settings.routes.landing) === normalized;
}

export function normalizeStorefrontSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}
