import { URL_DEFAULTS } from './url-defaults';

function trimUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function firstDefined(...values: Array<string | undefined>): string | undefined {
  return values.find((v) => v !== undefined && v !== '');
}

/** Hostname used for tenant subdomains (e.g. demo.localhost). */
export function getAppDomain(): string {
  return firstDefined(process.env.APP_DOMAIN, process.env.NEXT_PUBLIC_APP_DOMAIN) || URL_DEFAULTS.APP_DOMAIN;
}

export function getWebUrl(): string {
  const explicit = firstDefined(
    process.env.WEB_APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.CORS_ORIGIN,
  );
  if (explicit) return trimUrl(explicit);

  const domain = getAppDomain();
  const port = process.env.WEB_PORT || URL_DEFAULTS.WEB_PORT;
  if (domain === 'localhost') {
    return `http://localhost:${port}`;
  }
  const protocol = process.env.WEB_URL_PROTOCOL || 'https';
  return `${protocol}://${domain}`;
}

export function getApiUrl(): string {
  const explicit = firstDefined(process.env.API_URL, process.env.NEXT_PUBLIC_API_URL);
  if (explicit) return trimUrl(explicit);

  const domain = getAppDomain();
  const port = process.env.API_PORT || process.env.PORT || URL_DEFAULTS.API_PORT;
  if (domain === 'localhost') {
    return `http://localhost:${port}`;
  }
  const protocol = process.env.API_URL_PROTOCOL || 'https';
  return `${protocol}://${domain.startsWith('api.') ? domain : `api.${domain}`}`;
}

export function getGraphqlUrl(): string {
  const explicit = firstDefined(process.env.GRAPHQL_URL, process.env.NEXT_PUBLIC_GRAPHQL_URL);
  if (explicit) return trimUrl(explicit);
  return `${getApiUrl()}/graphql`;
}

export function getOllamaUrl(): string {
  return trimUrl(process.env.OLLAMA_HOST || URL_DEFAULTS.OLLAMA);
}

export function getMongoUri(): string {
  return process.env.MONGODB_URI || URL_DEFAULTS.MONGODB;
}

export function getRedisUrl(): string {
  return process.env.REDIS_URL || URL_DEFAULTS.REDIS;
}

/** Tenant subdomain host (e.g. demo.localhost). */
export function getTenantDomain(tenantId: string): string {
  return `${tenantId}.${getAppDomain()}`;
}

/** Full origin for a tenant web app (e.g. http://demo.localhost:3000). */
export function getTenantWebOrigin(tenantId: string): string {
  const base = getWebUrl();
  try {
    const url = new URL(base);
    if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost')) {
      url.hostname = `${tenantId}.localhost`;
    } else {
      const root = url.hostname.replace(/^www\./, '');
      url.hostname = `${tenantId}.${root}`;
    }
    return url.origin;
  } catch {
    const port = process.env.WEB_PORT || URL_DEFAULTS.WEB_PORT;
    return `http://${tenantId}.${getAppDomain()}:${port}`;
  }
}

/** CORS allowlist — set CORS_ORIGINS (comma-separated) or CORS_ORIGIN in .env */
export function getCorsOrigins(): string[] {
  const list = process.env.CORS_ORIGINS;
  if (list) {
    return list
      .split(',')
      .map((s) => trimUrl(s.trim()))
      .filter(Boolean);
  }

  const origins = new Set<string>();
  const single = process.env.CORS_ORIGIN;
  if (single) origins.add(trimUrl(single));
  origins.add(getWebUrl());

  if (getAppDomain() === 'localhost') {
    const tenants = (process.env.TENANT_SUBDOMAINS || 'demo,idea-vibes').split(',');
    for (const tenant of tenants) {
      const id = tenant.trim();
      if (id) origins.add(getTenantWebOrigin(id));
    }
  }

  return [...origins];
}

/** GraphQL URL for browser fetch (via Next.js rewrite). */
export function getClientGraphqlUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/graphql`;
  }
  return getGraphqlUrl();
}

/** Shared URL object for convenience */
export const urls = {
  web: getWebUrl,
  api: getApiUrl,
  graphql: getGraphqlUrl,
  clientGraphql: getClientGraphqlUrl,
  ollama: getOllamaUrl,
  mongo: getMongoUri,
  redis: getRedisUrl,
  tenantDomain: getTenantDomain,
  tenantWebOrigin: getTenantWebOrigin,
  corsOrigins: getCorsOrigins,
};
