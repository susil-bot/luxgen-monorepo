import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';
import { TenantConfig } from '../services/tenantService';

interface GlobalContextType {
  isInitialized: boolean;
  currentTenant: string;
  tenantConfig: TenantConfig;
  setTenant: (tenantId: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
  defaultTenant?: string;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ 
  children, 
  defaultTenant = 'demo' 
}) => {
  // Create a stable fallback config
  const createFallbackConfig = (tenantId: string): TenantConfig => ({
    id: tenantId,
    name: `${tenantId.charAt(0).toUpperCase() + tenantId.slice(1)} Company`,
    subdomain: tenantId,
    domain: `${tenantId}.localhost`,
    status: 'active',
    theme: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: '#F8FAFC',
        text: '#1F2937',
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Inter',
      },
    },
    branding: {
      logo: {
        text: `${tenantId.charAt(0).toUpperCase() + tenantId.slice(1)} Company`,
        image: null,
      },
      favicon: null,
    },
    features: [],
    limits: {},
    plan: 'free',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Detect tenant from URL (synchronous)
  const detectTenantFromUrl = (): string => {
    if (typeof window === 'undefined') {
      return defaultTenant;
    }

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
    
    return detectedTenant;
  };

  // Initialize with detected tenant immediately (memoized to prevent re-detection)
  const [currentTenant, setCurrentTenant] = useState<string>(() => detectTenantFromUrl());
  const [tenantConfig, setTenantConfig] = useState<TenantConfig>(() => createFallbackConfig(detectTenantFromUrl()));
  const [isInitialized] = useState(true);

  const setTenant = (tenantId: string) => {
    setCurrentTenant(tenantId);
    setTenantConfig(createFallbackConfig(tenantId));
  };

  const contextValue: GlobalContextType = {
    isInitialized,
    currentTenant,
    tenantConfig,
    setTenant,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      <ThemeProvider initialTheme={tenantConfig.theme}>
        <UserProvider currentTenant={currentTenant}>
          {children}
        </UserProvider>
      </ThemeProvider>
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
