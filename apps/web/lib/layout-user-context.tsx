import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AUTH_SESSION_CHANGE_EVENT, AUTH_STORAGE_KEYS, getStoredUser, isStoredSessionExpired } from './session';
import { sessionToLayoutUser, type LayoutUser } from './layout-user-shared';

function resolveLayoutUser(): LayoutUser | null {
  if (typeof window === 'undefined') return null;
  if (isStoredSessionExpired()) return null;
  if (!localStorage.getItem(AUTH_STORAGE_KEYS.token)) return null;

  const stored = getStoredUser();
  return stored ? sessionToLayoutUser(stored) : null;
}

const LayoutUserContext = createContext<LayoutUser | null>(null);

export function LayoutUserProvider({
  initialUser,
  children,
}: {
  initialUser?: LayoutUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<LayoutUser | null>(initialUser ?? null);

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

  return <LayoutUserContext.Provider value={user}>{children}</LayoutUserContext.Provider>;
}

export function useLayoutUserFromContext(): LayoutUser | null {
  return useContext(LayoutUserContext);
}
