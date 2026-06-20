export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
}

interface RateWindow {
  count: number;
  resetAt: number;
}

export class McpRateLimiter {
  private readonly windows = new Map<string, RateWindow>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();

    for (const [k, w] of this.windows) {
      if (now >= w.resetAt) this.windows.delete(k);
    }

    let entry = this.windows.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.windows.set(key, entry);
    }

    entry.count += 1;
    return {
      limited: entry.count > this.max,
      remaining: Math.max(0, this.max - entry.count),
      resetAt: entry.resetAt,
    };
  }
}

export function rateLimitKey(authKey: string, ip: string): string {
  return `${authKey}:${ip}`;
}
