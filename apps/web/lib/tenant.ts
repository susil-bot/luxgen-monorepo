import { getWebUrl, getTenantWebOrigin } from './urls';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  settings: Record<string, any>;
  createdAt: string;
}

// PaaS-provided default hostnames — their first label is a project/app name,
// not a tenant subdomain (e.g. luxgen-monorepo-web.vercel.app). Without this
// check, hostname.split('.')[0] below would send that project name as
// x-tenant on every request, which never matches a real tenant and breaks
// register/login on the deployed default domain. Only a real custom domain
// (e.g. demo.luxgen.shop) represents an actual tenant subdomain.
const FLAT_HOST_SUFFIXES = ['.vercel.app', '.onrender.com', '.netlify.app'];

export const getTenantFromHost = (host: string): string => {
  const hostname = host.split(':')[0];
  if (FLAT_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return 'default';
  }
  const subdomain = hostname.split('.')[0];
  if (subdomain === 'www' || subdomain === 'localhost' || subdomain === '127.0.0.1') {
    return 'default';
  }
  return subdomain;
};

export const getTenantFromUrl = (url: string): string => {
  try {
    const host = new URL(url).host;
    return getTenantFromHost(host);
  } catch {
    return 'default';
  }
};

// Path-based tenant selection for the flat production domain (no wildcard
// *.luxgen.in DNS): www.luxgen.in/demo/login selects the "demo" tenant the
// same way demo.luxgen.in/login would with real subdomains. Only matches a
// known tenant subdomain so ordinary routes like /login or /dashboard are
// never mistaken for a tenant prefix. Keep NEXT_PUBLIC_TENANT_SUBDOMAINS in
// sync with the API's TENANT_SUBDOMAINS env var.
const KNOWN_TENANT_SUBDOMAINS = (process.env.NEXT_PUBLIC_TENANT_SUBDOMAINS || 'demo,idea-vibes')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const getTenantFromPath = (pathname: string): string | null => {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return firstSegment && KNOWN_TENANT_SUBDOMAINS.includes(firstSegment) ? firstSegment : null;
};

export const getCurrentTenant = (): string => {
  if (typeof window === 'undefined') return 'default';
  return getTenantFromPath(window.location.pathname) || getTenantFromHost(window.location.host);
};

export const isMultiTenant = (): boolean => {
  const tenant = getCurrentTenant();
  return tenant !== 'default' && tenant !== 'www';
};

export const getTenantUrl = (tenant: string, path: string = ''): string => {
  if (tenant === 'default') {
    return `${getWebUrl()}${path}`;
  }
  return `${getTenantWebOrigin(tenant)}${path}`;
};
