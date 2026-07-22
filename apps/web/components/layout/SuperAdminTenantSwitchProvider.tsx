import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { NavTenantSwitchProvider, type NavTenantOption } from '@luxgen/ui';
import { UserRole } from '@luxgen/auth';
import { GET_TENANTS } from '../../graphql/queries/tenants';
import { AUTH_SESSION_CHANGE_EVENT, getStoredUser } from '../../lib/session';
import { getCurrentTenant, getTenantUrl } from '../../lib/tenant';

function isSuperAdminSession(): boolean {
  const session = getStoredUser();
  return session?.role === UserRole.SUPER_ADMIN;
}

export function SuperAdminTenantSwitchProvider({ children }: { children: React.ReactNode }) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentSubdomain, setCurrentSubdomain] = useState('demo');

  const refreshSession = useCallback(() => {
    setIsSuperAdmin(isSuperAdminSession());
    const session = getStoredUser();
    setCurrentSubdomain(session?.tenant.subdomain ?? getCurrentTenant() ?? 'demo');
  }, []);

  useEffect(() => {
    refreshSession();
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, refreshSession);
    return () => window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, refreshSession);
  }, [refreshSession]);

  const { data } = useQuery(GET_TENANTS, {
    skip: !isSuperAdmin,
    fetchPolicy: 'cache-first',
  });

  const tenants: NavTenantOption[] = useMemo(
    () =>
      (data?.tenants ?? []).map((t: NavTenantOption) => ({
        id: t.id,
        name: t.name,
        subdomain: t.subdomain,
      })),
    [data?.tenants],
  );

  const onTenantSelect = useCallback((tenant: NavTenantOption) => {
    window.location.href = getTenantUrl(tenant.subdomain, window.location.pathname || '/dashboard');
  }, []);

  const value = useMemo(() => {
    if (!isSuperAdmin || tenants.length === 0) return null;
    return { currentSubdomain, tenants, onTenantSelect };
  }, [isSuperAdmin, currentSubdomain, tenants, onTenantSelect]);

  return <NavTenantSwitchProvider value={value}>{children}</NavTenantSwitchProvider>;
}
