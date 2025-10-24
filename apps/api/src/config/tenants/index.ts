/**
 * Tenant Configuration Loader
 * Central configuration management for all tenants
 */

import { ITenant } from '@luxgen/db';

// Demo tenant configurations
import { demoBrandConfig } from './demo/brand';
import { demoBrandIdentity } from './demo/brand-identity';
import { demoThemes } from './demo/themes';
import { demoSecurityConfig } from './demo/security';
import { demoFeaturesConfig } from './demo/features';

// Idea Vibes tenant configurations
import { ideaVibesBrandConfig } from './idea-vibes/brand';
import { ideaVibesBrandIdentity } from './idea-vibes/brand-identity';
import { ideaVibesThemes } from './idea-vibes/themes';

/**
 * Load complete tenant configuration
 */
export const loadTenantConfig = (subdomain: string): Partial<ITenant> => {
  switch (subdomain) {
    case 'demo':
      return loadDemoTenantConfig();
    case 'idea-vibes':
      return loadIdeaVibesTenantConfig();
    default:
      return loadDefaultTenantConfig();
  }
};

/**
 * Demo tenant configuration
 */
const loadDemoTenantConfig = (): Partial<ITenant> => ({
  name: 'Demo Platform',
  subdomain: 'demo',
  status: 'active',
  settings: {
    branding: {
      primaryColor: demoBrandConfig.colors.primary,
      secondaryColor: demoBrandConfig.colors.secondary,
      accentColor: demoBrandConfig.colors.accent,
      fontFamily: demoBrandConfig.typography.fontFamily.primary,
      logo: demoBrandIdentity.logo.primary.url,
      favicon: demoBrandIdentity.logo.favicon.url,
      customCSS: generateDemoCSS()
    },
    security: {
      allowedDomains: demoSecurityConfig.domainRestrictions.allowedDomains,
      corsOrigins: demoSecurityConfig.cors.origins,
      rateLimiting: {
        enabled: demoSecurityConfig.rateLimiting.enabled,
        maxRequests: demoSecurityConfig.rateLimiting.maxRequests,
        windowMs: demoSecurityConfig.rateLimiting.windowMs
      },
      sessionTimeout: demoSecurityConfig.authentication.sessionTimeout,
      requireMFA: demoSecurityConfig.authentication.requireMFA,
      passwordPolicy: demoSecurityConfig.passwordPolicy
    },
    config: {
      features: {
        analytics: demoFeaturesConfig.platform.analytics.enabled,
        notifications: demoFeaturesConfig.platform.notifications.enabled,
        fileUpload: demoFeaturesConfig.platform.fileUpload.enabled,
        apiAccess: demoFeaturesConfig.platform.apiAccess.enabled,
        customDomain: demoFeaturesConfig.business.customDomain.enabled
      },
      limits: {
        maxUsers: demoFeaturesConfig.limits.users.max,
        maxStorage: demoFeaturesConfig.limits.storage.max,
        maxApiCalls: demoFeaturesConfig.limits.apiCalls.max
      },
      integrations: {
        emailProvider: demoFeaturesConfig.platform.analytics.provider,
        analyticsProvider: demoFeaturesConfig.platform.analytics.provider
      }
    }
  },
  metadata: {
    plan: 'pro',
    createdAt: new Date(),
    lastActive: new Date(),
    createdBy: null
  }
});

/**
 * Idea Vibes tenant configuration
 */
const loadIdeaVibesTenantConfig = (): Partial<ITenant> => ({
  name: 'Idea Vibes',
  subdomain: 'idea-vibes',
  status: 'active',
  settings: {
    branding: {
      primaryColor: ideaVibesBrandConfig.colors.primary,
      secondaryColor: ideaVibesBrandConfig.colors.secondary,
      accentColor: ideaVibesBrandConfig.colors.accent,
      fontFamily: ideaVibesBrandConfig.typography.fontFamily.primary,
      logo: ideaVibesBrandIdentity.logo.primary.url,
      favicon: ideaVibesBrandIdentity.logo.favicon.url,
      customCSS: generateIdeaVibesCSS()
    },
    security: {
      allowedDomains: ['idea-vibes.localhost', 'idea-vibes.example.com'],
      corsOrigins: [
        'http://idea-vibes.localhost:3000',
        'https://idea-vibes.example.com'
      ],
      rateLimiting: {
        enabled: true,
        maxRequests: 5000,
        windowMs: 900000
      },
      sessionTimeout: 720, // 12 hours for creative sessions
      requireMFA: true,
      passwordPolicy: {
        minLength: 10,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true
      }
    },
    config: {
      features: {
        analytics: true,
        notifications: true,
        fileUpload: true,
        apiAccess: true,
        customDomain: true
      },
      limits: {
        maxUsers: 200,
        maxStorage: 10240, // 10GB
        maxApiCalls: 50000
      },
      integrations: {
        emailProvider: 'mailgun',
        paymentProvider: 'stripe',
        analyticsProvider: 'mixpanel'
      }
    }
  },
  metadata: {
    plan: 'enterprise',
    createdAt: new Date(),
    lastActive: new Date(),
    createdBy: null
  }
});

/**
 * Default tenant configuration
 */
const loadDefaultTenantConfig = (): Partial<ITenant> => ({
  name: 'Default Tenant',
  subdomain: 'default',
  status: 'active',
  settings: {
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      accentColor: '#10B981',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    security: {
      allowedDomains: [],
      corsOrigins: [],
      rateLimiting: {
        enabled: true,
        maxRequests: 1000,
        windowMs: 900000
      },
      sessionTimeout: 480,
      requireMFA: false,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false
      }
    },
    config: {
      features: {
        analytics: true,
        notifications: true,
        fileUpload: true,
        apiAccess: true,
        customDomain: false
      },
      limits: {
        maxUsers: 100,
        maxStorage: 1024,
        maxApiCalls: 10000
      },
      integrations: {}
    }
  },
  metadata: {
    plan: 'free',
    createdAt: new Date(),
    lastActive: new Date(),
    createdBy: null
  }
});

/**
 * Generate Demo tenant CSS
 */
const generateDemoCSS = (): string => `
  .demo-header {
    background: linear-gradient(135deg, ${demoBrandConfig.colors.primary} 0%, ${demoBrandConfig.colors.accent} 100%);
    color: white;
  }
  
  .demo-button {
    background-color: var(--tenant-primary-color);
    border-radius: ${demoBrandConfig.borderRadius.md};
    font-weight: ${demoBrandConfig.typography.fontWeight.semibold};
    transition: all ${demoBrandConfig.animations.duration.normal} ${demoBrandConfig.animations.easing.ease};
  }
  
  .demo-button:hover {
    transform: translateY(-2px);
    box-shadow: ${demoBrandConfig.shadows.lg};
  }
  
  .demo-card {
    border-radius: ${demoBrandConfig.borderRadius.lg};
    box-shadow: ${demoBrandConfig.shadows.md};
    transition: all ${demoBrandConfig.animations.duration.normal} ${demoBrandConfig.animations.easing.ease};
  }
  
  .demo-card:hover {
    transform: translateY(-4px);
    box-shadow: ${demoBrandConfig.shadows.xl};
  }
`;

/**
 * Generate Idea Vibes tenant CSS
 */
const generateIdeaVibesCSS = (): string => `
  .idea-vibes-header {
    background: ${ideaVibesBrandConfig.colors.gradients.creative};
    color: white;
    position: relative;
    overflow: hidden;
  }
  
  .idea-vibes-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .idea-vibes-button {
    background: ${ideaVibesBrandConfig.colors.gradients.primary};
    border: none;
    border-radius: ${ideaVibesBrandConfig.borderRadius.full};
    font-weight: ${ideaVibesBrandConfig.typography.fontWeight.bold};
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all ${ideaVibesBrandConfig.animations.duration.normal} ${ideaVibesBrandConfig.animations.easing.bounce};
  }
  
  .idea-vibes-button:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: ${ideaVibesBrandConfig.shadows.creative};
  }
  
  .idea-vibes-card {
    border-radius: ${ideaVibesBrandConfig.borderRadius['2xl']};
    box-shadow: ${ideaVibesBrandConfig.shadows.creative};
    transition: all ${ideaVibesBrandConfig.animations.duration.normal} ${ideaVibesBrandConfig.animations.easing.ease};
  }
  
  .idea-vibes-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: ${ideaVibesBrandConfig.shadows['2xl']};
  }
  
  .idea-vibes-glow {
    box-shadow: ${ideaVibesBrandConfig.shadows.glow};
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { box-shadow: ${ideaVibesBrandConfig.shadows.glow}; }
    50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.8); }
  }
`;

/**
 * Get tenant configuration by subdomain
 */
export const getTenantConfig = (subdomain: string): Partial<ITenant> => {
  return loadTenantConfig(subdomain);
};

/**
 * Get available tenant subdomains
 */
export const getAvailableTenants = (): string[] => {
  return ['demo', 'idea-vibes', 'default'];
};

/**
 * Validate tenant configuration
 */
export const validateTenantConfig = (config: Partial<ITenant>): string[] => {
  const errors: string[] = [];
  
  if (!config.name) {
    errors.push('Tenant name is required');
  }
  
  if (!config.subdomain) {
    errors.push('Tenant subdomain is required');
  } else if (!/^[a-z0-9-]+$/.test(config.subdomain)) {
    errors.push('Subdomain can only contain lowercase letters, numbers, and hyphens');
  }
  
  if (config.settings?.branding?.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(config.settings.branding.primaryColor)) {
    errors.push('Primary color must be a valid hex color');
  }
  
  return errors;
};
