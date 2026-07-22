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
export declare const defaultTenantConfig: TenantConfig;
/**
 * Utility function to merge tenant config with default
 * This ensures all tenants have a complete configuration
 */
export declare const mergeTenantConfig: (customConfig: Partial<TenantConfig>) => TenantConfig;
