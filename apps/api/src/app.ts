import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './schema';
import { resolvers } from './schema';
import { context } from './context';
import { authMiddleware } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

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

// Custom middleware
app.use(tenantMiddleware);
app.use(authMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

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

// Apply Apollo GraphQL middleware
server.applyMiddleware({ app: app as any, path: '/graphql' });

export { app };
