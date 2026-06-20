import { useEffect, useMemo, useState } from 'react';

import { useAppTenantId } from './app-layout-user';
import { AUTH_SESSION_CHANGE_EVENT } from './session';
import { getCurrentTenant } from './tenant';
import { getHostTenantSubdomain, normalizeTenantSubdomain } from './tenant-auth';

export interface TenantScope {
  /** Subdomain for the current host or page prop (e.g. demo) */
  subdomain: string;
  /** Mongo tenant id from session — null when logged out */
  mongoId: string | null;
  /** GraphQL tenantId variable — prefer mongoId, fall back to subdomain */
  queryTenantId: string;
}

/**
 * Canonical tenant identifiers for GraphQL variables and UI.
 * Host subdomain is the display/routing source of truth; mongoId is preferred for API queries.
 */
export function useTenantScope(pageSubdomain?: string): TenantScope {
  const mongoId = useAppTenantId();
  const [subdomain, setSubdomain] = useState(() => normalizeTenantSubdomain(pageSubdomain ?? getHostTenantSubdomain()));

  useEffect(() => {
    const refresh = () => {
      const fromPage = pageSubdomain ? normalizeTenantSubdomain(pageSubdomain) : null;
      const fromHost = getHostTenantSubdomain();
      setSubdomain(fromPage ?? fromHost);
    };
    refresh();
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [pageSubdomain]);

  return useMemo(
    () => ({
      subdomain,
      mongoId,
      queryTenantId: mongoId ?? subdomain,
    }),
    [subdomain, mongoId],
  );
}

/** SSR-safe host subdomain without session (for getServerSideProps defaults). */
export function hostSubdomainFromPageProp(pageSubdomain?: string): string {
  if (pageSubdomain) return normalizeTenantSubdomain(pageSubdomain);
  if (typeof window !== 'undefined') return getHostTenantSubdomain();
  return normalizeTenantSubdomain(getCurrentTenant());
}

/**
 * Dashboard GraphQL resolvers resolve tenants by subdomain (`Tenant.findOne({ subdomain })`).
 * Use this for `getDashboardData` — not `queryTenantId` (Mongo id).
 */
export function useDashboardTenant(pageSubdomain?: string): string {
  const { subdomain } = useTenantScope(pageSubdomain);
  return subdomain;
}
