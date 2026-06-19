import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../lib/redis';

interface RateWindow {
  count: number;
  resetAt: number;
}

// In-memory fallback used only when Redis is unavailable
const fallbackStore = new Map<string, RateWindow>();

// Evict expired entries to prevent unbounded memory growth (runs per request)
function evictExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of fallbackStore) {
    if (now >= entry.resetAt) fallbackStore.delete(key);
  }
}

const DEFAULT_MAX = Number(process.env.LOGIN_RATE_LIMIT_MAX || 10);
const DEFAULT_WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);

function clientKey(req: Request, email?: string): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const normalizedEmail = email?.toLowerCase().trim() || 'unknown';
  return `login:${ip}:${normalizedEmail}`;
}

async function isRateLimited(key: string, max: number, windowMs: number): Promise<boolean> {
  const redis = getRedisClient();

  if (redis && redis.status === 'ready') {
    try {
      const redisKey = `luxgen:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) await redis.pexpire(redisKey, windowMs);
      return count > max;
    } catch {
      // Redis error — fall through to in-memory
    }
  }

  // In-memory fallback (single-process only)
  evictExpiredEntries();
  const now = Date.now();
  let entry = fallbackStore.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    fallbackStore.set(key, entry);
  }
  entry.count += 1;
  return entry.count > max;
}

export async function checkLoginRateLimit(req: Request, email?: string): Promise<void> {
  const key = clientKey(req, email);
  const limited = await isRateLimited(key, DEFAULT_MAX, DEFAULT_WINDOW_MS);
  if (limited) {
    const err = new Error('Too many login attempts. Please try again later.') as Error & { statusCode?: number };
    err.statusCode = 429;
    throw err;
  }
}

/** Express middleware for POST /api/auth/login */
export async function loginRateLimitMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await checkLoginRateLimit(req, req.body?.email);
    next();
  } catch (error) {
    if (!res.headersSent) {
      const status = (error as { statusCode?: number }).statusCode || 429;
      res.status(status).json({
        success: false,
        message: error instanceof Error ? error.message : 'Too many login attempts',
      });
    }
  }
}

/** Test helper */
export function resetLoginRateLimitStore(): void {
  fallbackStore.clear();
}
