import mongoose from 'mongoose';
import { connectDB } from '@luxgen/db';
import { getMongoUri } from '@luxgen/config';

let connectPromise: Promise<void> | null = null;

/** Ensure MongoDB is connected for Next.js API routes that read @luxgen/db models. */
export async function ensureDbConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  if (!connectPromise) {
    connectPromise = connectDB(getMongoUri());
  }
  await connectPromise;
}
