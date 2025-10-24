/**
 * Initialize Demo and Idea Vibes Tenants
 * This script creates the demo and idea-vibes tenants with their configurations
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/luxgen_dev?authSource=admin';

// Demo tenant configuration
const demoTenantConfig = {
  name: 'Demo Platform',
  subdomain: 'demo',
  status: 'active',
  settings: {
    branding: {
      primaryColor: '#1E40AF',
      secondaryColor: '#64748B',
      accentColor: '#059669',
      fontFamily: 'Inter, system-ui, sans-serif',
      logo: '/assets/logos/demo-logo-primary.svg',
      favicon: '/assets/favicons/demo-favicon.ico',
      customCSS: `
        .demo-header {
          background: linear-gradient(135deg, #1E40AF 0%, #059669 100%);
          color: white;
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
        maxUsers: 50,
        maxStorage: 2048,
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
    createdBy: null
  }
};

// Idea Vibes tenant configuration
const ideaVibesTenantConfig = {
  name: 'Idea Vibes',
  subdomain: 'idea-vibes',
  status: 'active',
  settings: {
    branding: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#F59E0B',
      accentColor: '#EC4899',
      fontFamily: 'Poppins, system-ui, sans-serif',
      logo: '/assets/logos/idea-vibes-logo-primary.svg',
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
        }
      `
    },
    security: {
      allowedDomains: ['idea-vibes.localhost', 'idea-vibes.example.com'],
      corsOrigins: ['http://idea-vibes.localhost:3000', 'https://idea-vibes.example.com'],
      rateLimiting: {
        enabled: true,
        maxRequests: 5000,
        windowMs: 900000
      },
      sessionTimeout: 720,
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
        maxStorage: 10240,
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
};

async function initializeTenants() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('luxgen_dev');
    const tenantsCollection = db.collection('tenants');
    
    // Clear existing demo and idea-vibes tenants
    await tenantsCollection.deleteMany({ 
      subdomain: { $in: ['demo', 'idea-vibes'] } 
    });
    console.log('Cleared existing demo and idea-vibes tenants');
    
    // Insert demo tenant
    const demoResult = await tenantsCollection.insertOne(demoTenantConfig);
    console.log('✅ Demo tenant created:', demoResult.insertedId);
    
    // Insert idea-vibes tenant
    const ideaVibesResult = await tenantsCollection.insertOne(ideaVibesTenantConfig);
    console.log('✅ Idea Vibes tenant created:', ideaVibesResult.insertedId);
    
    // Verify tenants were created
    const tenants = await tenantsCollection.find({ 
      subdomain: { $in: ['demo', 'idea-vibes'] } 
    }).toArray();
    
    console.log('\n📋 Created Tenants:');
    tenants.forEach(tenant => {
      console.log(`  - ${tenant.name} (${tenant.subdomain}) - ${tenant.metadata.plan} plan`);
    });
    
    console.log('\n🎉 Tenant initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing tenants:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the initialization
initializeTenants();
