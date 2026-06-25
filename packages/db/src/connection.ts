import mongoose from 'mongoose';

export const connectDB = async (uri: string): Promise<void> => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 20,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
    throw error;
  }
};
