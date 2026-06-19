import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import type { HeadlessTaskJob } from '../types/task';

const QUEUE_KEY = 'luxgen:agent:tasks';

let redis: Redis | null = null;

export function getRedisUrl(): string | undefined {
  return process.env.AGENT_REDIS_URL || process.env.REDIS_URL;
}

export function isQueueEnabled(): boolean {
  return Boolean(getRedisUrl()) && process.env.AGENT_QUEUE_ENABLED !== 'false';
}

export function getRedisClient(): Redis | null {
  if (!isQueueEnabled()) return null;
  if (!redis) {
    redis = new Redis(getRedisUrl()!, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redis;
}

export async function connectQueue(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  try {
    if (client.status !== 'ready') await client.connect();
    return true;
  } catch {
    return false;
  }
}

export async function enqueueHeadlessTask(
  job: Omit<HeadlessTaskJob, 'id' | 'enqueuedAt'>,
): Promise<HeadlessTaskJob | null> {
  const client = getRedisClient();
  if (!client) return null;
  await connectQueue();

  const fullJob: HeadlessTaskJob = {
    ...job,
    id: randomUUID(),
    enqueuedAt: Date.now(),
  };

  await client.lpush(QUEUE_KEY, JSON.stringify(fullJob));
  return fullJob;
}

export async function dequeueHeadlessTask(timeoutSeconds = 5): Promise<HeadlessTaskJob | null> {
  const client = getRedisClient();
  if (!client) return null;
  await connectQueue();

  const result = await client.brpop(QUEUE_KEY, timeoutSeconds);
  if (!result) return null;

  const [, payload] = result;
  return JSON.parse(payload) as HeadlessTaskJob;
}

export async function getQueueDepth(): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;
  await connectQueue();
  return client.llen(QUEUE_KEY);
}

export async function disconnectQueue(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
