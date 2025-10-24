import { ITenant } from '@luxgen/db';

/**
 * Demo Tenant Configuration
 * Professional demo environment with corporate branding
 */
export const demoTenantConfig: Partial<ITenant> = {
  name: 'Demo Platform',
  subdomain: 'demo',
  status: 'active',
  settings: {
    branding: {
      primaryColor: '#1E40AF', // Professional blue
      secondaryColor: '#64748B', // Slate gray
      accentColor: '#059669', // Emerald green
      fontFamily: 'Inter, system-ui, sans-serif',
      logo: '/assets/logos/demo-logo.svg',
      favicon: '/assets/favicons/demo-favicon.ico',
      customCSS: `
        .demo-header {
          background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
        }
        .demo-button {
          background-color: var(--tenant-primary-color);
          border-radius: 8px;
          font-weight: 600;
        }
      `
    },
    security: {
      allowedDomains: ['demo.localhost', 'demo.example.com'],
      corsOrigins: ['http://demo.localhost:3000', 'https://demo.example.com'],
      rateLimiting: {
        enabled: true,
        maxRequests: 2000,
        windowMs: 900000 // 15 minutes
      },
      sessionTimeout: 480, // 8 hours
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
        maxUsers: 50,
        maxStorage: 2048, // 2GB
        maxApiCalls: 20000
      },
      integrations: {
        emailProvider: 'sendgrid',
        analyticsProvider: 'google-analytics'
      }
    }
  },
  metadata: {
    plan: 'pro',
    createdAt: new Date(),
    lastActive: new Date(),
    createdBy: null // Will be set when tenant is created
  }
};

/**
 * Idea Vibes Tenant Configuration
 * Creative and vibrant branding for innovation platform
 */
export const ideaVibesTenantConfig: Partial<ITenant> = {
  name: 'Idea Vibes',
  subdomain: 'idea-vibes',
  status: 'active',
  settings: {
    branding: {
      primaryColor: '#8B5CF6', // Vibrant purple
      secondaryColor: '#F59E0B', // Amber
      accentColor: '#EC4899', // Pink
      fontFamily: 'Poppins, system-ui, sans-serif',
      logo: '/assets/logos/idea-vibes-logo.svg',
      favicon: '/assets/favicons/idea-vibes-favicon.ico',
      customCSS: `
        .idea-vibes-header {
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%);
          color: white;
        }
        .idea-vibes-button {
          background: linear-gradient(45deg, #8B5CF6, #EC4899);
          border: none;
          border-radius: 25px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .idea-vibes-card {
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
          transition: transform 0.3s ease;
        }
        .idea-vibes-card:hover {
          transform: translateY(-5px);
        }
      `
    },
    security: {
      allowedDomains: ['idea-vibes.localhost', 'idea-vibes.example.com'],
      corsOrigins: ['http://idea-vibes.localhost:3000', 'https://idea-vibes.example.com'],
      rateLimiting: {
        enabled: true,
        maxRequests: 5000, // Higher limit for creative platform
        windowMs: 900000 // 15 minutes
      },
      sessionTimeout: 720, // 12 hours for creative sessions
      requireMFA: true, // Enhanced security for creative platform
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
        customDomain: true // Allow custom domains for creative brands
      },
      limits: {
        maxUsers: 200,
        maxStorage: 10240, // 10GB for creative content
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
    createdBy: null // Will be set when tenant is created
  }
};

/**
 * Default Tenant Configuration
 * Fallback configuration for new tenants
 */
export const defaultTenantConfig: Partial<ITenant> = {
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
};

/**
 * Tenant configuration registry
 */
export const tenantConfigs = {
  'demo': demoTenantConfig,
  'idea-vibes': ideaVibesTenantConfig,
  'default': defaultTenantConfig
};

/**
 * Get tenant configuration by subdomain
 */
export const getTenantConfig = (subdomain: string): Partial<ITenant> => {
  return tenantConfigs[subdomain as keyof typeof tenantConfigs] || defaultTenantConfig;
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
  
  if (config.settings?.security?.rateLimiting?.maxRequests && config.settings.security.rateLimiting.maxRequests < 1) {
    errors.push('Rate limiting max requests must be at least 1');
  }
  
  return errors;
};
