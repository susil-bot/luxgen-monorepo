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
      // Flat-domain production deployment (no wildcard *.luxgen.in DNS) —
      // real traffic arrives with Origin/Host www.luxgen.in or luxgen.in
      // via the x-tenant header, not a per-tenant subdomain.
      allowedDomains: ['demo.localhost', 'www.luxgen.in', 'luxgen.in', 'luxgen-monorepo-web.vercel.app', 'demo.example.com'],
      corsOrigins: ['http://demo.localhost:3000', 'https://www.luxgen.in', 'https://luxgen.in', 'https://luxgen-monorepo-web.vercel.app', 'https://demo.example.com'],
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
      allowedDomains: [
        'idea-vibes.localhost',
        'www.luxgen.in',
        'luxgen.in',
        'luxgen-monorepo-web.vercel.app',
        'idea-vibes.example.com',
      ],
      corsOrigins: [
        'http://idea-vibes.localhost:3000',
        'https://www.luxgen.in',
        'https://luxgen.in',
        'https://luxgen-monorepo-web.vercel.app',
        'https://idea-vibes.example.com',
      ],
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
    
    // No argument = use whatever database is in MONGODB_URI's path (matches
    // Mongoose's own behavior). Previously hardcoded to 'luxgen_dev', which
    // silently wrote tenants into the wrong database whenever MONGODB_URI
    // pointed anywhere else (e.g. production's luxgen_prod) — the API would
    // never see them, and /api/tenant-config/available would keep returning
    // an empty list with no error.
    const db = client.db();
    const tenantsCollection = db.collection('tenants');

    // Upsert by subdomain instead of delete+insert. Once real users exist
    // (users.tenant references a Tenant _id), deleting and re-inserting
    // would hand the tenant a brand-new _id and silently orphan every
    // user pointed at the old one — this is exactly what would have
    // happened to the SUPER_ADMIN account bootstrapped for 'demo' the
    // next time this script ran (e.g. just to pick up a corsOrigins fix).
    // upsert:true still creates it fresh on a truly empty database.
    //
    // On an existing doc, a full $set of every field would also silently
    // clobber anything hand-edited live in Atlas (e.g. exactly the
    // corsOrigins/allowedDomains patch this script's own config was meant
    // to obsolete) the next time someone re-runs this for an unrelated
    // reason. Default behavior is now: skip existing tenants entirely and
    // just report their current settings; pass --force to actually
    // overwrite one with the hardcoded config below. createdAt is still
    // preserved on a --force overwrite (read the original value first)
    // rather than being reset to "now" — Mongo rejects $set on 'metadata'
    // combined with $setOnInsert on 'metadata.createdAt' in the same
    // update (overlapping paths), so the existing value is resolved up
    // front and folded into one plain $set.
    const FORCE = process.argv.includes('--force');

    async function upsertTenant(config) {
      const existing = await tenantsCollection.findOne({ subdomain: config.subdomain });

      if (existing && !FORCE) {
        console.log(
          `⏭️  ${config.subdomain} already exists (_id ${existing._id}) — leaving it untouched.\n` +
            `   Re-run with --force to overwrite it with the config in this script.`,
        );
        return '(existing, left untouched)';
      }

      const createdAt = existing?.metadata?.createdAt || config.metadata.createdAt;
      const result = await tenantsCollection.updateOne(
        { subdomain: config.subdomain },
        { $set: { ...config, metadata: { ...config.metadata, createdAt } } },
        { upsert: true },
      );
      return result.upsertedId || (existing ? '(existing _id preserved, forced overwrite)' : '(existing _id preserved)');
    }

    const demoResult = await upsertTenant(demoTenantConfig);
    console.log('✅ Demo tenant upserted:', demoResult);

    const ideaVibesResult = await upsertTenant(ideaVibesTenantConfig);
    console.log('✅ Idea Vibes tenant upserted:', ideaVibesResult);
    
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
