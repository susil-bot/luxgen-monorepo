/**
 * Default Tenant Configuration
 * 
 * This is the base configuration that all tenants extend from.
 * Each tenant can override specific properties while inheriting the rest.
 */

export interface TenantTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  theme: TenantTheme;
  branding: {
    logo: {
      src: string;
      alt: string;
      text: string;
      href: string;
    };
    favicon: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
  features: {
    analytics: boolean;
    reporting: boolean;
    notifications: boolean;
    userManagement: boolean;
  };
  settings: {
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    maxUsers: number;
    customDomain?: string;
  };
}

// Default configuration that all tenants extend from
export const defaultTenantConfig: TenantConfig = {
  id: 'default',
  name: 'Default Company',
  subdomain: 'default',
  theme: {
    colors: {
      primary: '#3B82F6', // Blue
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  },
  branding: {
    logo: {
      src: '/logos/default-logo.svg',
      alt: 'Default Company Logo',
      text: 'LuxGen',
      href: '/',
    },
    favicon: '/favicons/default-favicon.ico',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
    },
  },
  features: {
    analytics: true,
    reporting: true,
    notifications: true,
    userManagement: true,
  },
  settings: {
    allowRegistration: true,
    requireEmailVerification: false,
    maxUsers: 100,
  },
};

/**
 * Utility function to merge tenant config with default
 * This ensures all tenants have a complete configuration
 */
export const mergeTenantConfig = (customConfig: Partial<TenantConfig>): TenantConfig => {
  return {
    ...defaultTenantConfig,
    ...customConfig,
    theme: {
      ...defaultTenantConfig.theme,
      ...customConfig.theme,
      colors: {
        ...defaultTenantConfig.theme.colors,
        ...customConfig.theme?.colors,
      },
      fonts: {
        ...defaultTenantConfig.theme.fonts,
        ...customConfig.theme?.fonts,
      },
      spacing: {
        ...defaultTenantConfig.theme.spacing,
        ...customConfig.theme?.spacing,
      },
      borderRadius: {
        ...defaultTenantConfig.theme.borderRadius,
        ...customConfig.theme?.borderRadius,
      },
      shadows: {
        ...defaultTenantConfig.theme.shadows,
        ...customConfig.theme?.shadows,
      },
    },
    branding: {
      ...defaultTenantConfig.branding,
      ...customConfig.branding,
      logo: {
        ...defaultTenantConfig.branding.logo,
        ...customConfig.branding?.logo,
      },
      colors: {
        ...defaultTenantConfig.branding.colors,
        ...customConfig.branding?.colors,
      },
    },
    features: {
      ...defaultTenantConfig.features,
      ...customConfig.features,
    },
    settings: {
      ...defaultTenantConfig.settings,
      ...customConfig.settings,
    },
  };
};
