import { disconnectDB } from '../db/connect';

export default async function globalTeardown() {
  try {
    // Disconnect from test database
    await disconnectDB();
    console.log('✅ Test database disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect from test database:', error);
  }
}
