/**
 * Demo Tenant - Features Configuration
 * Feature flags and capabilities
 */

export const demoFeaturesConfig = {
  // Core features
  core: {
    userManagement: true,
    authentication: true,
    authorization: true,
    profileManagement: true,
    settings: true
  },

  // Platform features
  platform: {
    analytics: {
      enabled: true,
      provider: 'google-analytics',
      trackingId: 'GA-XXXXX-XX',
      events: ['page_view', 'user_action', 'conversion'],
      privacy: {
        anonymizeIP: true,
        respectDoNotTrack: true,
        cookieConsent: true
      }
    },
    notifications: {
      enabled: true,
      channels: ['email', 'in-app', 'push'],
      templates: {
        welcome: true,
        passwordReset: true,
        accountLocked: true,
        securityAlert: true
      },
      preferences: {
        userControllable: true,
        defaultEnabled: ['email', 'in-app']
      }
    },
    fileUpload: {
      enabled: true,
      maxFileSize: 10, // MB
      allowedTypes: ['image', 'document', 'video'],
      storage: {
        provider: 'local', // 'local' | 's3' | 'gcs'
        bucket: 'demo-uploads',
        cdn: false
      },
      processing: {
        imageResize: true,
        thumbnailGeneration: true,
        virusScan: true
      }
    },
    apiAccess: {
      enabled: true,
      version: 'v1',
      rateLimit: 1000,
      authentication: 'bearer',
      documentation: true,
      sandbox: true
    }
  },

  // Business features
  business: {
    customDomain: {
      enabled: false,
      sslRequired: true,
      dnsValidation: true,
      maxDomains: 1
    },
    whiteLabel: {
      enabled: false,
      customBranding: false,
      removePoweredBy: false
    },
    integrations: {
      enabled: true,
      available: [
        'slack',
        'microsoft-teams',
        'google-workspace',
        'salesforce',
        'hubspot'
      ],
      webhooks: {
        enabled: true,
        maxEndpoints: 5,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2
        }
      }
    },
    reporting: {
      enabled: true,
      dashboards: true,
      exports: ['pdf', 'csv', 'excel'],
      scheduledReports: true,
      customMetrics: false
    }
  },

  // Advanced features
  advanced: {
    multiTenancy: {
      enabled: true,
      isolation: 'database', // 'database' | 'schema' | 'table'
      crossTenantAccess: false
    },
    auditLogging: {
      enabled: true,
      events: [
        'user_login',
        'user_logout',
        'data_access',
        'data_modification',
        'admin_actions'
      ],
      retention: 2555, // days
      encryption: true
    },
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: 30, // days
      encryption: true,
      compression: true
    },
    monitoring: {
      enabled: true,
      metrics: ['performance', 'errors', 'usage'],
      alerts: true,
      dashboards: true
    }
  },

  // Limits and quotas
  limits: {
    users: {
      max: 50,
      current: 0,
      warningThreshold: 40
    },
    storage: {
      max: 2048, // MB
      current: 0,
      warningThreshold: 1800
    },
    apiCalls: {
      max: 20000,
      current: 0,
      resetPeriod: 'monthly',
      warningThreshold: 18000
    },
    customDomains: {
      max: 1,
      current: 0
    }
  },

  // Feature flags
  flags: {
    'new-dashboard': false,
    'beta-features': false,
    'experimental-ui': false,
    'advanced-analytics': false,
    'ai-assistant': false
  }
};
