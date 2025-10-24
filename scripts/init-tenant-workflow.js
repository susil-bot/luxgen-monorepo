#!/usr/bin/env node

/**
 * Initialize Centralized Tenant Workflow System
 * 
 * This script initializes the centralized tenant workflow system by:
 * 1. Creating tenant workflows for demo and idea-vibes tenants
 * 2. Registering them with the TenantWorkflowManager
 * 3. Setting up proper configurations and limits
 * 4. Validating the setup
 */

const { MongoClient } = require('mongodb');
const { TenantWorkflowManager, TenantWorkflowUtils } = require('@luxgen/shared/tenant/TenantWorkflow');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/luxgen_dev?authSource=admin';

async function initializeTenantWorkflow() {
  let client;
  
  try {
    console.log('🚀 Initializing Centralized Tenant Workflow System...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('luxgen_dev');
    const tenantsCollection = db.collection('tenants');
    
    // Initialize TenantWorkflowManager
    const workflowManager = TenantWorkflowManager.getInstance();
    
    // Create demo tenant workflow
    console.log('📋 Creating demo tenant workflow...');
    const demoWorkflow = TenantWorkflowUtils.createFromTemplate('demo', 'demo', {
      name: 'Demo Platform',
      subdomain: 'demo',
      status: 'active',
      metadata: {
        plan: 'pro',
        tier: 'standard',
        createdAt: new Date(),
        lastActive: new Date(),
        createdBy: 'system',
        tags: ['demo', 'testing', 'development'],
        region: 'us-east-1',
        timezone: 'America/New_York'
      },
      branding: {
        logo: {
          primary: '/assets/logos/demo-logo.svg',
          secondary: '/assets/logos/demo-logo-secondary.svg',
          icon: '/assets/logos/demo-icon.svg',
          favicon: '/assets/favicons/demo-favicon.ico'
        },
        colors: {
          primary: '#1E40AF',
          secondary: '#64748B',
          accent: '#059669',
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
          }
        },
        assets: {
          heroImage: '/assets/images/demo-hero.jpg',
          backgroundPattern: '/assets/patterns/demo-pattern.svg',
          placeholderImage: '/assets/images/demo-placeholder.jpg'
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
          maxRequests: 2000,
          windowMs: 900000,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          keyGenerator: 'ip',
          message: 'Too many requests, please try again later.'
        },
        cors: {
          enabled: true,
          origins: ['http://demo.localhost:3000', 'https://demo.example.com'],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
          credentials: true,
          maxAge: 86400
        },
        domainRestrictions: {
          allowedDomains: ['demo.localhost', 'demo.example.com'],
          blockedDomains: [],
          redirectToHttps: true,
          enforceSubdomain: true
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
            trackingId: 'GA-DEMO-123456',
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
              featureUpdate: true
            },
            preferences: {
              userControllable: true,
              defaultEnabled: ['email', 'in-app']
            }
          },
          fileUpload: {
            enabled: true,
            maxFileSize: 50,
            allowedTypes: ['image', 'document', 'video'],
            storage: {
              provider: 'aws-s3',
              bucket: 'luxgen-demo-uploads',
              cdn: true
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
            rateLimit: 2000,
            authentication: 'bearer',
            documentation: true,
            sandbox: true
          }
        },
        business: {
          customDomain: {
            enabled: true,
            sslRequired: true,
            dnsValidation: true,
            maxDomains: 3
          },
          whiteLabel: {
            enabled: true,
            customBranding: true,
            removePoweredBy: true
          },
          integrations: {
            enabled: true,
            available: ['slack', 'microsoft-teams', 'discord', 'webhook'],
            webhooks: {
              enabled: true,
              maxEndpoints: 10,
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
            customMetrics: true
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
            events: ['user_login', 'user_logout', 'data_access', 'configuration_change'],
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
            metrics: ['performance', 'errors', 'usage', 'security'],
            alerts: true,
            dashboards: true
          }
        }
      },
      limits: {
        users: {
          max: 50,
          current: 0,
          warningThreshold: 40
        },
        storage: {
          max: 2048,
          current: 0,
          warningThreshold: 1600
        },
        apiCalls: {
          max: 20000,
          current: 0,
          resetPeriod: 'monthly',
          warningThreshold: 16000
        },
        customDomains: {
          max: 3,
          current: 0
        },
        integrations: {
          max: 10,
          current: 0
        }
      },
      integrations: {
        email: {
          provider: 'sendgrid',
          apiKey: process.env.SENDGRID_API_KEY,
          fromAddress: 'noreply@demo.luxgen.com',
          templates: {
            welcome: 'welcome-demo-template',
            passwordReset: 'password-reset-demo-template',
            accountLocked: 'account-locked-demo-template'
          }
        },
        payment: {
          provider: 'stripe',
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          currency: 'USD'
        },
        analytics: {
          provider: 'google-analytics',
          trackingId: 'GA-DEMO-123456',
          apiKey: process.env.GA_API_KEY
        },
        storage: {
          provider: 'aws-s3',
          bucket: 'luxgen-demo-uploads',
          region: 'us-east-1',
          cdn: true
        }
      },
      workflow: {
        lifecycle: {
          onboarding: {
            enabled: true,
            steps: ['welcome', 'profile_setup', 'feature_tour', 'first_action'],
            automation: true
          },
          offboarding: {
            enabled: true,
            dataRetention: 30,
            notificationPeriod: 7
          }
        },
        rollouts: {
          featureFlags: {
            'new-dashboard': true,
            'advanced-analytics': false,
            'beta-features': false
          },
          gradualRollout: {
            'new-dashboard': 100,
            'advanced-analytics': 0,
            'beta-features': 0
          },
          betaFeatures: ['advanced-analytics', 'beta-features'],
          experimentalFeatures: ['ai-insights', 'predictive-analytics']
        },
        monitoring: {
          healthChecks: {
            enabled: true,
            interval: 30,
            endpoints: ['/health', '/api/status', '/api/tenant/health']
          },
          alerts: {
            enabled: true,
            channels: ['email', 'slack'],
            thresholds: {
              errorRate: 5,
              responseTime: 2000,
              cpuUsage: 80,
              memoryUsage: 85
            }
          },
          metrics: {
            enabled: true,
            providers: ['prometheus', 'datadog'],
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
          enabled: true,
          type: 'Type II',
          lastAudit: new Date(),
          nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
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
    });
    
    // Create idea-vibes tenant workflow
    console.log('📋 Creating idea-vibes tenant workflow...');
    const ideaVibesWorkflow = TenantWorkflowUtils.createFromTemplate('idea-vibes', 'idea-vibes', {
      name: 'Idea Vibes',
      subdomain: 'idea-vibes',
      status: 'active',
      metadata: {
        plan: 'enterprise',
        tier: 'premium',
        createdAt: new Date(),
        lastActive: new Date(),
        createdBy: 'system',
        tags: ['creative', 'innovation', 'enterprise'],
        region: 'us-west-2',
        timezone: 'America/Los_Angeles'
      },
      branding: {
        logo: {
          primary: '/assets/logos/idea-vibes-logo.svg',
          secondary: '/assets/logos/idea-vibes-logo-secondary.svg',
          icon: '/assets/logos/idea-vibes-icon.svg',
          favicon: '/assets/favicons/idea-vibes-favicon.ico'
        },
        colors: {
          primary: '#8B5CF6',
          secondary: '#F59E0B',
          accent: '#EC4899',
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
            primary: 'Poppins, system-ui, sans-serif',
            secondary: 'Open Sans, sans-serif',
            mono: 'Fira Code, monospace'
          }
        },
        assets: {
          heroImage: '/assets/images/idea-vibes-hero.jpg',
          backgroundPattern: '/assets/patterns/idea-vibes-pattern.svg',
          placeholderImage: '/assets/images/idea-vibes-placeholder.jpg'
        }
      },
      security: {
        authentication: {
          sessionTimeout: 720,
          requireMFA: true,
          maxLoginAttempts: 3,
          lockoutDuration: 60,
          passwordExpiry: 60,
          rememberMe: true,
          rememberMeDuration: 14,
          allowedAuthMethods: ['password', 'oauth', 'sso']
        },
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          preventCommonPasswords: true,
          preventUserInfo: true,
          preventSequentialChars: true
        },
        rateLimiting: {
          enabled: true,
          maxRequests: 5000,
          windowMs: 900000,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
          keyGenerator: 'user',
          message: 'Rate limit exceeded. Please try again later.'
        },
        cors: {
          enabled: true,
          origins: ['http://idea-vibes.localhost:3000', 'https://idea-vibes.example.com'],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
          credentials: true,
          maxAge: 86400
        },
        domainRestrictions: {
          allowedDomains: ['idea-vibes.localhost', 'idea-vibes.example.com'],
          blockedDomains: [],
          redirectToHttps: true,
          enforceSubdomain: true
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
            provider: 'mixpanel',
            trackingId: 'MIX-IDEA-VIBES-123456',
            events: ['page_view', 'user_action', 'conversion', 'engagement'],
            privacy: {
              anonymizeIP: true,
              respectDoNotTrack: true,
              cookieConsent: true
            }
          },
          notifications: {
            enabled: true,
            channels: ['email', 'in-app', 'push', 'sms'],
            templates: {
              welcome: true,
              passwordReset: true,
              accountLocked: true,
              featureUpdate: true,
              securityAlert: true
            },
            preferences: {
              userControllable: true,
              defaultEnabled: ['email', 'in-app', 'push']
            }
          },
          fileUpload: {
            enabled: true,
            maxFileSize: 100,
            allowedTypes: ['image', 'document', 'video', 'audio'],
            storage: {
              provider: 'aws-s3',
              bucket: 'luxgen-idea-vibes-uploads',
              cdn: true
            },
            processing: {
              imageResize: true,
              thumbnailGeneration: true,
              virusScan: true
            }
          },
          apiAccess: {
            enabled: true,
            version: 'v2',
            rateLimit: 5000,
            authentication: 'bearer',
            documentation: true,
            sandbox: true
          }
        },
        business: {
          customDomain: {
            enabled: true,
            sslRequired: true,
            dnsValidation: true,
            maxDomains: 5
          },
          whiteLabel: {
            enabled: true,
            customBranding: true,
            removePoweredBy: true
          },
          integrations: {
            enabled: true,
            available: ['slack', 'microsoft-teams', 'discord', 'webhook', 'zapier'],
            webhooks: {
              enabled: true,
              maxEndpoints: 20,
              retryPolicy: {
                maxRetries: 5,
                backoffMultiplier: 2
              }
            }
          },
          reporting: {
            enabled: true,
            dashboards: true,
            exports: ['pdf', 'csv', 'excel', 'json'],
            scheduledReports: true,
            customMetrics: true
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
            events: ['user_login', 'user_logout', 'data_access', 'configuration_change', 'security_event'],
            retention: 2555,
            encryption: true
          },
          backup: {
            enabled: true,
            frequency: 'hourly',
            retention: 90,
            encryption: true,
            compression: true
          },
          monitoring: {
            enabled: true,
            metrics: ['performance', 'errors', 'usage', 'security', 'business'],
            alerts: true,
            dashboards: true
          }
        }
      },
      limits: {
        users: {
          max: 200,
          current: 0,
          warningThreshold: 160
        },
        storage: {
          max: 10240,
          current: 0,
          warningThreshold: 8000
        },
        apiCalls: {
          max: 50000,
          current: 0,
          resetPeriod: 'monthly',
          warningThreshold: 40000
        },
        customDomains: {
          max: 5,
          current: 0
        },
        integrations: {
          max: 20,
          current: 0
        }
      },
      integrations: {
        email: {
          provider: 'sendgrid',
          apiKey: process.env.SENDGRID_API_KEY,
          fromAddress: 'noreply@idea-vibes.luxgen.com',
          templates: {
            welcome: 'welcome-idea-vibes-template',
            passwordReset: 'password-reset-idea-vibes-template',
            accountLocked: 'account-locked-idea-vibes-template',
            securityAlert: 'security-alert-idea-vibes-template'
          }
        },
        payment: {
          provider: 'stripe',
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          currency: 'USD'
        },
        analytics: {
          provider: 'mixpanel',
          trackingId: 'MIX-IDEA-VIBES-123456',
          apiKey: process.env.MIXPANEL_API_KEY
        },
        storage: {
          provider: 'aws-s3',
          bucket: 'luxgen-idea-vibes-uploads',
          region: 'us-west-2',
          cdn: true
        }
      },
      workflow: {
        lifecycle: {
          onboarding: {
            enabled: true,
            steps: ['welcome', 'profile_setup', 'feature_tour', 'first_action', 'team_setup'],
            automation: true
          },
          offboarding: {
            enabled: true,
            dataRetention: 90,
            notificationPeriod: 14
          }
        },
        rollouts: {
          featureFlags: {
            'new-dashboard': true,
            'advanced-analytics': true,
            'beta-features': true,
            'ai-insights': false
          },
          gradualRollout: {
            'new-dashboard': 100,
            'advanced-analytics': 50,
            'beta-features': 25,
            'ai-insights': 0
          },
          betaFeatures: ['advanced-analytics', 'beta-features'],
          experimentalFeatures: ['ai-insights', 'predictive-analytics', 'ml-recommendations']
        },
        monitoring: {
          healthChecks: {
            enabled: true,
            interval: 15,
            endpoints: ['/health', '/api/status', '/api/tenant/health', '/api/tenant/performance']
          },
          alerts: {
            enabled: true,
            channels: ['email', 'slack', 'pagerduty'],
            thresholds: {
              errorRate: 3,
              responseTime: 1500,
              cpuUsage: 70,
              memoryUsage: 80
            }
          },
          metrics: {
            enabled: true,
            providers: ['prometheus', 'datadog', 'newrelic'],
            retention: 180
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
          enabled: true,
          type: 'Type II',
          lastAudit: new Date(),
          nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        hipaa: {
          enabled: true,
          baaSigned: true,
          encryptionRequired: true
        },
        iso27001: {
          enabled: true,
          certificationDate: new Date(),
          renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Register workflows with manager
    workflowManager.registerWorkflow('demo', demoWorkflow);
    workflowManager.registerWorkflow('idea-vibes', ideaVibesWorkflow);
    
    // Validate workflows
    console.log('🔍 Validating tenant workflows...');
    const demoValidation = workflowManager.validateWorkflow(demoWorkflow);
    const ideaVibesValidation = workflowManager.validateWorkflow(ideaVibesWorkflow);
    
    if (!demoValidation.valid) {
      console.error('❌ Demo tenant workflow validation failed:', demoValidation.errors);
      process.exit(1);
    }
    
    if (!ideaVibesValidation.valid) {
      console.error('❌ Idea-vibes tenant workflow validation failed:', ideaVibesValidation.errors);
      process.exit(1);
    }
    
    console.log('✅ Tenant workflows validated successfully');
    
    // Update MongoDB with workflow data
    console.log('💾 Updating MongoDB with tenant workflows...');
    
    // Update demo tenant
    await tenantsCollection.updateOne(
      { subdomain: 'demo' },
      { 
        $set: { 
          workflow: demoWorkflow,
          updatedAt: new Date()
        }
      }
    );
    
    // Update idea-vibes tenant
    await tenantsCollection.updateOne(
      { subdomain: 'idea-vibes' },
      { 
        $set: { 
          workflow: ideaVibesWorkflow,
          updatedAt: new Date()
        }
      }
    );
    
    console.log('✅ MongoDB updated with tenant workflows');
    
    // Test the system
    console.log('🧪 Testing tenant workflow system...');
    
    // Test demo tenant
    const demoConfig = workflowManager.getWorkflow('demo');
    if (!demoConfig) {
      console.error('❌ Demo tenant workflow not found');
      process.exit(1);
    }
    
    // Test idea-vibes tenant
    const ideaVibesConfig = workflowManager.getWorkflow('idea-vibes');
    if (!ideaVibesConfig) {
      console.error('❌ Idea-vibes tenant workflow not found');
      process.exit(1);
    }
    
    console.log('✅ Tenant workflow system tested successfully');
    
    // Display summary
    console.log('\n📊 Tenant Workflow System Summary:');
    console.log('=====================================');
    console.log(`Demo Tenant:`);
    console.log(`  - Plan: ${demoConfig.metadata.plan}`);
    console.log(`  - Tier: ${demoConfig.metadata.tier}`);
    console.log(`  - Max Users: ${demoConfig.limits.users.max}`);
    console.log(`  - Max Storage: ${demoConfig.limits.storage.max} MB`);
    console.log(`  - Max API Calls: ${demoConfig.limits.apiCalls.max}`);
    console.log(`  - Features: ${Object.keys(demoConfig.features).length} categories`);
    console.log(`  - Integrations: ${Object.keys(demoConfig.integrations).length} providers`);
    
    console.log(`\nIdea Vibes Tenant:`);
    console.log(`  - Plan: ${ideaVibesConfig.metadata.plan}`);
    console.log(`  - Tier: ${ideaVibesConfig.metadata.tier}`);
    console.log(`  - Max Users: ${ideaVibesConfig.limits.users.max}`);
    console.log(`  - Max Storage: ${ideaVibesConfig.limits.storage.max} MB`);
    console.log(`  - Max API Calls: ${ideaVibesConfig.limits.apiCalls.max}`);
    console.log(`  - Features: ${Object.keys(ideaVibesConfig.features).length} categories`);
    console.log(`  - Integrations: ${Object.keys(ideaVibesConfig.integrations).length} providers`);
    
    console.log('\n🎉 Centralized Tenant Workflow System initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the API server: npm run dev:api');
    console.log('2. Test tenant endpoints: curl -H "X-Tenant-ID: demo" http://localhost:4000/api/tenant/current');
    console.log('3. Check tenant features: curl -H "X-Tenant-ID: idea-vibes" http://localhost:4000/api/tenant/features');
    console.log('4. Monitor tenant usage: curl -H "X-Tenant-ID: demo" http://localhost:4000/api/tenant/usage');
    
  } catch (error) {
    console.error('❌ Error initializing tenant workflow system:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the initialization
if (require.main === module) {
  initializeTenantWorkflow();
}

module.exports = { initializeTenantWorkflow };
