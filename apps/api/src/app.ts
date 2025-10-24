import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './schema';
import { resolvers } from './schema';
import { context } from './context';
import { authMiddleware } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';
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
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import tenantRoutes from './routes/tenant';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Tenant routing middleware (must be first)
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
app.use(tenantMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenant', tenantRoutes);

// Create Apollo Server
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

// Start Apollo Server and apply middleware
const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql' });
};

// Start the server
startServer().catch(console.error);

export { app };
