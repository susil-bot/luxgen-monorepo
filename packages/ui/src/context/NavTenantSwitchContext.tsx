import React, { createContext, useContext, ReactNode } from 'react';

export interface NavTenantOption {
  id: string;
  name: string;
  subdomain: string;
}

export interface NavTenantSwitchState {
  currentSubdomain: string;
  tenants: NavTenantOption[];
  onTenantSelect: (tenant: NavTenantOption) => void;
}

const NavTenantSwitchContext = createContext<NavTenantSwitchState | null>(null);

export function NavTenantSwitchProvider({
  value,
  children,
}: {
  value: NavTenantSwitchState | null;
  children: ReactNode;
}) {
  return <NavTenantSwitchContext.Provider value={value}>{children}</NavTenantSwitchContext.Provider>;
}

export function useNavTenantSwitch(): NavTenantSwitchState | null {
  return useContext(NavTenantSwitchContext);
}
