import { createContext, useContext, type ReactNode } from 'react';

export interface NavigationContextValue {
  pathname?: string;
  onNavigate?: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextValue>({});

export function NavigationProvider({
  children,
  pathname,
  onNavigate,
}: NavigationContextValue & { children: ReactNode }) {
  return (
    <NavigationContext.Provider value={{ pathname, onNavigate }}>{children}</NavigationContext.Provider>
  );
}

/** Optional client router bridge (e.g. Next.js) for sidebar SPA navigation */
export function useNavigation() {
  return useContext(NavigationContext);
}
