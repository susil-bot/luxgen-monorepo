import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import type { HeadlessTaskJob } from '../types/task';

const QUEUE_KEY = 'luxgen:agent:tasks';
const TENANT_STREAM_KEY_PREFIX = 'luxgen:agent:streams:tenant:';
const USER_MESSAGE_KEY_PREFIX = 'luxgen:agent:messages:user:';
const PROCESSING_KEY = 'luxgen:agent:tasks:processing';
const DEAD_KEY = 'luxgen:agent:tasks:dead';

export const MAX_CONCURRENT_STREAMS_PER_TENANT = 3;
export const MAX_AGENT_MESSAGES_PER_MINUTE = 20;
const MESSAGE_RATE_WINDOW_MS = 60_000;
/** Safety TTL if releaseTenantStreamSlot is never called (e.g. crash). */
const STREAM_SLOT_TTL_SECONDS = 7_200;

/** BullMQ default — re-check in-flight jobs after worker crash. */
const DEFAULT_STALLED_INTERVAL_MS = 30_000;
/** BullMQ default — max times a job may be reclaimed before dead-letter. */
const DEFAULT_MAX_STALLED_COUNT = 1;

interface ProcessingEntry {
  job: HeadlessTaskJob;
  leasedAt: number;
  stallCount: number;
}

let redis: Redis | null = null;
let stalledRecoveryTimer: ReturnType<typeof setInterval> | null = null;

/** In-memory fallback when Redis is unavailable (single-process only). */
const fallbackStreamCounts = new Map<string, number>();
const fallbackMessageWindows = new Map<string, { count: number; resetAt: number }>();

export function getRedisUrl(): string | undefined {
  return process.env.AGENT_REDIS_URL || process.env.REDIS_URL;
}

export function isQueueEnabled(): boolean {
  return Boolean(getRedisUrl()) && process.env.AGENT_QUEUE_ENABLED !== 'false';
}

export function getStalledIntervalMs(): number {
  const raw = process.env.AGENT_QUEUE_STALLED_INTERVAL_MS;
  const parsed = raw ? Number(raw) : DEFAULT_STALLED_INTERVAL_MS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_STALLED_INTERVAL_MS;
}

export function getMaxStalledCount(): number {
  const raw = process.env.AGENT_QUEUE_MAX_STALLED_COUNT;
  const parsed = raw ? Number(raw) : DEFAULT_MAX_STALLED_COUNT;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_MAX_STALLED_COUNT;
}

export function getRedisClient(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;
  if (!redis) {
    redis = new Redis(url, {
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

export async function acquireTenantStreamSlot(
  tenantId: string,
  max = MAX_CONCURRENT_STREAMS_PER_TENANT,
): Promise<boolean> {
  const client = getRedisClient();
  if (client) {
    try {
      await connectQueue();
      const key = `${TENANT_STREAM_KEY_PREFIX}${tenantId}`;
      const count = await client.incr(key);
      if (count === 1) await client.expire(key, STREAM_SLOT_TTL_SECONDS);
      if (count > max) {
        await client.decr(key);
        return false;
      }
      return true;
    } catch {
      // fall through to in-memory
    }
  }

  const current = fallbackStreamCounts.get(tenantId) ?? 0;
  if (current >= max) return false;
  fallbackStreamCounts.set(tenantId, current + 1);
  return true;
}

export async function releaseTenantStreamSlot(tenantId: string): Promise<void> {
  const client = getRedisClient();
  if (client) {
    try {
      await connectQueue();
      const key = `${TENANT_STREAM_KEY_PREFIX}${tenantId}`;
      const count = await client.decr(key);
      if (count <= 0) await client.del(key);
      return;
    } catch {
      // fall through to in-memory
    }
  }

  const current = fallbackStreamCounts.get(tenantId) ?? 0;
  if (current <= 1) {
    fallbackStreamCounts.delete(tenantId);
  } else {
    fallbackStreamCounts.set(tenantId, current - 1);
  }
}

export async function isAgentMessageRateLimited(
  userId: string,
  max = MAX_AGENT_MESSAGES_PER_MINUTE,
  windowMs = MESSAGE_RATE_WINDOW_MS,
): Promise<boolean> {
  const client = getRedisClient();
  if (client) {
    try {
      await connectQueue();
      const key = `${USER_MESSAGE_KEY_PREFIX}${userId}`;
      const count = await client.incr(key);
      if (count === 1) await client.pexpire(key, windowMs);
      return count > max;
    } catch {
      // fall through to in-memory
    }
  }

  const now = Date.now();
  let entry = fallbackMessageWindows.get(userId);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    fallbackMessageWindows.set(userId, entry);
  }
  entry.count += 1;
  return entry.count > max;
}

/** Test helper — clears in-memory rate-limit state. */
export function resetAgentRateLimitFallback(): void {
  fallbackStreamCounts.clear();
  fallbackMessageWindows.clear();
}

export async function enqueueHeadlessTask(
  job: Omit<HeadlessTaskJob, 'id' | 'enqueuedAt'>,
): Promise<HeadlessTaskJob | null> {
  if (!isQueueEnabled()) return null;
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
  if (!isQueueEnabled()) return null;
  const client = getRedisClient();
  if (!client) return null;
  await connectQueue();

  const result = await client.brpop(QUEUE_KEY, timeoutSeconds);
  if (!result) return null;

  const [, payload] = result;
  const job = JSON.parse(payload) as HeadlessTaskJob;

  const entry: ProcessingEntry = {
    job,
    leasedAt: Date.now(),
    stallCount: job.stallCount ?? 0,
  };
  await client.hset(PROCESSING_KEY, job.id, JSON.stringify(entry));

  return job;
}

export async function acknowledgeHeadlessTask(jobId: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  await connectQueue();
  await client.hdel(PROCESSING_KEY, jobId);
}

/** Re-enqueue jobs left in processing after a worker crash (BullMQ stalled-job semantics). */
export async function recoverStalledJobs(): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;
  await connectQueue();

  const stalledIntervalMs = getStalledIntervalMs();
  const maxStalledCount = getMaxStalledCount();
  const now = Date.now();
  const entries = await client.hgetall(PROCESSING_KEY);
  let recovered = 0;

  for (const [jobId, raw] of Object.entries(entries)) {
    const entry = JSON.parse(raw) as ProcessingEntry;
    if (now - entry.leasedAt < stalledIntervalMs) continue;

    await client.hdel(PROCESSING_KEY, jobId);

    if (entry.stallCount >= maxStalledCount) {
      await client.lpush(DEAD_KEY, JSON.stringify(entry.job));
      console.warn(`[agent-queue] Job ${jobId} exceeded maxStalledCount (${maxStalledCount}); moved to dead letter`);
      continue;
    }

    const nextStallCount = entry.stallCount + 1;
    const requeuedJob: HeadlessTaskJob = { ...entry.job, stallCount: nextStallCount };
    await client.lpush(QUEUE_KEY, JSON.stringify(requeuedJob));
    recovered += 1;
    console.warn(`[agent-queue] Re-enqueued stalled job ${jobId} (stall ${nextStallCount}/${maxStalledCount})`);
  }

  return recovered;
}

export function startStalledJobRecovery(): void {
  if (stalledRecoveryTimer) return;
  const intervalMs = getStalledIntervalMs();
  stalledRecoveryTimer = setInterval(() => {
    recoverStalledJobs().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[agent-queue] Stalled job recovery failed:', message);
    });
  }, intervalMs);
  stalledRecoveryTimer.unref?.();
}

export function stopStalledJobRecovery(): void {
  if (stalledRecoveryTimer) {
    clearInterval(stalledRecoveryTimer);
    stalledRecoveryTimer = null;
  }
}

export async function getQueueDepth(): Promise<number> {
  if (!isQueueEnabled()) return 0;
  const client = getRedisClient();
  if (!client) return 0;
  await connectQueue();
  return client.llen(QUEUE_KEY);
}

export async function disconnectQueue(): Promise<void> {
  stopStalledJobRecovery();
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
