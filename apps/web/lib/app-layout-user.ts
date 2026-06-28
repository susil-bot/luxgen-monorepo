import { useEffect, useState } from 'react';
import { AUTH_SESSION_CHANGE_EVENT, getStoredUser } from './session';
import { getCurrentTenant } from './tenant';

export type { LayoutUser } from './layout-user-shared';
export { sessionToLayoutUser } from './layout-user-shared';

/** Client-side tenant subdomain for GraphQL / headers */
export function useAppTenant(): string {
  const [tenant, setTenant] = useState('demo');

  useEffect(() => {
    const refresh = () => {
      const stored = getStoredUser();
      setTenant(stored?.tenant.subdomain ?? getCurrentTenant() ?? 'demo');
    };
    refresh();
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return tenant;
}

/** Tenant Mongo id from session — for users/courses queries */
export function useAppTenantId(): string | null {
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      const stored = getStoredUser();
      setTenantId(stored?.tenant.id ?? null);
    };
    refresh();
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return tenantId;
}

export { LayoutUserProvider, useLayoutUserFromContext as useLayoutUser } from './layout-user-context';
