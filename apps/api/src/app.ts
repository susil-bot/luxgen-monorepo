import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';

import { typeDefs, resolvers } from './schema';
import { context } from './context';
import { errorHandler, notFoundHandler } from './utils/errorHandler';

// Middleware
import { authMiddleware } from './middleware/auth';
import { tenantRoutingMiddleware, tenantAuthMiddleware, tenantSecurityMiddleware } from './middleware/tenantRouting';
import {
  tenantHeadersMiddleware,
  tenantBrandingMiddleware,
  tenantSecurityHeadersMiddleware,
  tenantRateLimitMiddleware,
} from './middleware/tenantHeaders';

// Routes
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import tenantRoutes from './routes/tenant';
import tenantConfigRoutes from './routes/tenantConfig';
import billingRoutes, { stripeWebhookHandler } from './routes/billing';
import jobsRoutes from './routes/jobs';
import notificationsRoutes from './routes/notifications';

import { getCorsOrigins } from '@luxgen/config';

const CORS_ORIGINS = getCorsOrigins();

const app = express();

// ── Security ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CORS_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

// ── Stripe webhook (raw body — must register before express.json) ───────────
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Tenant resolution (must run before auth) ───────────────────────────────
app.use(tenantRoutingMiddleware);
app.use(tenantSecurityMiddleware);
app.use(tenantHeadersMiddleware);
app.use(tenantBrandingMiddleware);
app.use(tenantSecurityHeadersMiddleware);
app.use(tenantRateLimitMiddleware);

// ── Authentication ─────────────────────────────────────────────────────────
app.use(tenantAuthMiddleware);
app.use(authMiddleware);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── REST routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/tenant-config', tenantConfigRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/notifications', notificationsRoutes);

// ── GraphQL ───────────────────────────────────────────────────────────────
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  introspection: process.env.APOLLO_INTROSPECTION === 'true',
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return { message: error.message, locations: error.locations, path: error.path };
  },
});

const startApollo = async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });
  // Error handlers must register AFTER Apollo so /graphql is matched first
  app.use(notFoundHandler);
  app.use(errorHandler);
};

startApollo().catch(console.error);

export { app };
