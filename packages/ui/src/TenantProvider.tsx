import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTenantConfig, TenantConfig } from './tenant-config';

interface TenantContextType {
  currentTenant: string;
  tenantConfig: TenantConfig;
  setTenant: (tenantId: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: React.ReactNode;
  defaultTenant?: string;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({
  children,
  defaultTenant = 'demo'
}) => {
  const [currentTenant, setCurrentTenant] = useState<string>(defaultTenant);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig>(getTenantConfig(defaultTenant));

  // Detect tenant from subdomain or query parameter on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const urlParams = new URLSearchParams(window.location.search);
      const queryTenant = urlParams.get('tenant');
      
      // Extract subdomain
      const parts = hostname.split('.');
      let detectedTenant = defaultTenant;
      
      if (parts.length > 1) {
        const subdomain = parts[0];
        if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== '127.0.0.1') {
          detectedTenant = subdomain;
        }
      }
      
      // Check query parameter as fallback
      if (queryTenant) {
        detectedTenant = queryTenant;
      }
      
      // Check if detected tenant exists in our config
      const availableTenants = ['demo', 'idea-vibes', 'acme-corp'];
      if (availableTenants.includes(detectedTenant)) {
        setCurrentTenant(detectedTenant);
        setTenantConfig(getTenantConfig(detectedTenant));
      }
    }
  }, []);

  const setTenant = (tenantId: string) => {
    setCurrentTenant(tenantId);
    setTenantConfig(getTenantConfig(tenantId));
  };

  return (
    <TenantContext.Provider value={{ currentTenant, tenantConfig, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
};
