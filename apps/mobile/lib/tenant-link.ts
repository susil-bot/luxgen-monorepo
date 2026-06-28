import * as Linking from 'expo-linking';

/**
 * Parse tenant subdomain from LuxGen deep links.
 * Supports: luxgen://demo/login · luxgen://login?tenant=demo
 */
export function parseTenantFromUrl(url: string): string | null {
  const parsed = Linking.parse(url);
  const tenantParam = parsed.queryParams?.tenant;
  if (typeof tenantParam === 'string' && tenantParam.trim()) {
    return tenantParam.trim().toLowerCase();
  }

  const host = parsed.hostname;
  if (host && host !== 'login' && host !== 'localhost' && host !== '127.0.0.1') {
    return host.toLowerCase();
  }

  const pathSegment = parsed.path?.replace(/^\//, '').split('/')[0];
  if (pathSegment && pathSegment !== 'login') {
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
