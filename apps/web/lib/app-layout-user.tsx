import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  AUTH_SESSION_CHANGE_EVENT,
  AUTH_STORAGE_KEYS,
  getStoredUser,
  isStoredSessionExpired,
  type SessionUser,
} from './session';
import { getCurrentTenant } from './tenant';

export interface LayoutUser {
  name: string;
  email: string;
  role: string;
  tenant: string;
}

export function sessionToLayoutUser(session: SessionUser): LayoutUser {
  return {
    name: `${session.firstName} ${session.lastName}`.trim(),
    email: session.email,
    role: session.role,
    tenant: session.tenant.subdomain,
  };
}

function resolveLayoutUser(): LayoutUser | null {
  if (typeof window === 'undefined') return null;
  if (isStoredSessionExpired()) return null;
  if (!localStorage.getItem(AUTH_STORAGE_KEYS.token)) return null;
  const stored = getStoredUser();
  return stored ? sessionToLayoutUser(stored) : null;
}

const LayoutUserInitialContext = createContext<LayoutUser | null | undefined>(undefined);

export function LayoutUserInitialProvider({
  initialUser,
  children,
}: {
  initialUser?: LayoutUser | null;
  children: ReactNode;
}) {
  return <LayoutUserInitialContext.Provider value={initialUser ?? null}>{children}</LayoutUserInitialContext.Provider>;
}

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

export function useAppTenantId(): string | null {
  const [tenantId, setTenantId] = useState<string | null>(null);
  useEffect(() => {
    const refresh = () => setTenantId(getStoredUser()?.tenant.id ?? null);
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

export function useLayoutUser(): LayoutUser | null {
  const initialUser = useContext(LayoutUserInitialContext);
  const [user, setUser] = useState<LayoutUser | null>(() => initialUser ?? resolveLayoutUser());
  useEffect(() => {
    const refresh = () => setUser(resolveLayoutUser());
    refresh();
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return user;
}
