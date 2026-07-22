import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxgen';

    await mongoose.connect(mongoURI, {
      // Fail fast instead of hanging indefinitely if Mongo isn't reachable
      // yet - matters on a single free-tier instance where the api
      // container can start before the mongodb container has finished
      // its own startup, even with a Compose healthcheck in between.
      // Cast needed: valid, standard MongoDB driver connect option, but
      // missing from this mongoose version's ConnectOptions type.
      serverSelectionTimeoutMS: 10_000,
      // t3.micro has 1GB RAM total, shared with mongod itself, redis, and
      // both node processes - keep the driver's connection pool small
      // rather than the Mongoose default (100), which is sized for
      // hardware this instance doesn't have.
      maxPoolSize: 10,
      minPoolSize: 1,
    } as mongoose.ConnectOptions);

    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    // Don't process.exit here - connectDB is called from two places with
    // different needs: index.ts's startServer() wants a hard exit on
    // failure (already does its own try/catch + process.exit(1) around
    // this call), but tests/globalSetup.ts explicitly wants to log and
    // continue without a database. Exiting unconditionally inside this
    // shared function overrode that second case and killed the entire
    // Jest process instead of letting individual tests fail normally.
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
  }
};
