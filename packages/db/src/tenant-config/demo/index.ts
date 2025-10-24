import { mergeTenantConfig, TenantConfig } from '../default';

// Demo tenant configuration - extends default with custom overrides
const demoConfig: Partial<TenantConfig> = {
  id: 'demo',
  name: 'Demo Company',
  subdomain: 'demo',
  branding: {
    logo: {
      src: '/logos/demo-logo.svg',
      alt: 'Demo Company Logo',
      text: 'Demo Company',
      href: '/',
    },
    favicon: '/favicons/demo-favicon.ico',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
    },
  },
  settings: {
    allowRegistration: true,
    requireEmailVerification: false,
    maxUsers: 100,
  },
};

// Merge with default configuration
const demo: TenantConfig = mergeTenantConfig(demoConfig);

export default demo;
