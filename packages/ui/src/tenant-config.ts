import { TenantTheme } from './types';

export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  logo: {
    src?: string;
    alt: string;
    text: string;
    href: string;
  };
  theme: TenantTheme;
  branding: {
    companyName: string;
    tagline?: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export const tenantConfigs: Record<string, TenantConfig> = {
  'demo': {
    id: 'demo',
    name: 'Demo Tenant',
    subdomain: 'demo',
    logo: {
      src: '/logos/demo-logo.svg',
      text: 'LuxGen',
      alt: 'LuxGen Demo Logo',
      href: '/',
    },
    theme: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#F59E0B',
        background: '#FFFFFF',
        backgroundSecondary: '#F3F4F6',
        surface: '#F9FAFB',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6',
      },
      fonts: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'Fira Code, monospace',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    },
    branding: {
      companyName: 'LuxGen',
      tagline: 'Learning Management Platform',
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
    },
  },
  'idea-vibes': {
    id: 'idea-vibes',
    name: 'Idea Vibes',
    subdomain: 'idea-vibes',
    logo: {
      src: '/logos/idea-vibes-logo.svg',
      text: 'Idea Vibes',
      alt: 'Idea Vibes Logo',
      href: '/',
    },
    theme: {
      colors: {
        primary: '#8B5CF6',
        secondary: '#6B7280',
        accent: '#F59E0B',
        background: '#FFFFFF',
        backgroundSecondary: '#F3F4F6',
        surface: '#F9FAFB',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#8B5CF6',
      },
      fonts: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'Fira Code, monospace',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    },
    branding: {
      companyName: 'Idea Vibes',
      tagline: 'Innovation Platform',
      primaryColor: '#8B5CF6',
      secondaryColor: '#6B7280',
    },
  },
  'acme-corp': {
    id: 'acme-corp',
    name: 'ACME Corporation',
    subdomain: 'acme-corp',
    logo: {
      src: '/logos/acme-logo.svg',
      text: 'ACME',
      alt: 'ACME Corporation Logo',
      href: '/',
    },
    theme: {
      colors: {
        primary: '#DC2626',
        secondary: '#6B7280',
        accent: '#F59E0B',
        background: '#FFFFFF',
        backgroundSecondary: '#F3F4F6',
        surface: '#F9FAFB',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#DC2626',
      },
      fonts: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'Fira Code, monospace',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    },
    branding: {
      companyName: 'ACME Corporation',
      tagline: 'Enterprise Solutions',
      primaryColor: '#DC2626',
      secondaryColor: '#6B7280',
    },
  },
};

export const getTenantConfig = (tenantId: string): TenantConfig => {
  return tenantConfigs[tenantId] || tenantConfigs['demo'];
};

export const getTenantLogo = (tenantId: string) => {
  const config = getTenantConfig(tenantId);
  return config.logo;
};

export const getTenantTheme = (tenantId: string): TenantTheme => {
  const config = getTenantConfig(tenantId);
  return config.theme;
};

export const getTenantBranding = (tenantId: string) => {
  const config = getTenantConfig(tenantId);
  return config.branding;
};
