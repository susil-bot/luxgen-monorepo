import { useEffect, useState } from 'react';
import { getDefaultUser } from '@luxgen/ui';
import { getStoredUser, type SessionUser } from './session';
import { getCurrentTenant } from './tenant';

export interface LayoutUser {
  name: string;
  email: string;
  role: string;
  tenant: string;
}

/** Map persisted session user to AppLayout user prop */
export function sessionToLayoutUser(session: SessionUser): LayoutUser {
  return {
    name: `${session.firstName} ${session.lastName}`.trim(),
    email: session.email,
    role: session.role,
    tenant: session.tenant.subdomain,
  };
}

/** Client-side tenant subdomain for GraphQL / headers */
export function useAppTenant(): string {
  const [tenant, setTenant] = useState('demo');

  useEffect(() => {
    const stored = getStoredUser();
    setTenant(stored?.tenant.subdomain ?? getCurrentTenant() ?? 'demo');
  }, []);

  return tenant;
}

/** Tenant Mongo id from session — for users/courses queries */
export function useAppTenantId(): string | null {
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    setTenantId(stored?.tenant.id ?? null);
  }, []);

  return tenantId;
}

/** Hydrate AppLayout user from localStorage session */
export function useLayoutUser() {
  const [user, setUser] = useState<LayoutUser | ReturnType<typeof getDefaultUser> | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored ? sessionToLayoutUser(stored) : getDefaultUser());
  }, []);

  return user;
}
