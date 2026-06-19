import { createServer, type Server as HttpServer } from 'http';
import { execute, subscribe } from 'graphql';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';

import { schema } from './schema';
import { context, buildGraphQLContext, type GraphQLContext } from './context';
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

const apolloServer = new ApolloServer({
  schema,
  context,
  introspection: process.env.APOLLO_INTROSPECTION === 'true',
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return { message: error.message, locations: error.locations, path: error.path };
  },
});

let httpServer: HttpServer | null = null;
let wsServer: WebSocketServer | null = null;
let wsCleanup: (() => Promise<void>) | null = null;

const startApollo = async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });
  app.use(notFoundHandler);
  app.use(errorHandler);
};

export async function createAppServer(): Promise<HttpServer> {
  await startApollo();

  httpServer = createServer(app);

  // graphql-ws replaces the deprecated subscriptions-transport-ws
  wsServer = new WebSocketServer({ server: httpServer, path: apolloServer.graphqlPath });

  const cleanup = useServer(
    {
      schema,
      execute,
      subscribe,
      context: async (ctx: { connectionParams?: Record<string, unknown> }) => {
        const params = (ctx.connectionParams ?? {}) as Record<string, string>;
        const gqlCtx = await buildGraphQLContext({
          headers: {
            authorization: params.authorization ?? '',
            'x-tenant': params['x-tenant'] ?? '',
          },
        });
        if (!gqlCtx.user) throw new Error('Authentication required');
        return gqlCtx as GraphQLContext;
      },
    },
    wsServer,
  );

  wsCleanup = async () => {
    await cleanup.dispose();
  };

  return httpServer;
}

export async function stopAppServer(): Promise<void> {
  if (wsCleanup) {
    await wsCleanup();
    wsCleanup = null;
  }
  wsServer?.close();
  wsServer = null;
  if (httpServer) {
    await new Promise<void>((resolve, reject) => {
      httpServer!.close((err) => (err ? reject(err) : resolve()));
    });
    httpServer = null;
  }
  await apolloServer.stop();
}

export { app };
