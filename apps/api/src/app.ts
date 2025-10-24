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

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://demo.localhost:3000',
      'http://idea-vibes.localhost:3000',
      process.env.CORS_ORIGIN || 'http://localhost:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
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
