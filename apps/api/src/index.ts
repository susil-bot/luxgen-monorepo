import { config } from 'dotenv';
import { app, attachApolloServer } from './app';
import { connectDB } from './db/connect';

// Load environment variables
config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Attach GraphQL middleware BEFORE accepting connections, so a
    // request can never arrive before /graphql is ready.
    await attachApolloServer(app);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
