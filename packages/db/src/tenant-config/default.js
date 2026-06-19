'use strict';
/**
 * Default Tenant Configuration
 *
 * This is the base configuration that all tenants extend from.
 * Each tenant can override specific properties while inheriting the rest.
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.mergeTenantConfig = exports.defaultTenantConfig = void 0;
// Default configuration that all tenants extend from
exports.defaultTenantConfig = {
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
const mergeTenantConfig = (customConfig) => {
  return {
    ...exports.defaultTenantConfig,
    ...customConfig,
    theme: {
      ...exports.defaultTenantConfig.theme,
      ...customConfig.theme,
      colors: {
        ...exports.defaultTenantConfig.theme.colors,
        ...customConfig.theme?.colors,
      },
      fonts: {
        ...exports.defaultTenantConfig.theme.fonts,
        ...customConfig.theme?.fonts,
      },
      spacing: {
        ...exports.defaultTenantConfig.theme.spacing,
        ...customConfig.theme?.spacing,
      },
      borderRadius: {
        ...exports.defaultTenantConfig.theme.borderRadius,
        ...customConfig.theme?.borderRadius,
      },
      shadows: {
        ...exports.defaultTenantConfig.theme.shadows,
        ...customConfig.theme?.shadows,
      },
    },
    branding: {
      ...exports.defaultTenantConfig.branding,
      ...customConfig.branding,
      logo: {
        ...exports.defaultTenantConfig.branding.logo,
        ...customConfig.branding?.logo,
      },
      colors: {
        ...exports.defaultTenantConfig.branding.colors,
        ...customConfig.branding?.colors,
      },
    },
    features: {
      ...exports.defaultTenantConfig.features,
      ...customConfig.features,
    },
    settings: {
      ...exports.defaultTenantConfig.settings,
      ...customConfig.settings,
    },
  };
};
exports.mergeTenantConfig = mergeTenantConfig;
