/**
 * MongoDB initialization script — runs via mongosh on first container start.
 * Seeds two tenants: "demo" and "idea-vibes".
 * Users + groups are seeded separately via: docker exec luxgen-api npm run seed
 */

// Switch to the application database
db = db.getSiblingDB('luxgen_dev');

// ── Helpers ────────────────────────────────────────────────────────────────

function upsertTenant(config) {
  const existing = db.tenants.findOne({ subdomain: config.subdomain });
  if (existing) {
    print('⏭  Tenant already exists: ' + config.name + ' (' + config.subdomain + ')');
    return existing._id;
  }
  const result = db.tenants.insertOne(config);
  print('✅ Created tenant: ' + config.name + ' (' + config.subdomain + ')');
  return result.insertedId;
}

// ── Tenant: Demo Platform ──────────────────────────────────────────────────

upsertTenant({
  name: 'Demo Platform',
  subdomain: 'demo',
  domain: 'demo.localhost',
  status: 'active',
  settings: {
    branding: {
      primaryColor: '#1E40AF',
      secondaryColor: '#64748B',
      accentColor: '#059669',
      fontFamily: 'Inter, system-ui, sans-serif',
      logo: null,
      favicon: null,
      customCSS: '',
    },
    security: {
      allowedDomains: ['demo.localhost', 'localhost'],
      corsOrigins: ['http://demo.localhost:3000', 'http://localhost:3000'],
      rateLimiting: {
        enabled: true,
        maxRequests: 2000,
        windowMs: 900000,
      },
      sessionTimeout: 480,
      requireMFA: false,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false,
      },
    },
    config: {
      features: {
        analytics: true,
        notifications: true,
        fileUpload: true,
        apiAccess: true,
        customDomain: false,
      },
      limits: {
        maxUsers: 500,
        maxStorage: 5120,
        maxApiCalls: 20000,
      },
      integrations: {
        emailProvider: 'sendgrid',
        analyticsProvider: 'google-analytics',
      },
      storefront: {
        landingEnabled: true,
        routes: {
          landing: '/mentors',
          courses: '/learn',
          programs: '/store/product',
          login: '/login',
          register: '/register',
        },
      },
    },
  },
  metadata: {
    plan: 'pro',
    createdAt: new Date(),
    lastActive: new Date(),
    createdBy: null,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ── Tenant: Idea Vibes ─────────────────────────────────────────────────────

upsertTenant({
  name: 'Idea Vibes',
  subdomain: 'idea-vibes',
  domain: 'idea-vibes.localhost',
  status: 'active',
  settings: {
    branding: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#F59E0B',
      accentColor: '#EC4899',
      fontFamily: 'Poppins, system-ui, sans-serif',
      logo: null,
      favicon: null,
      customCSS: '',
    },
    security: {
      allowedDomains: ['idea-vibes.localhost', 'localhost'],
      corsOrigins: ['http://idea-vibes.localhost:3000', 'http://localhost:3000'],
      rateLimiting: {
        enabled: true,
        maxRequests: 5000,
        windowMs: 900000,
      },
      sessionTimeout: 720,
      requireMFA: false,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false,
      },
    },
    config: {
      features: {
        analytics: true,
        notifications: true,
        fileUpload: true,
        apiAccess: true,
        customDomain: true,
      },
      limits: {
        maxUsers: 200,
        maxStorage: 10240,
        maxApiCalls: 50000,
      },
      integrations: {
        emailProvider: 'mailgun',
        paymentProvider: 'stripe',
        analyticsProvider: 'mixpanel',
      },
    },
  },
  metadata: {
    plan: 'enterprise',
    createdAt: new Date(),
    lastActive: new Date(),
    createdBy: null,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ── Indexes ────────────────────────────────────────────────────────────────

db.tenants.createIndex({ subdomain: 1 }, { unique: true });
db.tenants.createIndex({ domain: 1 });
db.tenants.createIndex({ status: 1 });

print('\n🎉 MongoDB initialization complete.');
print('   Tenants ready: demo, idea-vibes');
print('   Run: docker exec luxgen-api npm run seed   (to seed users + groups)');
