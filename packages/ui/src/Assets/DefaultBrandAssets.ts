import { BrandAssets, AssetConfig } from './AssetManager';

// Default LuxGen brand assets
export const luxgenBrandAssets: BrandAssets = {
  logo: {
    primary: {
      id: 'luxgen-logo-primary',
      name: 'LuxGen Logo',
      type: 'logo',
      category: 'brand',
      url: '/assets/luxgen/logo-primary.svg',
      alt: 'LuxGen Logo',
      description: 'Primary LuxGen logo',
      dimensions: { width: 200, height: 60 },
      global: true,
    },
    secondary: {
      id: 'luxgen-logo-secondary',
      name: 'LuxGen Logo Secondary',
      type: 'logo',
      category: 'brand',
      url: '/assets/luxgen/logo-secondary.svg',
      alt: 'LuxGen Logo Secondary',
      description: 'Secondary LuxGen logo for dark backgrounds',
      dimensions: { width: 200, height: 60 },
      global: true,
    },
    icon: {
      id: 'luxgen-logo-icon',
      name: 'LuxGen Icon',
      type: 'logo',
      category: 'brand',
      url: '/assets/luxgen/logo-icon.svg',
      alt: 'LuxGen Icon',
      description: 'LuxGen icon for favicon and small spaces',
      dimensions: { width: 32, height: 32 },
      global: true,
    },
    favicon: {
      id: 'luxgen-favicon',
      name: 'LuxGen Favicon',
      type: 'logo',
      category: 'brand',
      url: '/assets/luxgen/favicon.ico',
      alt: 'LuxGen Favicon',
      description: 'LuxGen favicon',
      dimensions: { width: 16, height: 16 },
      global: true,
    },
  },
  colors: {
    primary: '#1E40AF', // Blue
    secondary: '#64748B', // Slate
    accent: '#059669', // Green
    background: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
  },
  images: {
    hero: {
      id: 'luxgen-hero',
      name: 'LuxGen Hero Image',
      type: 'image',
      category: 'marketing',
      url: '/assets/luxgen/hero-image.jpg',
      alt: 'LuxGen Hero',
      description: 'Hero image for landing pages',
      dimensions: { width: 1920, height: 1080 },
      global: true,
    },
    background: {
      id: 'luxgen-background',
      name: 'LuxGen Background',
      type: 'background',
      category: 'ui',
      url: '/assets/luxgen/background-pattern.svg',
      alt: 'LuxGen Background Pattern',
      description: 'Background pattern for LuxGen',
      dimensions: { width: 1920, height: 1080 },
      global: true,
    },
    placeholder: {
      id: 'luxgen-placeholder',
      name: 'LuxGen Placeholder',
      type: 'image',
      category: 'ui',
      url: '/assets/luxgen/placeholder.svg',
      alt: 'Placeholder Image',
      description: 'Default placeholder image',
      dimensions: { width: 400, height: 300 },
      global: true,
    },
  },
  icons: {
    dashboard: {
      id: 'luxgen-icon-dashboard',
      name: 'Dashboard Icon',
      type: 'icon',
      category: 'ui',
      url: '/assets/luxgen/icons/dashboard.svg',
      alt: 'Dashboard',
      description: 'Dashboard icon',
      dimensions: { width: 24, height: 24 },
      global: true,
    },
    groups: {
      id: 'luxgen-icon-groups',
      name: 'Groups Icon',
      type: 'icon',
      category: 'ui',
      url: '/assets/luxgen/icons/groups.svg',
      alt: 'Groups',
      description: 'Groups icon',
      dimensions: { width: 24, height: 24 },
      global: true,
    },
    users: {
      id: 'luxgen-icon-users',
      name: 'Users Icon',
      type: 'icon',
      category: 'ui',
      url: '/assets/luxgen/icons/users.svg',
      alt: 'Users',
      description: 'Users icon',
      dimensions: { width: 24, height: 24 },
      global: true,
    },
    analytics: {
      id: 'luxgen-icon-analytics',
      name: 'Analytics Icon',
      type: 'icon',
      category: 'ui',
      url: '/assets/luxgen/icons/analytics.svg',
      alt: 'Analytics',
      description: 'Analytics icon',
      dimensions: { width: 24, height: 24 },
      global: true,
    },
    settings: {
      id: 'luxgen-icon-settings',
      name: 'Settings Icon',
      type: 'icon',
      category: 'ui',
      url: '/assets/luxgen/icons/settings.svg',
      alt: 'Settings',
      description: 'Settings icon',
      dimensions: { width: 24, height: 24 },
      global: true,
    },
  },
  illustrations: {
    '404': {
      id: 'luxgen-illustration-404',
      name: '404 Illustration',
      type: 'illustration',
      category: 'content',
      url: '/assets/luxgen/illustrations/404.svg',
      alt: '404 Not Found',
      description: '404 page illustration',
      dimensions: { width: 400, height: 300 },
      global: true,
    },
    'empty-state': {
      id: 'luxgen-illustration-empty',
      name: 'Empty State Illustration',
      type: 'illustration',
      category: 'content',
      url: '/assets/luxgen/illustrations/empty-state.svg',
      alt: 'Empty State',
      description: 'Empty state illustration',
      dimensions: { width: 400, height: 300 },
      global: true,
    },
    'success': {
      id: 'luxgen-illustration-success',
      name: 'Success Illustration',
      type: 'illustration',
      category: 'content',
      url: '/assets/luxgen/illustrations/success.svg',
      alt: 'Success',
      description: 'Success state illustration',
      dimensions: { width: 400, height: 300 },
      global: true,
    },
  },
};

// Demo tenant brand assets
export const demoBrandAssets: BrandAssets = {
  logo: {
    primary: {
      id: 'demo-logo-primary',
      name: 'Demo Platform Logo',
      type: 'logo',
      category: 'brand',
      url: '/assets/demo/logo-primary.svg',
      alt: 'Demo Platform Logo',
      description: 'Primary Demo Platform logo',
      dimensions: { width: 200, height: 60 },
      tenant: 'demo',
    },
    icon: {
      id: 'demo-logo-icon',
      name: 'Demo Platform Icon',
      type: 'logo',
      category: 'brand',
      url: '/assets/demo/logo-icon.svg',
      alt: 'Demo Platform Icon',
      description: 'Demo Platform icon',
      dimensions: { width: 32, height: 32 },
      tenant: 'demo',
    },
  },
  colors: {
    primary: '#1E40AF', // Blue
    secondary: '#64748B', // Slate
    accent: '#059669', // Green
    background: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
  },
  images: {
    hero: {
      id: 'demo-hero',
      name: 'Demo Hero Image',
      type: 'image',
      category: 'marketing',
      url: '/assets/demo/hero-image.jpg',
      alt: 'Demo Platform Hero',
      description: 'Hero image for Demo Platform',
      dimensions: { width: 1920, height: 1080 },
      tenant: 'demo',
    },
    placeholder: {
      id: 'demo-placeholder',
      name: 'Demo Placeholder',
      type: 'image',
      category: 'ui',
      url: '/assets/demo/placeholder.svg',
      alt: 'Demo Placeholder',
      description: 'Demo Platform placeholder image',
      dimensions: { width: 400, height: 300 },
      tenant: 'demo',
    },
  },
  icons: {
    dashboard: {
      id: 'demo-icon-dashboard',
      name: 'Demo Dashboard Icon',
      type: 'icon',
      category: 'ui',
      url: '/assets/demo/icons/dashboard.svg',
      alt: 'Demo Dashboard',
      description: 'Demo Platform dashboard icon',
      dimensions: { width: 24, height: 24 },
      tenant: 'demo',
    },
    groups: {
      id: 'demo-icon-groups',
      name: 'Demo Groups Icon',
      type: 'icon',
      category: 'ui',
      url: '/assets/demo/icons/groups.svg',
      alt: 'Demo Groups',
      description: 'Demo Platform groups icon',
      dimensions: { width: 24, height: 24 },
      tenant: 'demo',
    },
  },
  illustrations: {
    '404': {
      id: 'demo-illustration-404',
      name: 'Demo 404 Illustration',
      type: 'illustration',
      category: 'content',
      url: '/assets/demo/illustrations/404.svg',
      alt: 'Demo 404 Not Found',
      description: 'Demo Platform 404 illustration',
      dimensions: { width: 400, height: 300 },
      tenant: 'demo',
    },
  },
};

// Idea Vibes tenant brand assets
export const ideaVibesBrandAssets: BrandAssets = {
  logo: {
    primary: {
      id: 'idea-vibes-logo-primary',
      name: 'Idea Vibes Logo',
      type: 'logo',
      category: 'brand',
      url: '/assets/idea-vibes/logo-primary.svg',
      alt: 'Idea Vibes Logo',
      description: 'Primary Idea Vibes logo',
      dimensions: { width: 200, height: 60 },
      tenant: 'idea-vibes',
    },
    icon: {
      id: 'idea-vibes-logo-icon',
      name: 'Idea Vibes Icon',
      type: 'logo',
      category: 'brand',
      url: '/assets/idea-vibes/logo-icon.svg',
      alt: 'Idea Vibes Icon',
      description: 'Idea Vibes icon',
      dimensions: { width: 32, height: 32 },
      tenant: 'idea-vibes',
    },
  },
  colors: {
    primary: '#7C3AED', // Purple
    secondary: '#EC4899', // Pink
    accent: '#F59E0B', // Amber
    background: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
  },
  typography: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    headingFont: 'Poppins, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
  },
  images: {
    hero: {
      id: 'idea-vibes-hero',
      name: 'Idea Vibes Hero Image',
      type: 'image',
      category: 'marketing',
      url: '/assets/idea-vibes/hero-image.jpg',
      alt: 'Idea Vibes Hero',
      description: 'Hero image for Idea Vibes',
      dimensions: { width: 1920, height: 1080 },
      tenant: 'idea-vibes',
    },
    placeholder: {
      id: 'idea-vibes-placeholder',
      name: 'Idea Vibes Placeholder',
      type: 'image',
      category: 'ui',
      url: '/assets/idea-vibes/placeholder.svg',
      alt: 'Idea Vibes Placeholder',
      description: 'Idea Vibes placeholder image',
      dimensions: { width: 400, height: 300 },
      tenant: 'idea-vibes',
    },
  },
  icons: {
    dashboard: {
      id: 'idea-vibes-icon-dashboard',
      name: 'Idea Vibes Dashboard Icon',
      type: 'icon',
      category: 'ui',
      url: '/assets/idea-vibes/icons/dashboard.svg',
      alt: 'Idea Vibes Dashboard',
      description: 'Idea Vibes dashboard icon',
      dimensions: { width: 24, height: 24 },
      tenant: 'idea-vibes',
    },
    groups: {
      id: 'idea-vibes-icon-groups',
      name: 'Idea Vibes Groups Icon',
      type: 'icon',
      category: 'ui',
      url: '/assets/idea-vibes/icons/groups.svg',
      alt: 'Idea Vibes Groups',
      description: 'Idea Vibes groups icon',
      dimensions: { width: 24, height: 24 },
      tenant: 'idea-vibes',
    },
  },
  illustrations: {
    '404': {
      id: 'idea-vibes-illustration-404',
      name: 'Idea Vibes 404 Illustration',
      type: 'illustration',
      category: 'content',
      url: '/assets/idea-vibes/illustrations/404.svg',
      alt: 'Idea Vibes 404 Not Found',
      description: 'Idea Vibes 404 illustration',
      dimensions: { width: 400, height: 300 },
      tenant: 'idea-vibes',
    },
  },
};

// Default assets array
export const defaultAssets: AssetConfig[] = [
  // Global assets
  ...Object.values(luxgenBrandAssets.logo),
  ...Object.values(luxgenBrandAssets.images).filter(Boolean),
  ...Object.values(luxgenBrandAssets.icons),
  ...Object.values(luxgenBrandAssets.illustrations),
  
  // Demo tenant assets
  ...Object.values(demoBrandAssets.logo),
  ...Object.values(demoBrandAssets.images).filter(Boolean),
  ...Object.values(demoBrandAssets.icons),
  ...Object.values(demoBrandAssets.illustrations),
  
  // Idea Vibes tenant assets
  ...Object.values(ideaVibesBrandAssets.logo),
  ...Object.values(ideaVibesBrandAssets.images).filter(Boolean),
  ...Object.values(ideaVibesBrandAssets.icons),
  ...Object.values(ideaVibesBrandAssets.illustrations),
];

// Brand assets by tenant
export const brandAssetsByTenant = {
  'demo': demoBrandAssets,
  'idea-vibes': ideaVibesBrandAssets,
  'default': luxgenBrandAssets,
};

// Helper function to get brand assets for a tenant
export const getBrandAssetsForTenant = (tenantId: string): BrandAssets => {
  return brandAssetsByTenant[tenantId as keyof typeof brandAssetsByTenant] || luxgenBrandAssets;
};
