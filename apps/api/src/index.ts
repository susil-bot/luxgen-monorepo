import { config } from 'dotenv';
import { getApiUrl, getGraphqlUrl } from '@luxgen/config';
import { createAppServer } from './app';
import { connectDB } from './db/connect';
import { seedDatabaseIfEmpty } from './db/seed';
import { startTimelineRedisBridge } from './lib/timelineRedisBridge';

config();

const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const autoSeed = process.env.SEED_IF_EMPTY !== 'false' && process.env.NODE_ENV !== 'production';
    if (autoSeed) {
      await seedDatabaseIfEmpty();
    }

    const httpServer = await createAppServer();
    try {
      startTimelineRedisBridge();
    } catch (err) {
      console.warn('[timeline-redis-bridge] Disabled:', err instanceof Error ? err.message : String(err));
    }
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on ${getApiUrl()}`);
      console.log(`📊 GraphQL Playground: ${getGraphqlUrl()}`);
      console.log(`🔔 GraphQL Subscriptions: ws://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
