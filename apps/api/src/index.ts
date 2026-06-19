import { config } from 'dotenv';
import { getApiUrl, getGraphqlUrl } from '@luxgen/config';
import { app } from './app';
import { connectDB } from './db/connect';

// Load environment variables
config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${getApiUrl()}`);
      console.log(`📊 GraphQL Playground: ${getGraphqlUrl()}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
