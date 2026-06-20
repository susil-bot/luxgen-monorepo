import { AUTH_STORAGE_KEYS } from './session';
import { getHostTenantSubdomain } from './tenant-auth';

export interface TenantBrandingPayload {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface TenantRegionalSettings {
  contactEmail?: string;
  timezone?: string;
  currency?: string;
}

export interface TenantStorefrontSettingsPayload {
  landingEnabled: boolean;
  slug?: string;
  routes: {
    landing: string;
    courses: string;
    programs: string;
    login: string;
    register: string;
  };
  content?: Record<string, unknown>;
  theme?: {
    accentColor?: string;
    warmAccentColor?: string;
    heroImage?: string;
    layout?: 'classic' | 'split';
  };
}

export interface TenantCurrentData {
  id: string;
  name: string;
  subdomain: string;
  branding: TenantBrandingPayload;
}

export interface NotificationTemplateSummary {
  id: string;
  label: string;
  category: string;
  status: string;
  subject: string;
  bodyPreview: string;
}

function tenantRequestHeaders(): HeadersInit {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };

  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  const storedTenant = localStorage.getItem(AUTH_STORAGE_KEYS.tenant);
  const tenant = storedTenant || getHostTenantSubdomain();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'x-tenant': tenant,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }
  return result.data as T;
}

/** Relative API path — proxied by Next.js with x-tenant header */
function apiPath(path: string): string {
  if (typeof window !== 'undefined') {
    return path;
  }
  return path;
}

export async function fetchTenantCurrent(): Promise<TenantCurrentData> {
  const response = await fetch(apiPath('/api/tenant/current'), {
    headers: tenantRequestHeaders(),
  });
  return parseJson(response);
}

export async function fetchTenantConfig(): Promise<{
  branding: TenantBrandingPayload;
  config: { regional?: TenantRegionalSettings; storefront?: TenantStorefrontSettingsPayload };
}> {
  const response = await fetch(apiPath('/api/tenant/config'), {
    headers: tenantRequestHeaders(),
  });
  return parseJson(response);
}

export async function patchTenantBranding(branding: TenantBrandingPayload): Promise<TenantBrandingPayload> {
  const response = await fetch(apiPath('/api/tenant/branding'), {
    method: 'PATCH',
    headers: tenantRequestHeaders(),
    body: JSON.stringify({ branding }),
  });
  const data = await parseJson<{ branding: TenantBrandingPayload }>(response);
  return data.branding;
}

export async function patchTenantGeneral(input: {
  name?: string;
  regional?: TenantRegionalSettings;
}): Promise<{ name: string; regional: TenantRegionalSettings }> {
  const response = await fetch(apiPath('/api/tenant/general'), {
    method: 'PATCH',
    headers: tenantRequestHeaders(),
    body: JSON.stringify(input),
  });
  return parseJson(response);
}

export async function fetchNotificationTemplates(): Promise<NotificationTemplateSummary[]> {
  const response = await fetch(apiPath('/api/notifications/templates'), {
    headers: tenantRequestHeaders(),
  });
  return parseJson(response);
}

export async function patchTenantStorefront(
  storefront: TenantStorefrontSettingsPayload,
): Promise<TenantStorefrontSettingsPayload> {
  const response = await fetch(apiPath('/api/tenant/storefront'), {
    method: 'PATCH',
    headers: tenantRequestHeaders(),
    body: JSON.stringify(storefront),
  });
  const data = await parseJson<{ storefront: TenantStorefrontSettingsPayload }>(response);
  return data.storefront;
}
