import { mergeTenantConfig, TenantConfig } from '../default';

// ACME Corporation tenant configuration - extends default with custom overrides
const acmeCorpConfig: Partial<TenantConfig> = {
  id: 'acme-corp',
  name: 'ACME Corporation',
  subdomain: 'acme-corp',
  theme: {
    colors: {
      primary: '#DC2626', // Red
      secondary: '#B91C1C',
      accent: '#F87171',
      background: '#FEF2F2',
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
      src: '/logos/acme-corp-logo.svg',
      alt: 'ACME Corporation Logo',
      text: 'ACME',
      href: '/',
    },
    favicon: '/favicons/acme-corp-favicon.ico',
    colors: {
      primary: '#DC2626',
      secondary: '#B91C1C',
    },
  },
  settings: {
    allowRegistration: false,
    requireEmailVerification: true,
    maxUsers: 1000,
  },
};

// Merge with default configuration
const acmeCorp: TenantConfig = mergeTenantConfig(acmeCorpConfig);

export default acmeCorp;
