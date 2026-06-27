# File Analysis: apps/api/src/middleware/loginRateLimit.ts

## File Path and Purpose

**Path:** `apps/api/src/middleware/loginRateLimit.ts`

This file implements a dual-backend rate limiter specifically for the login endpoint, using Redis as the primary counter store and a module-level in-process `Map` as a fallback when Redis is unavailable. It keys each rate window by the combination of IP address and email, meaning both the IP and the email must be rate-limited independently (a single key covers both dimensions).

---

## Full Annotated Code

```typescript
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../lib/redis';

interface RateWindow {
  count: number;
  resetAt: number; // absolute epoch ms when this window expires
}

// In-memory fallback used only when Redis is unavailable.
// Module-level Map persists across requests in the same Node process.
// In multi-process deployments each process has an independent map,
// meaning rate limits are not shared across pods/workers — a known limitation.
const fallbackStore = new Map<string, RateWindow>();

// Evict expired entries to prevent unbounded memory growth.
// Called before every in-memory read — O(n) over the store size.
// For a login endpoint this is acceptable: store size is bounded by the
// number of unique (IP, email) pairs seen within one window (usually small).
function evictExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of fallbackStore) {
    if (now >= entry.resetAt) fallbackStore.delete(key);
  }
}

// Configurable limits via environment variables.
// Development default is 1000 (effectively unlimited) so local testing
// doesn't constantly hit rate limits.
const DEFAULT_MAX = Number(
  process.env.LOGIN_RATE_LIMIT_MAX ||
  (process.env.NODE_ENV === 'development' ? 1000 : 10)
);
const DEFAULT_WINDOW_MS = Number(
  process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000 // 15 minutes
);

// Key includes both IP and email. This means:
// - Same IP, different emails → different keys (email enumeration harder)
// - Same email, different IPs → different keys (distributed attacks allowed, see note)
// - A botnet using 1000 IPs targeting 1 email → 1000 independent counters → not blocked
function clientKey(req: Request, email?: string): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  // req.ip is Express's resolved client IP (respects trust proxy setting).
  // req.socket.remoteAddress is the raw TCP connection IP (fallback).
  // If neither is available → 'unknown', which means all unknown-IP clients
  // share one rate limit bucket. This is a safe degradation, not a bug.

  const normalizedEmail = email?.toLowerCase().trim() || 'unknown';
  // Normalize email to prevent "User@example.com" and "user@example.com"
  // from getting separate counters. .toLowerCase() handles case.
  // 'unknown' fallback groups all requests without an email body field.

  return `login:${ip}:${normalizedEmail}`;
}

async function isRateLimited(key: string, max: number, windowMs: number): Promise<boolean> {
  const redis = getRedisClient();

  if (redis && redis.status === 'ready') {
    try {
      const redisKey = `luxgen:${key}`;
      const count = await redis.incr(redisKey);
      // INCR is atomic in Redis — no race condition between read and increment.
      // Returns the new value after increment.

      if (count === 1) await redis.pexpire(redisKey, windowMs);
      // Set expiry ONLY on the first increment (count === 1).
      // RACE CONDITION: Between incr() returning 1 and pexpire() completing,
      // a Redis crash or network failure could leave the key without an expiry
      // → it would stay in Redis forever and block that IP:email pair permanently.
      // FIX: Use a Lua script or SET key value EX seconds NX (single atomic op).

      return count > max; // true = rate limited
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
  // In-process increment is synchronous, so no race conditions.
  // But two Node worker processes could both allow the (max+1)th request
  // before either has persisted the count to a shared store.
}

export async function checkLoginRateLimit(req: Request, email?: string): Promise<void> {
  // Exported so non-Express callers (e.g., GraphQL resolvers) can call it directly.
  const key = clientKey(req, email);
  const limited = await isRateLimited(key, DEFAULT_MAX, DEFAULT_WINDOW_MS);
  if (limited) {
    const err = new Error('Too many login attempts. Please try again later.') as Error & { statusCode?: number };
    err.statusCode = 429;
    throw err;
    // Attaches statusCode to the Error object — a common Express pattern for
    // error-handling middleware that reads error.statusCode.
  }
}

/** Express middleware for POST /api/auth/login */
export async function loginRateLimitMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await checkLoginRateLimit(req, req.body?.email);
    // req.body?.email reads the login form email. Optional chaining guards
    // against missing body (e.g., malformed requests without JSON body).
    next();
  } catch (error) {
    if (!res.headersSent) {
      // Guard against double-write in case next() was called and a downstream
      // handler already sent headers.
      const status = (error as { statusCode?: number }).statusCode || 429;
      res.status(status).json({
        success: false,
        message: error instanceof Error ? error.message : 'Too many login attempts',
      });
    }
  }
}

/** Test helper — resets the in-memory fallback store between tests */
export function resetLoginRateLimitStore(): void {
  fallbackStore.clear();
}
// Good: test hook is explicitly exported and named clearly.
// The Redis store can be reset by flushing Redis in tests (FLUSHDB).
```

---

## Exported Functions

| Name | Inputs | Outputs | Complexity | Side Effects | Pure? |
|---|---|---|---|---|---|
| `checkLoginRateLimit` | `req: Request, email?: string` | `Promise<void>` (throws on limit) | O(1) Redis incr / O(n) in-memory eviction | Redis INCR, in-memory Map write | Impure |
| `loginRateLimitMiddleware` | `req, res, next` | `Promise<void>` | O(1) + network | Redis I/O, HTTP response | Impure |
| `resetLoginRateLimitStore` | none | `void` | O(n) | Clears module-level Map | Impure (test helper) |

---

## Design Patterns Used

**Circuit Breaker (partial):** Redis failure falls back to the in-memory store. This is resilience-by-fallback rather than true circuit breaking (no half-open state, no retry), but it achieves the same practical outcome for a rate limiter: the service stays up even when Redis is unavailable.

**Dual-key Rate Limiting (IP + email):** Combines two dimensions in one key. This is a nuanced tradeoff: it limits per-pair rather than per-IP or per-email independently.

**Separation of Concerns:** `checkLoginRateLimit` (business logic, throws) is separate from `loginRateLimitMiddleware` (HTTP adapter, catches). This means non-Express callers (GraphQL resolvers, Lambda handlers) can use `checkLoginRateLimit` directly.

**Test Hook Pattern:** `resetLoginRateLimitStore` is exported purely for test isolation. This is preferable to exposing the `fallbackStore` Map directly.

---

## Security Considerations

**What works well:**
- Email normalization prevents case-bypass attacks (`User@co.com` ≠ `user@co.com` without `.toLowerCase()`)
- 10 attempts per 15 minutes on production is a reasonable brute-force deterrent
- Redis INCR is atomic — no TOCTOU (time-of-check, time-of-use) race condition
- Development override (1000 attempts) via `NODE_ENV` prevents false positives in local testing

**Known weaknesses:**

1. **Race condition between `INCR` and `PEXPIRE`:** If the server crashes or Redis disconnects between these two calls, the key has no TTL and permanently blocks that IP:email pair. Fix with a Lua script:
   ```lua
   local count = redis.call('INCR', KEYS[1])
   if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
   return count
   ```

2. **Distributed attack bypass:** Keying by `IP:email` means an attacker with 11 different IPs can make 10 attempts each against one email — 110 total attempts against one account — without hitting any single rate limit. Fix: add a separate per-email limit with a higher max and longer window.

3. **No `Retry-After` header:** RFC 6585 specifies 429 responses should include a `Retry-After` header. Without it, well-behaved clients don't know when to retry, and automated retry storms are likely.
   ```typescript
   res.set('Retry-After', String(Math.ceil(DEFAULT_WINDOW_MS / 1000)));
   ```

4. **`req.body?.email` is read before body parsing completes:** If `loginRateLimitMiddleware` is placed before the JSON body parser in the Express stack, `req.body` will be `undefined`. The rate limit key falls back to `login:${ip}:unknown`, grouping all bodyless requests into one bucket.

5. **In-memory fallback is eviction-on-read, not time-based:** Expired entries only get cleaned up on the next read of any key. A burst of unique IPs never seen again fills the map permanently until the next eviction scan. For production, set a `maxSize` on the Map or use a true LRU.

---

## Performance Considerations

- **Redis `INCR` + conditional `PEXPIRE`:** Two round trips when count is 1. The Lua-based atomic approach (above) reduces this to one round trip always. At 10k login attempts/s this is a meaningful difference.
- **`evictExpiredEntries()` is O(n) over all in-memory keys:** Called on every in-memory path. For a login endpoint this is usually fine (small n), but during Redis outages under load the store could grow large. An LRU-Map with max capacity (e.g., 10,000 entries) would cap both memory and scan cost.
- **`redis.status === 'ready'` check before every call:** This is a simple string comparison — negligible overhead, but consider a cached boolean flag updated by ioredis events for cleanliness.

---

## 10 Interview Questions

1. Explain the TOCTOU race condition between `INCR` and `PEXPIRE`. How does it manifest in production and how do you fix it?
2. Why doesn't this rate limiter use Express's popular `express-rate-limit` package? What does the custom implementation gain?
3. If we have 4 Node processes behind a load balancer and Redis is down, what is the effective rate limit per user?
4. What does `req.ip` return when your Express app is behind an AWS Application Load Balancer? What setting makes it correct?
5. A user legitimately fails 10 login attempts and resets their password. They now try to log in with the correct password but still hit the rate limit. Why? How do you fix the UX?
6. Why is the key `login:${ip}:${normalizedEmail}` rather than two separate keys `login:ip:${ip}` and `login:email:${email}`?
7. What is the `Retry-After` HTTP header? Why should a 429 response include it? What unit should the value be in?
8. What happens if the login endpoint is called with `Content-Type: application/x-www-form-urlencoded` instead of JSON? Does `req.body?.email` still work?
9. Describe a scenario where `resetLoginRateLimitStore()` in tests is necessary. What kind of test isolation problem does it solve?
10. How would you extend this limiter to enforce a per-tenant limit (e.g., a tenant's enterprise plan allows 100 attempts, free plan allows 5)?

---

## What Would You Change? — 3 Concrete Improvements

**1. Atomic Redis incr + expire via Lua (fixes race condition):**
```typescript
const RATE_LIMIT_LUA = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then redis.call('PEXPIRE', KEYS[1], tonumber(ARGV[1])) end
  return count
`;

const count = await redis.eval(RATE_LIMIT_LUA, 1, redisKey, windowMs);
```

**2. Add per-email limiting in parallel with per-IP:email:**
```typescript
async function isRateLimited(req: Request, email: string): Promise<boolean> {
  const ipEmailKey = clientKey(req, email);
  const emailOnlyKey = `login:email:${email.toLowerCase().trim()}`;
  const [ipEmailLimited, emailLimited] = await Promise.all([
    checkKey(ipEmailKey, DEFAULT_MAX, DEFAULT_WINDOW_MS),
    checkKey(emailOnlyKey, DEFAULT_MAX * 5, DEFAULT_WINDOW_MS * 4), // 50 attempts / 1hr per email
  ]);
  return ipEmailLimited || emailLimited;
}
```

**3. Return `Retry-After` and `X-RateLimit-*` headers:**
```typescript
const remaining = Math.max(0, max - count);
const resetInSeconds = Math.ceil(DEFAULT_WINDOW_MS / 1000);
res.set('X-RateLimit-Limit', String(max));
res.set('X-RateLimit-Remaining', String(remaining));
res.set('X-RateLimit-Reset', String(Math.floor((Date.now() + DEFAULT_WINDOW_MS) / 1000)));
res.set('Retry-After', String(resetInSeconds));
```

---

## Related Concepts to Review

- Redis atomic commands: `INCR`, `PEXPIRE`, `SETNX`, `SET EX NX`, `EVAL` (Lua)
- Sliding window vs fixed window vs token bucket rate limiting algorithms
- Express trust proxy setting and `req.ip` behavior behind reverse proxies
- Distributed rate limiting at scale (Redis cluster, Lua scripts, token bucket via Sorted Sets)
- TOCTOU (time-of-check, time-of-use) race conditions
- LRU cache eviction strategies
- RFC 6585 (Additional HTTP Status Codes) — 429 specification
