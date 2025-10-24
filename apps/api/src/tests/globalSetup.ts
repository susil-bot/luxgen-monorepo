import { connectDB } from '../db/connect';

export default async function globalSetup() {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/luxgen-test';
  
  try {
    // Connect to test database
    await connectDB();
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    // Don't exit, let tests run without database
  }
}
