import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './schema';
import { resolvers } from './schema';
import { context } from './context';
import { authMiddleware } from './middleware/auth';
import {
  tenantRoutingMiddleware,
  tenantAuthMiddleware,
  tenantSecurityMiddleware
} from './middleware/tenantRouting';
import {
  tenantHeadersMiddleware,
  tenantBrandingMiddleware,
  tenantSecurityHeadersMiddleware,
  tenantRateLimitMiddleware
} from './middleware/tenantHeaders';
// import {
//   tenantWorkflowMiddleware,
//   tenantFeatureMiddleware,
//   tenantLimitMiddleware,
//   tenantUsageTrackingMiddleware,
//   tenantComplianceMiddleware
// } from './middleware/tenantWorkflow';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import tenantRoutes from './routes/tenant';
import tenantConfigRoutes from './routes/tenantConfig';

/**
 * CORS origin matching.
 *
 * The old version checked against a hardcoded list of four literal
 * strings, which doesn't scale to a subdomain-per-tenant model (every new
 * tenant subdomain would need a code change and redeploy). This derives
 * an allowed base domain from CORS_ORIGIN (e.g. "https://app.example.com"
 * -> "example.com") and allows that domain plus any HTTPS subdomain of
 * it, so demo.example.com / acme-corp.example.com / etc. all work without
 * further config. Falls back to the literal CORS_ORIGIN value if it
 * doesn't parse as a URL.
 */
const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://demo.localhost:3000',
  'http://idea-vibes.localhost:3000',
  'http://acme-corp.localhost:3000',
];

const getBaseDomain = (origin: string | undefined): string | null => {
  if (!origin) return null;
  try {
    const hostname = new URL(origin).hostname;
    const parts = hostname.split('.');
    return parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
  } catch {
    return null;
  }
};

const configuredOrigin = process.env.CORS_ORIGIN;
const allowedBaseDomain = getBaseDomain(configuredOrigin);

const isAllowedOrigin = (origin: string): boolean => {
  if (DEV_ORIGINS.includes(origin)) return true;
  if (configuredOrigin && origin === configuredOrigin) return true;

  if (allowedBaseDomain) {
    try {
      const url = new URL(origin);
      if (url.protocol !== 'https:') return false;
      return url.hostname === allowedBaseDomain || url.hostname.endsWith(`.${allowedBaseDomain}`);
    } catch {
      return false;
    }
  }

  return false;
};

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Centralized tenant workflow middleware (must be first)
// app.use(tenantWorkflowMiddleware);

// Legacy tenant routing middleware (for backward compatibility)
app.use(tenantRoutingMiddleware);

// Tenant security middleware
app.use(tenantSecurityMiddleware);

// Tenant headers middleware
app.use(tenantHeadersMiddleware);
app.use(tenantBrandingMiddleware);
app.use(tenantSecurityHeadersMiddleware);
app.use(tenantRateLimitMiddleware);

// Authentication middleware
app.use(tenantAuthMiddleware);
app.use(authMiddleware);

// Legacy tenant middleware (for backward compatibility)
// app.use(tenantMiddleware); // Commented out as it overwrites the tenant object

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/tenant-config', tenantConfigRoutes);

/**
 * Attaches the Apollo Server GraphQL middleware to `app` at /graphql.
 * Must be awaited before the HTTP server starts accepting connections -
 * index.ts does `await attachApolloServer(app)` before `app.listen()`.
 *
 * Previously this ran as a fire-and-forget async call at module load
 * time (`startServer().catch(console.error)`) while index.ts called
 * app.listen() immediately after connectDB() resolved, with no ordering
 * guarantee between the two - a request landing in that window hit a
 * 404 instead of GraphQL (most likely right after a cold start / ASG
 * instance replacement). REST routes above don't depend on this and are
 * available as soon as `app` is imported, which is what the existing
 * supertest-based route tests rely on.
 */
export async function attachApolloServer(target: express.Express = app): Promise<void> {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    introspection: process.env.APOLLO_INTROSPECTION === 'true',
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  });

  await server.start();
  server.applyMiddleware({ app: target as any, path: '/graphql' });
  console.log('✅ Apollo Server middleware applied to /graphql');
}

export { app };
