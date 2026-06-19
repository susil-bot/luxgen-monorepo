import { Request, Response, NextFunction } from 'express';

interface RateWindow {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateWindow>();

const DEFAULT_MAX = Number(process.env.LOGIN_RATE_LIMIT_MAX || 10);
const DEFAULT_WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);

function clientKey(req: Request, email?: string): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const normalizedEmail = email?.toLowerCase().trim() || 'unknown';
  return `${ip}:${normalizedEmail}`;
}

function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;
  return entry.count > max;
}

export function checkLoginRateLimit(req: Request, email?: string): void {
  const key = clientKey(req, email);
  if (isRateLimited(key, DEFAULT_MAX, DEFAULT_WINDOW_MS)) {
    const err = new Error('Too many login attempts. Please try again later.') as Error & { statusCode?: number };
    err.statusCode = 429;
    throw err;
  }
}

/** Express middleware for POST /api/auth/login */
export function loginRateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    checkLoginRateLimit(req, req.body?.email);
    next();
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode || 429;
    res.status(status).json({
      success: false,
      message: error instanceof Error ? error.message : 'Too many login attempts',
    });
  }
}

/** Test helper */
export function resetLoginRateLimitStore(): void {
  store.clear();
}
