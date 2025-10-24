import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TenantConfig, getTenantConfig } from './services/tenantService';

interface TenantContextType {
  currentTenant: string;
  tenantConfig: TenantConfig | null;
  setTenant: (tenantId: string) => void;
  isLoading: boolean;
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
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create a stable reference to loadTenantConfig using useCallback
  const loadTenantConfig = useCallback(async (tenantId: string) => {
    console.log('🔄 TenantProvider: Starting to load tenant config for:', tenantId);
    try {
      setIsLoading(true);
      
      // Add a small delay to simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const config = await getTenantConfig(tenantId);
      console.log('✅ TenantProvider: Successfully loaded tenant config:', config);
      setTenantConfig(config);
    } catch (error) {
      console.error('❌ TenantProvider: Error loading tenant config:', error);
      // Use fallback config
      const fallbackConfig: TenantConfig = {
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
      };
      setTenantConfig(fallbackConfig);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Detect tenant from subdomain or query parameter
  useEffect(() => {
    console.log('🔄 TenantProvider useEffect triggered');
    
    const detectTenant = () => {
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
        
        console.log('🔄 TenantProvider detected tenant:', detectedTenant);
        return detectedTenant;
      } else {
        // Server-side rendering fallback
        console.log('🔄 TenantProvider server-side fallback');
        return defaultTenant;
      }
    };

    const detectedTenant = detectTenant();
    setCurrentTenant(detectedTenant);
    loadTenantConfig(detectedTenant);
  }, [defaultTenant, loadTenantConfig]);

  const setTenant = useCallback((tenantId: string) => {
    setCurrentTenant(tenantId);
    loadTenantConfig(tenantId);
  }, [loadTenantConfig]);

  // Show loading state
  if (isLoading || !tenantConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: '#3B82F6' }}></div>
          <p className="text-gray-600">Loading tenant configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ currentTenant, tenantConfig, setTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};