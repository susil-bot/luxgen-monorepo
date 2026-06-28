import { API } from '../constants/api';
import { getToken } from './auth';
import { resolveRequestTenant } from './tenant-auth';

export interface TenantBrandingPayload {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface TenantCurrentData {
  id: string;
  name: string;
  subdomain: string;
  branding: TenantBrandingPayload;
}

async function tenantRequestHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  const tenant = await resolveRequestTenant();

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

/** Mirrors web `fetchTenantCurrent` — proxied on web, direct API on mobile */
export async function fetchTenantCurrent(): Promise<TenantCurrentData> {
  const response = await fetch(`${API.restUrl}/api/tenant/current`, {
    headers: await tenantRequestHeaders(),
  });
  return parseJson(response);
}

/** Mirrors web `fetchTenantConfig` */
export async function fetchTenantConfig(): Promise<{
  branding: TenantBrandingPayload;
  config: Record<string, unknown>;
}> {
  const response = await fetch(`${API.restUrl}/api/tenant/config`, {
    headers: await tenantRequestHeaders(),
  });
  return parseJson(response);
}
