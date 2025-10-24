// Auto-generated tenant configuration
// Generated at: 2025-10-24T17:10:40.429Z
// Selected tenant: demo

export const SELECTED_TENANT = 'demo';

export const TENANT_CONFIG = {
  id: 'demo',
  name: 'Demo Tenant',
  subdomain: 'demo',
  logo: {
  "src": "/logos/demo-logo.svg",
  "text": "LuxGen",
  "alt": "LuxGen Demo Logo",
  "href": "/"
},
  primaryColor: '#3B82F6',
};

export const getTenantLogo = () => TENANT_CONFIG.logo;
export const getTenantTheme = () => ({
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
});
