/**
 * Dynamic Tenant Service
 * Fetches tenant configurations from the API instead of using hardcoded configs
 */

export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  domain: string;
  status: string;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
  };
  branding: {
    logo: {
      text: string;
      image: string | null;
    };
    favicon: string | null;
  };
  features: string[];
  limits: Record<string, any>;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableTenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
}

/**
 * Get tenant configuration from API
 */
export const getTenantConfig = async (tenantId: string): Promise<TenantConfig> => {
  try {
    const response = await fetch(`http://localhost:4000/api/tenant-config/config/${tenantId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tenant config: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch tenant config');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching tenant config:', error);
    // Return default config as fallback
    return getDefaultTenantConfig(tenantId);
  }
};

/**
 * Get all available tenants from API
 */
export const getAvailableTenants = async (): Promise<AvailableTenant[]> => {
  try {
    const response = await fetch('http://localhost:4000/api/tenant-config/available');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch available tenants: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch available tenants');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching available tenants:', error);
    // Return default tenants as fallback
    return getDefaultAvailableTenants();
  }
};

/**
 * Get tenant assets from API
 */
export const getTenantAssets = async (tenantId: string) => {
  try {
    const response = await fetch(`http://localhost:4000/api/tenant-config/assets/${tenantId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tenant assets: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch tenant assets');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching tenant assets:', error);
    return null;
  }
};

/**
 * Default tenant configuration (fallback)
 */
const getDefaultTenantConfig = (tenantId: string): TenantConfig => {
  return {
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
};

/**
 * Default available tenants (fallback)
 */
const getDefaultAvailableTenants = (): AvailableTenant[] => {
  return [
    { id: 'demo', name: 'Demo Company', subdomain: 'demo', plan: 'enterprise' },
    { id: 'ideavibes', name: 'Idea Vibes', subdomain: 'ideavibes', plan: 'pro' },
    { id: 'acme-corp', name: 'ACME Corporation', subdomain: 'acme-corp', plan: 'free' },
  ];
};
