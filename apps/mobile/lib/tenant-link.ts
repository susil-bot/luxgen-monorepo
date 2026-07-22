import * as Linking from 'expo-linking';

/** Reject Expo LAN hosts / IPs so `exp://192.168.x.x` is never treated as a tenant. */
function isPlausibleTenantSlug(value: string): boolean {
  const slug = value.trim().toLowerCase();
  if (!slug) return false;
  if (slug === 'login' || slug === 'localhost' || slug === '127.0.0.1') return false;
  // IPv4 (Expo Metro often exposes exp://192.168.1.100:8081)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(slug)) return false;
  // IPv6 / bracket hosts
  if (slug.includes(':') || slug.startsWith('[')) return false;
  // Tenant subdomains: letters, digits, hyphen (e.g. demo, acme-corp)
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug);
}

/**
 * Parse tenant subdomain from LuxGen deep links.
 * Supports: luxgen://demo/login · luxgen://login?tenant=demo
 * Ignores Expo/Metro URLs like exp://192.168.1.100:8081
 */
export function parseTenantFromUrl(url: string): string | null {
  const parsed = Linking.parse(url);
  const tenantParam = parsed.queryParams?.tenant;
  if (typeof tenantParam === 'string' && isPlausibleTenantSlug(tenantParam)) {
    return tenantParam.trim().toLowerCase();
  }

  // Custom scheme host can be the tenant (luxgen://demo/login) — never Expo LAN IPs
  const scheme = parsed.scheme?.toLowerCase();
  if (scheme && scheme !== 'exp' && scheme !== 'exps' && scheme !== 'http' && scheme !== 'https') {
    const host = parsed.hostname;
    if (host && isPlausibleTenantSlug(host)) {
      return host.toLowerCase();
    }
  }

  const pathSegment = parsed.path?.replace(/^\//, '').split('/')[0];
  if (pathSegment && isPlausibleTenantSlug(pathSegment) && pathSegment !== 'login') {
    return pathSegment.toLowerCase();
  }

  return null;
}

export function buildTenantLoginLink(tenantSubdomain: string): string {
  return Linking.createURL('login', { queryParams: { tenant: tenantSubdomain } });
}

export function parseResetTokenFromUrl(url: string): string | null {
  const parsed = Linking.parse(url);
  const tokenParam = parsed.queryParams?.token;
  if (typeof tokenParam === 'string' && tokenParam.trim()) {
    return tokenParam.trim();
  }
  return null;
}

export function buildResetPasswordLink(token: string): string {
  return Linking.createURL('reset-password', { queryParams: { token } });
}
