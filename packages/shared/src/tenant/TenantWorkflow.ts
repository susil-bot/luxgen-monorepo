/**
 * Centralized Tenant Workflow System
 * 
 * This system provides a sustainable, scalable approach to tenant management by:
 * 1. Centralizing all tenant configurations in a single workflow object
 * 2. Providing type-safe tenant properties
 * 3. Enabling dynamic tenant configuration updates
 * 4. Supporting tenant-specific feature flags and limits
 * 5. Maintaining tenant isolation while sharing infrastructure
 */

export interface TenantWorkflow {
  // Core tenant identification
  id: string;
  name: string;
  subdomain: string;
  domain?: string;
  status: 'active' | 'suspended' | 'pending' | 'archived';
  
  // Tenant metadata
  metadata: {
    plan: 'free' | 'pro' | 'enterprise' | 'custom';
    tier: 'basic' | 'standard' | 'premium' | 'enterprise';
    createdAt: Date;
    lastActive: Date;
    createdBy: string;
    tags: string[];
    region: string;
    timezone: string;
  };
  
  // Branding and UI configuration
  branding: {
    // Visual identity
    logo: {
      primary: string;
      secondary: string;
      icon: string;
      favicon: string;
      animated?: string;
    };
    
    // Color scheme
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      background: string;
      surface: string;
      text: {
        primary: string;
        secondary: string;
        muted: string;
      };
    };
    
    // Typography
    typography: {
      fontFamily: {
        primary: string;
        secondary: string;
        mono: string;
      };
      fontSize: Record<string, string>;
      fontWeight: Record<string, number>;
      lineHeight: Record<string, number>;
    };
    
    // Spacing and layout
    spacing: Record<string, string>;
    borderRadius: Record<string, string>;
    shadows: Record<string, string>;
    
    // Custom styling
    customCSS?: string;
    customJS?: string;
    
    // Assets
    assets: {
      heroImage?: string;
      backgroundPattern?: string;
      placeholderImage?: string;
      illustrations?: Record<string, string>;
      icons?: Record<string, string>;
    };
  };
  
  // Security configuration
  security: {
    // Authentication
    authentication: {
      sessionTimeout: number; // minutes
      requireMFA: boolean;
      maxLoginAttempts: number;
      lockoutDuration: number; // minutes
      passwordExpiry: number; // days
      rememberMe: boolean;
      rememberMeDuration: number; // days
      allowedAuthMethods: string[];
    };
    
    // Password policy
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      preventCommonPasswords: boolean;
      preventUserInfo: boolean;
      preventSequentialChars: boolean;
    };
    
    // Rate limiting
    rateLimiting: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
      skipSuccessfulRequests: boolean;
      skipFailedRequests: boolean;
      keyGenerator: 'ip' | 'user' | 'tenant';
      message: string;
    };
    
    // CORS and domain restrictions
    cors: {
      enabled: boolean;
      origins: string[];
      methods: string[];
      allowedHeaders: string[];
      credentials: boolean;
      maxAge: number;
    };
    
    domainRestrictions: {
      allowedDomains: string[];
      blockedDomains: string[];
      redirectToHttps: boolean;
      enforceSubdomain: boolean;
    };
    
    // Security headers
    securityHeaders: {
      'X-Content-Type-Options': string;
      'X-Frame-Options': string;
      'X-XSS-Protection': string;
      'Referrer-Policy': string;
      'Permissions-Policy': string;
      'Strict-Transport-Security': string;
    };
    
    // Data protection
    dataProtection: {
      encryptSensitiveData: boolean;
      encryptionAlgorithm: string;
      dataRetention: number; // days
      anonymizeOnDelete: boolean;
      auditLogging: boolean;
      gdprCompliant: boolean;
    };
  };
  
  // Feature configuration
  features: {
    // Core features
    core: {
      userManagement: boolean;
      authentication: boolean;
      authorization: boolean;
      profileManagement: boolean;
      settings: boolean;
    };
    
    // Platform features
    platform: {
      analytics: {
        enabled: boolean;
        provider: string;
        trackingId?: string;
        events: string[];
        privacy: {
          anonymizeIP: boolean;
          respectDoNotTrack: boolean;
          cookieConsent: boolean;
        };
      };
      notifications: {
        enabled: boolean;
        channels: string[];
        templates: Record<string, boolean>;
        preferences: {
          userControllable: boolean;
          defaultEnabled: string[];
        };
      };
      fileUpload: {
        enabled: boolean;
        maxFileSize: number; // MB
        allowedTypes: string[];
        storage: {
          provider: string;
          bucket: string;
          cdn: boolean;
        };
        processing: {
          imageResize: boolean;
          thumbnailGeneration: boolean;
          virusScan: boolean;
        };
      };
      apiAccess: {
        enabled: boolean;
        version: string;
        rateLimit: number;
        authentication: string;
        documentation: boolean;
        sandbox: boolean;
      };
    };
    
    // Business features
    business: {
      customDomain: {
        enabled: boolean;
        sslRequired: boolean;
        dnsValidation: boolean;
        maxDomains: number;
      };
      whiteLabel: {
        enabled: boolean;
        customBranding: boolean;
        removePoweredBy: boolean;
      };
      integrations: {
        enabled: boolean;
        available: string[];
        webhooks: {
          enabled: boolean;
          maxEndpoints: number;
          retryPolicy: {
            maxRetries: number;
            backoffMultiplier: number;
          };
        };
      };
      reporting: {
        enabled: boolean;
        dashboards: boolean;
        exports: string[];
        scheduledReports: boolean;
        customMetrics: boolean;
      };
    };
    
    // Advanced features
    advanced: {
      multiTenancy: {
        enabled: boolean;
        isolation: 'database' | 'schema' | 'table';
        crossTenantAccess: boolean;
      };
      auditLogging: {
        enabled: boolean;
        events: string[];
        retention: number; // days
        encryption: boolean;
      };
      backup: {
        enabled: boolean;
        frequency: string;
        retention: number; // days
        encryption: boolean;
        compression: boolean;
      };
      monitoring: {
        enabled: boolean;
        metrics: string[];
        alerts: boolean;
        dashboards: boolean;
      };
    };
  };
  
  // Usage limits and quotas
  limits: {
    users: {
      max: number;
      current: number;
      warningThreshold: number;
    };
    storage: {
      max: number; // MB
      current: number;
      warningThreshold: number;
    };
    apiCalls: {
      max: number;
      current: number;
      resetPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
      warningThreshold: number;
    };
    customDomains: {
      max: number;
      current: number;
    };
    integrations: {
      max: number;
      current: number;
    };
  };
  
  // Integration configuration
  integrations: {
    email: {
      provider: string;
      apiKey?: string;
      fromAddress: string;
      templates: Record<string, string>;
    };
    payment: {
      provider: string;
      apiKey?: string;
      webhookSecret?: string;
      currency: string;
    };
    analytics: {
      provider: string;
      trackingId?: string;
      apiKey?: string;
    };
    storage: {
      provider: string;
      bucket: string;
      region: string;
      cdn: boolean;
    };
  };
  
  // Workflow-specific configuration
  workflow: {
    // Tenant lifecycle
    lifecycle: {
      onboarding: {
        enabled: boolean;
        steps: string[];
        automation: boolean;
      };
      offboarding: {
        enabled: boolean;
        dataRetention: number; // days
        notificationPeriod: number; // days
      };
    };
    
    // Feature rollouts
    rollouts: {
      featureFlags: Record<string, boolean>;
      gradualRollout: Record<string, number>; // percentage
      betaFeatures: string[];
      experimentalFeatures: string[];
    };
    
    // Monitoring and alerts
    monitoring: {
      healthChecks: {
        enabled: boolean;
        interval: number; // seconds
        endpoints: string[];
      };
      alerts: {
        enabled: boolean;
        channels: string[];
        thresholds: Record<string, number>;
      };
      metrics: {
        enabled: boolean;
        providers: string[];
        retention: number; // days
      };
    };
  };
  
  // Compliance and governance
  compliance: {
    gdpr: {
      enabled: boolean;
      dataProcessingBasis: string;
      consentRequired: boolean;
      rightToErasure: boolean;
    };
    soc2: {
      enabled: boolean;
      type: string;
      lastAudit: Date;
    };
    hipaa: {
      enabled: boolean;
      baaSigned: boolean;
      encryptionRequired: boolean;
    };
    iso27001: {
      enabled: boolean;
      certificationDate: Date;
      renewalDate: Date;
    };
  };
}

/**
 * Tenant Workflow Manager
 * Centralized management of tenant configurations
 */
export class TenantWorkflowManager {
  private static instance: TenantWorkflowManager;
  private workflows: Map<string, TenantWorkflow> = new Map();
  private defaultWorkflow: TenantWorkflow;
  
  private constructor() {
    this.defaultWorkflow = this.createDefaultWorkflow();
  }
  
  public static getInstance(): TenantWorkflowManager {
    if (!TenantWorkflowManager.instance) {
      TenantWorkflowManager.instance = new TenantWorkflowManager();
    }
    return TenantWorkflowManager.instance;
  }
  
  /**
   * Register a tenant workflow
   */
  public registerWorkflow(tenantId: string, workflow: TenantWorkflow): void {
    this.workflows.set(tenantId, workflow);
  }
  
  /**
   * Get tenant workflow
   */
  public getWorkflow(tenantId: string): TenantWorkflow | null {
    return this.workflows.get(tenantId) || null;
  }
  
  /**
   * Get all workflows
   */
  public getAllWorkflows(): Map<string, TenantWorkflow> {
    return new Map(this.workflows);
  }
  
  /**
   * Update tenant workflow
   */
  public updateWorkflow(tenantId: string, updates: Partial<TenantWorkflow>): boolean {
    const workflow = this.workflows.get(tenantId);
    if (!workflow) return false;
    
    const updatedWorkflow = { ...workflow, ...updates };
    this.workflows.set(tenantId, updatedWorkflow);
    return true;
  }
  
  /**
   * Remove tenant workflow
   */
  public removeWorkflow(tenantId: string): boolean {
    return this.workflows.delete(tenantId);
  }
  
  /**
   * Validate tenant workflow
   */
  public validateWorkflow(workflow: TenantWorkflow): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields validation
    if (!workflow.id) errors.push('Tenant ID is required');
    if (!workflow.name) errors.push('Tenant name is required');
    if (!workflow.subdomain) errors.push('Subdomain is required');
    if (!workflow.status) errors.push('Status is required');
    
    // Subdomain format validation
    if (workflow.subdomain && !/^[a-z0-9-]+$/.test(workflow.subdomain)) {
      errors.push('Subdomain can only contain lowercase letters, numbers, and hyphens');
    }
    
    // Color format validation
    if (workflow.branding?.colors?.primary && !/^#[0-9A-Fa-f]{6}$/.test(workflow.branding.colors.primary)) {
      errors.push('Primary color must be a valid hex color');
    }
    
    // Limits validation
    if (workflow.limits?.users?.max && workflow.limits.users.max < 1) {
      errors.push('User limit must be at least 1');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Create default workflow template
   */
  private createDefaultWorkflow(): TenantWorkflow {
    return {
      id: 'default',
      name: 'Default Tenant',
      subdomain: 'default',
      status: 'active',
      metadata: {
        plan: 'free',
        tier: 'basic',
        createdAt: new Date(),
        lastActive: new Date(),
        createdBy: 'system',
        tags: [],
        region: 'us-east-1',
        timezone: 'UTC'
      },
      branding: {
        logo: {
          primary: '/assets/logos/default-logo.svg',
          secondary: '/assets/logos/default-logo-secondary.svg',
          icon: '/assets/logos/default-icon.svg',
          favicon: '/assets/favicons/default-favicon.ico'
        },
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#10B981',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          text: {
            primary: '#0F172A',
            secondary: '#475569',
            muted: '#94A3B8'
          }
        },
        typography: {
          fontFamily: {
            primary: 'Inter, system-ui, sans-serif',
            secondary: 'Roboto, sans-serif',
            mono: 'JetBrains Mono, monospace'
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem'
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800
          },
          lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem',
          '3xl': '4rem',
          '4xl': '6rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          base: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          '2xl': '1rem',
          full: '9999px'
        },
        shadows: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        },
        assets: {
          heroImage: '/assets/images/default-hero.jpg',
          backgroundPattern: '/assets/patterns/default-pattern.svg',
          placeholderImage: '/assets/images/default-placeholder.jpg'
        }
      },
      security: {
        authentication: {
          sessionTimeout: 480,
          requireMFA: false,
          maxLoginAttempts: 5,
          lockoutDuration: 30,
          passwordExpiry: 90,
          rememberMe: true,
          rememberMeDuration: 30,
          allowedAuthMethods: ['password', 'oauth']
        },
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
          preventCommonPasswords: true,
          preventUserInfo: true,
          preventSequentialChars: true
        },
        rateLimiting: {
          enabled: true,
          maxRequests: 1000,
          windowMs: 900000,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          keyGenerator: 'ip',
          message: 'Too many requests, please try again later.'
        },
        cors: {
          enabled: true,
          origins: [],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
          credentials: true,
          maxAge: 86400
        },
        domainRestrictions: {
          allowedDomains: [],
          blockedDomains: [],
          redirectToHttps: true,
          enforceSubdomain: false
        },
        securityHeaders: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        },
        dataProtection: {
          encryptSensitiveData: true,
          encryptionAlgorithm: 'aes-256-gcm',
          dataRetention: 2555,
          anonymizeOnDelete: true,
          auditLogging: true,
          gdprCompliant: true
        }
      },
      features: {
        core: {
          userManagement: true,
          authentication: true,
          authorization: true,
          profileManagement: true,
          settings: true
        },
        platform: {
          analytics: {
            enabled: true,
            provider: 'google-analytics',
            events: ['page_view', 'user_action'],
            privacy: {
              anonymizeIP: true,
              respectDoNotTrack: true,
              cookieConsent: true
            }
          },
          notifications: {
            enabled: true,
            channels: ['email', 'in-app'],
            templates: {
              welcome: true,
              passwordReset: true,
              accountLocked: true
            },
            preferences: {
              userControllable: true,
              defaultEnabled: ['email', 'in-app']
            }
          },
          fileUpload: {
            enabled: true,
            maxFileSize: 10,
            allowedTypes: ['image', 'document'],
            storage: {
              provider: 'local',
              bucket: 'uploads',
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
            available: ['slack', 'microsoft-teams'],
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
            exports: ['pdf', 'csv'],
            scheduledReports: true,
            customMetrics: false
          }
        },
        advanced: {
          multiTenancy: {
            enabled: true,
            isolation: 'database',
            crossTenantAccess: false
          },
          auditLogging: {
            enabled: true,
            events: ['user_login', 'user_logout', 'data_access'],
            retention: 2555,
            encryption: true
          },
          backup: {
            enabled: true,
            frequency: 'daily',
            retention: 30,
            encryption: true,
            compression: true
          },
          monitoring: {
            enabled: true,
            metrics: ['performance', 'errors', 'usage'],
            alerts: true,
            dashboards: true
          }
        }
      },
      limits: {
        users: {
          max: 100,
          current: 0,
          warningThreshold: 80
        },
        storage: {
          max: 1024,
          current: 0,
          warningThreshold: 800
        },
        apiCalls: {
          max: 10000,
          current: 0,
          resetPeriod: 'monthly',
          warningThreshold: 8000
        },
        customDomains: {
          max: 1,
          current: 0
        },
        integrations: {
          max: 5,
          current: 0
        }
      },
      integrations: {
        email: {
          provider: 'sendgrid',
          fromAddress: 'noreply@example.com',
          templates: {}
        },
        payment: {
          provider: 'stripe',
          currency: 'USD'
        },
        analytics: {
          provider: 'google-analytics'
        },
        storage: {
          provider: 'local',
          bucket: 'uploads',
          region: 'us-east-1',
          cdn: false
        }
      },
      workflow: {
        lifecycle: {
          onboarding: {
            enabled: true,
            steps: ['welcome', 'profile_setup', 'feature_tour'],
            automation: true
          },
          offboarding: {
            enabled: true,
            dataRetention: 30,
            notificationPeriod: 7
          }
        },
        rollouts: {
          featureFlags: {},
          gradualRollout: {},
          betaFeatures: [],
          experimentalFeatures: []
        },
        monitoring: {
          healthChecks: {
            enabled: true,
            interval: 60,
            endpoints: ['/health', '/api/status']
          },
          alerts: {
            enabled: true,
            channels: ['email', 'slack'],
            thresholds: {
              errorRate: 5,
              responseTime: 2000,
              cpuUsage: 80
            }
          },
          metrics: {
            enabled: true,
            providers: ['prometheus'],
            retention: 90
          }
        }
      },
      compliance: {
        gdpr: {
          enabled: true,
          dataProcessingBasis: 'consent',
          consentRequired: true,
          rightToErasure: true
        },
        soc2: {
          enabled: false,
          type: 'Type II',
          lastAudit: new Date()
        },
        hipaa: {
          enabled: false,
          baaSigned: false,
          encryptionRequired: true
        },
        iso27001: {
          enabled: false,
          certificationDate: new Date(),
          renewalDate: new Date()
        }
      }
    };
  }
}

/**
 * Global tenant workflow instance
 */
export const tenantWorkflowManager = TenantWorkflowManager.getInstance();

/**
 * Utility functions for tenant workflow management
 */
export class TenantWorkflowUtils {
  /**
   * Create tenant workflow from template
   */
  public static createFromTemplate(
    tenantId: string,
    template: 'demo' | 'idea-vibes' | 'enterprise' | 'startup',
    overrides: Partial<TenantWorkflow> = {}
  ): TenantWorkflow {
    const baseWorkflow = tenantWorkflowManager.getWorkflow('default')!;
    
    // Apply template-specific configurations
    const templateConfig = this.getTemplateConfig(template);
    const workflow = this.mergeWorkflows(baseWorkflow, templateConfig);
    
    // Apply overrides
    const finalWorkflow = this.mergeWorkflows(workflow, overrides);
    
    // Set tenant ID
    finalWorkflow.id = tenantId;
    finalWorkflow.metadata.createdAt = new Date();
    finalWorkflow.metadata.lastActive = new Date();
    
    return finalWorkflow;
  }
  
  /**
   * Merge two workflows (deep merge)
   */
  public static mergeWorkflows(base: TenantWorkflow, override: Partial<TenantWorkflow>): TenantWorkflow {
    return JSON.parse(JSON.stringify({
      ...base,
      ...override,
      branding: { ...base.branding, ...override.branding },
      security: { ...base.security, ...override.security },
      features: { ...base.features, ...override.features },
      limits: { ...base.limits, ...override.limits },
      integrations: { ...base.integrations, ...override.integrations },
      workflow: { ...base.workflow, ...override.workflow },
      compliance: { ...base.compliance, ...override.compliance }
    }));
  }
  
  /**
   * Get template configuration
   */
  private static getTemplateConfig(template: string): Partial<TenantWorkflow> {
    const templates = {
      demo: {
        name: 'Demo Platform',
        subdomain: 'demo',
        metadata: { plan: 'pro', tier: 'standard' },
        branding: {
          colors: {
            primary: '#1E40AF',
            secondary: '#64748B',
            accent: '#059669'
          }
        },
        limits: {
          users: { max: 50 },
          storage: { max: 2048 },
          apiCalls: { max: 20000 }
        }
      },
      'idea-vibes': {
        name: 'Idea Vibes',
        subdomain: 'idea-vibes',
        metadata: { plan: 'enterprise', tier: 'premium' },
        branding: {
          colors: {
            primary: '#8B5CF6',
            secondary: '#F59E0B',
            accent: '#EC4899'
          }
        },
        limits: {
          users: { max: 200 },
          storage: { max: 10240 },
          apiCalls: { max: 50000 }
        }
      }
    };
    
    return templates[template as keyof typeof templates] || {};
  }
}
