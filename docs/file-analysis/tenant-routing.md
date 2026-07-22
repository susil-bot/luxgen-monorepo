# File Analysis: apps/api/src/middleware/tenantRouting.ts

## File Path and Purpose

**Path:** `apps/api/src/middleware/tenantRouting.ts`

This file implements the full multi-tenant request resolution pipeline for the Express API. Given an incoming hostname, it resolves which tenant owns the request (via subdomain, custom domain, or `x-tenant` header), caches the tenant document in Redis and in-process memory, enforces per-tenant CORS and domain security policies, and attaches tenant context to `req` for every downstream handler.

---

## Full Annotated Code

```typescript
import { Request, Response, NextFunction } from 'express';
import { isDevLocalOrigin } from '@luxgen/config';
// Helper that returns true for localhost/127.0.0.1/::1 — allows devs to
// bypass per-tenant CORS policies locally without touching production config.

import { Tenant, ITenant, resolveEffectivePlan } from '@luxgen/db';
// Tenant: Mongoose model. ITenant: TypeScript document interface.
// resolveEffectivePlan: queries TenantSubscription → returns PlanTier string.

import { verifyToken, getTenantFromToken } from '../utils/jwt';
// Used by tenantAuthMiddleware to cross-check token's kid (tenant key ID)
// against req.tenantId populated by the routing middleware.

import { renderTenantNotFound } from '../utils/tenantNotFound';
// Returns an HTML string for 404 pages when no tenant can be resolved.

import { getRedisClient } from '../lib/redis';
// Returns the shared ioredis client. May be undefined or not-ready,
// in which case the code falls back gracefully.

// ─── Exported context shape ───────────────────────────────────────────────────

export interface TenantContext {
  tenant: ITenant;
  tenantId: string;
  subdomain: string;
  isCustomDomain: boolean;
}

// ─── Subdomain / Domain extraction ───────────────────────────────────────────

export const extractSubdomain = (hostname: string): string | null => {
  const cleanHostname = hostname.split(':')[0];
  // Strip the port number — "acme.localhost:3001" → "acme.localhost"

  const parts = cleanHostname.split('.');

  if (cleanHostname.includes('localhost') || cleanHostname.includes('127.0.0.1')) {
    // Dev environment: "acme.localhost" → parts = ["acme","localhost"] → len 2
    // parts[0] !== 'www' prevents treating www.localhost as tenant "www"
    if (parts.length >= 2 && parts[0] !== 'www') return parts[0];
    return null;
  }

  // Production: "acme.luxgen.app" → parts = ["acme","luxgen","app"] → len 3
  return parts.length >= 3 ? parts[0] : null;
  // Bare "luxgen.app" (2 parts) returns null — treated as platform-level request.
};

export const extractCustomDomain = (hostname: string): string | null => {
  const cleanHostname = hostname.split(':')[0];
  if (
    cleanHostname.includes('localhost') ||
    cleanHostname.includes('127.0.0.1') ||
    cleanHostname.includes('.vercel.app') ||  // Preview deploy — not a real custom domain
    cleanHostname.includes('.netlify.app')    // Same reasoning
  ) {
    return null;
  }
  return cleanHostname;
  // Returns the full hostname if it doesn't look like a platform/dev origin.
  // The caller then does Tenant.findOne({ domain: hostname }).
};

// ─── Public path bypass ───────────────────────────────────────────────────────

const BYPASS_PATHS = new Set(['/health', '/api/health', '/api/status', '/graphql']);
// Set gives O(1) has() vs array .includes() O(n). Good choice.
// Note: /graphql is bypassed — the GraphQL layer does its own tenant resolution
// in buildContext.ts when req.tenant is absent.

const isPublicPath = (path: string) =>
  BYPASS_PATHS.has(path) || path.startsWith('/api/tenant-config/');
// tenant-config endpoint returns public branding info before the user logs in,
// so it can't require tenant resolution to already be complete.

// ─── Two-tier tenant cache ────────────────────────────────────────────────────

const TENANT_CACHE_TTL_MS = 30_000; // 30 seconds
interface CachedTenant {
  tenant: ITenant;
  tenantId: string;
  fetchedAt: number;
}
const tenantCache = new Map<string, CachedTenant>();
// Module-level Map = in-process L2 cache. Survives across requests in the same
// Node process. Fine for single-server or sticky-session setups.
// In a multi-process deployment behind PM2 or Kubernetes, each pod has its own
// map — Redis (below) is the cross-process source of truth.

async function lookupTenant(subdomain: string): Promise<{ tenant: ITenant; tenantId: string } | null> {
  const redis = getRedisClient();

  // Layer 1: Redis (cross-process, 30s TTL)
  if (redis && redis.status === 'ready') {
    try {
      const raw = await redis.get(`luxgen:tenant:${subdomain}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { tenant: ITenant; tenantId: string };
        return parsed;
        // IMPORTANT: The returned tenant is a plain object, NOT a Mongoose
        // document (no .save(), no virtuals). Code downstream must use it
        // as read-only data, which it does — tenant is only read, never mutated.
      }
    } catch {
      // Redis unavailable or parse error — fall through silently.
      // Resilience > correctness for caching reads.
    }
  }

  // Layer 2: In-process Map (single-process, 30s TTL)
  const cached = tenantCache.get(subdomain);
  if (cached && Date.now() - cached.fetchedAt < TENANT_CACHE_TTL_MS) {
    return { tenant: cached.tenant, tenantId: cached.tenantId };
  }

  // Layer 3: MongoDB (authoritative)
  const tenant = (await Tenant.findOne({ subdomain, status: 'active' }).lean()) as ITenant | null;
  // .lean() returns a POJO — faster than a full Mongoose doc because no
  // prototype chain, no change tracking, no virtuals. Correct here since
  // we never mutate this object.
  if (!tenant) return null;

  const tenantId = (tenant._id as any).toString();
  // The `as any` cast is necessary because .lean() loses TypeScript knowledge
  // of _id's type. A typed assertion like `(tenant._id as mongoose.Types.ObjectId)`
  // would be cleaner.

  // Populate both caches on miss
  tenantCache.set(subdomain, { tenant, tenantId, fetchedAt: Date.now() });
  if (redis && redis.status === 'ready') {
    try {
      await redis.setex(`luxgen:tenant:${subdomain}`, 30, JSON.stringify({ tenant, tenantId }));
      // setex = SET with EXpiry in seconds. TTL = 30 (seconds), matching TENANT_CACHE_TTL_MS.
    } catch {
      // Non-fatal: in-process cache already populated, serve from there.
    }
  }

  return { tenant, tenantId };
}

// ─── lastActive debouncing ────────────────────────────────────────────────────

const lastActiveWritten = new Map<string, number>();
const LAST_ACTIVE_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes

function updateLastActiveDebounced(tenantId: string): void {
  const last = lastActiveWritten.get(tenantId);
  if (last && Date.now() - last < LAST_ACTIVE_DEBOUNCE_MS) return;
  // Skip: we wrote within the last 5 minutes for this tenant.

  lastActiveWritten.set(tenantId, Date.now());
  // Fire-and-forget: intentionally no await.
  // If the write fails, we lose a lastActive update — acceptable data loss.
  Tenant.findByIdAndUpdate(tenantId, { 'metadata.lastActive': new Date() }).catch(() => {});
}
// Without this debouncing, a busy tenant at 1000 req/s would generate 1000 DB
// writes per second to the same document. With 5-min debounce: at most 1 write
// per 5 minutes per tenant — a 300,000x reduction.

// ─── Main routing middleware ──────────────────────────────────────────────────

export const tenantRoutingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hostname = req.get('host') || req.hostname;
    // req.get('host') reads the Host header.
    // req.hostname is Express's parsed version (strips port, handles X-Forwarded-Host
    // if trust proxy is set). Using req.get('host') first preserves the raw value
    // which is needed for port-stripping in extractSubdomain.

    const subdomain = extractSubdomain(hostname);
    const customDomain = extractCustomDomain(hostname);

    let tenant: ITenant | null = null;
    let tenantId: string | undefined;
    let isCustomDomain = false;

    // Resolution priority: subdomain > custom domain > x-tenant header
    if (subdomain) {
      const result = await lookupTenant(subdomain);
      if (result) {
        tenant = result.tenant;
        tenantId = result.tenantId;
        req.subdomain = subdomain;
      }
    }

    if (!tenant && customDomain) {
      // Custom domain lookup NOT cached through lookupTenant (no Redis/in-memory layer).
      // This is a potential performance gap — a custom domain hit causes a DB round-trip
      // on every request.
      const byDomain = (await Tenant.findOne({ domain: customDomain, status: 'active' }).lean()) as ITenant | null;
      if (byDomain) {
        tenant = byDomain;
        tenantId = (byDomain._id as any).toString();
        isCustomDomain = true;
        req.isCustomDomain = true;
      }
    }

    if (!tenant) {
      // Escape hatch: API-to-API calls or test clients that can't set a subdomain
      // send x-tenant: <subdomain> header.
      const headerTenant = req.get('x-tenant')?.trim().toLowerCase();
      if (headerTenant) {
        const result = await lookupTenant(headerTenant);
        if (result) {
          tenant = result.tenant;
          tenantId = result.tenantId;
          req.subdomain = headerTenant;
        }
      }
    }

    if (!tenant) {
      // No tenant resolved — decide how to respond based on path.
      if (isPublicPath(req.path)) return next();   // Health checks always pass through
      if (req.path.startsWith('/api/auth/')) return next(); // Auth routes handle own scoping
      if (req.path === '/' || !req.path.startsWith('/api/')) {
        return res.status(404).send(renderTenantNotFound(subdomain ?? '')); // HTML 404
      }
      return res.status(404).json({ success: false, message: 'Tenant not found' }); // JSON 404
    }

    updateLastActiveDebounced(tenantId!);
    // Non-null assertion (!) is safe here: if tenant is non-null, tenantId was set.

    req.tenant = tenant;
    req.tenantId = tenantId;
    req.subdomain = subdomain || '';
    req.isCustomDomain = isCustomDomain;

    // Expose tenant identity in response headers — useful for CDN routing and
    // client-side debugging without parsing the JWT.
    res.set('X-Tenant-ID', tenantId!);
    res.set('X-Tenant-Name', tenant.name);
    res.set('X-Tenant-Subdomain', tenant.subdomain);

    const effectivePlan = await resolveEffectivePlan(tenant.subdomain);
    // PERFORMANCE NOTE: This calls TenantSubscription.findOne on every request.
    // It should be cached. The plan rarely changes mid-request-stream.
    res.set('X-Tenant-Plan', effectivePlan);

    next();
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error', error: 'Failed to resolve tenant' });
  }
};

// ─── Token/tenant cross-check middleware ─────────────────────────────────────

export const tenantAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Verifies that the JWT in Authorization was issued for THIS tenant.
  // Prevents token reuse across tenants (a serious multi-tenancy vulnerability).
  try {
    if (!req.tenant || !req.tenantId) return next();
    // If no tenant was resolved yet, skip — other middleware will handle it.

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return next(); // Anonymous request — fine.

    const decoded = verifyToken(token);
    const tokenTenantId = getTenantFromToken(token);
    // getTenantFromToken extracts the `kid` from the JWT header (unverified read).
    // verifyToken uses the same kid to select the signing key and verify the signature.

    if (!decoded || !tokenTenantId) return next();
    // If the token can't be decoded, authMiddleware will have already set authError.
    // This middleware is additive, not a replacement for auth.ts.

    if (tokenTenantId !== req.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Token tenant mismatch',
        error: 'User token does not belong to current tenant',
      });
      // Hard 403 at HTTP level — unlike auth.ts which is permissive, this one
      // actively rejects cross-tenant token reuse. This is the right call because
      // cross-tenant token use indicates either a bug or an attack.
    }
    next();
  } catch {
    next(); // Errors in cross-check don't block the request — authMiddleware handles that.
  }
};

// ─── Per-tenant CORS / domain security middleware ────────────────────────────

export const tenantSecurityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) return next();

    const { security } = req.tenant.settings;
    const origin = req.get('origin');

    // Per-tenant CORS origin check
    if (
      origin &&
      security.corsOrigins.length > 0 &&
      !security.corsOrigins.includes(origin) &&
      !isDevLocalOrigin(origin)
    ) {
      return res.status(403).json({ success: false, message: 'CORS policy violation', error: 'Origin not allowed for this tenant' });
      // NOTE: This is not real CORS handling — it doesn't set CORS headers.
      // Real CORS is handled upstream (probably the cors() middleware).
      // This is an application-level origin deny list applied after tenant resolution.
    }

    // Per-tenant allowed domains check
    const hostname = req.get('host') || req.hostname;
    if (security.allowedDomains.length > 0 && !security.allowedDomains.some((d: string) => hostname.includes(d))) {
      return res.status(403).json({ success: false, message: 'Domain not allowed', error: 'Request domain not in allowed domains list' });
      // hostname.includes(d) is a substring match. This means a tenant with
      // allowedDomains: ['example.com'] would also allow 'evil-example.com'.
      // Should be an exact match or suffix match (hostname.endsWith(d)).
    }

    next();
  } catch {
    next(); // Errors in security middleware pass through — prefer availability over lockout.
  }
};

// ─── Context extractor (used by buildContext.ts) ──────────────────────────────

export const getTenantContext = (req: Request): TenantContext | null => {
  if (!req.tenant || !req.tenantId) return null;
  return {
    tenant: req.tenant,
    tenantId: req.tenantId,
    subdomain: req.subdomain || '',
    isCustomDomain: req.isCustomDomain || false,
  };
};
// Pure function (in practice) — reads req properties set by prior middleware.
// Returns a typed subset, hiding the full req from consumers.
```

---

## Exported Functions

| Name | Inputs | Outputs | Complexity | Side Effects | Pure? |
|---|---|---|---|---|---|
| `extractSubdomain` | `hostname: string` | `string \| null` | O(n) where n = hostname length | None | Pure |
| `extractCustomDomain` | `hostname: string` | `string \| null` | O(n) | None | Pure |
| `tenantRoutingMiddleware` | `req, res, next` | `void` | O(1) + network I/O | DB read, Redis read/write, `req` mutation, `res` header set | Impure |
| `tenantAuthMiddleware` | `req, res, next` | `void` | O(1) + JWT decode | None (reads only, may 403) | Impure |
| `tenantSecurityMiddleware` | `req, res, next` | `void` | O(m) where m = domains/origins array length | None (reads only, may 403) | Impure |
| `getTenantContext` | `req: Request` | `TenantContext \| null` | O(1) | None | Effectively pure |

---

## Design Patterns Used

**Multi-layer Cache (L1/L2/L3):** Redis → in-process Map → MongoDB. This is the standard cache-aside (lazy population) pattern. Each layer is cheaper than the next; fallback is always available.

**Debouncer / Write Coalescing:** `updateLastActiveDebounced` is a manual debounce that coalesces frequent writes into at-most-one-per-5-minutes. This prevents "hot tenant" write amplification on MongoDB.

**Strategy Pattern (implicit):** The three tenant resolution strategies (subdomain, custom domain, x-tenant header) are tried sequentially. Each is independent and could be extracted into a strategy object for cleaner testing.

**Fail-Open Caching:** Redis and in-process cache failures are swallowed and fall through to the DB. This is intentional: cache unavailability must not cause a service outage.

---

## Security Considerations

**Well-handled:**
- Cross-tenant token reuse blocked in `tenantAuthMiddleware` with a hard 403
- `status: 'active'` filter on all DB queries — suspended tenants can't be resolved
- Public paths (health, graphql) bypass tenant resolution to prevent bootstrapping deadlocks

**Gaps:**
1. **Custom domain not cached:** Every custom-domain request hits MongoDB directly. Beyond performance, this is a DoS surface — an attacker rotating custom domain hostnames can generate unlimited DB queries.
2. **`hostname.includes(d)` substring match in `tenantSecurityMiddleware`:** A tenant's `allowedDomains: ['myco.com']` would accept hostnames like `evil-myco.com`. Fix: use `hostname === d || hostname.endsWith('.' + d)`.
3. **`X-Tenant-*` headers leaked in responses:** `X-Tenant-ID`, `X-Tenant-Name`, and `X-Tenant-Subdomain` are set on every response. For multi-tenant data, this is informational leakage. It should be opt-in or restricted to same-origin responses.
4. **`x-tenant` header is user-controllable:** Any client can set `x-tenant: <subdomain>` and get a different tenant's context. This is by design for API clients, but means API key authentication (not implemented) should check the tenant claim matches.

---

## Performance Considerations

- **Redis → Map → DB fallback is correct but the custom domain path skips Redis.** Fix: extend `lookupTenant` to accept a `field: 'subdomain' | 'domain'` parameter and cache both lookup types.
- **`resolveEffectivePlan` on every request:** This is an additional uncached `TenantSubscription.findOne` per request. Add a Redis cache with a 60-second TTL — plan changes are not time-critical.
- **`tenantCache` Map grows unbounded for new tenants.** The TTL-based eviction only runs when the same key is re-fetched. Add an LRU eviction policy or a `setInterval` cleanup for tenants that are no longer hit.

---

## 10 Interview Questions

1. What is the difference between `req.get('host')` and `req.hostname` in Express? When does it matter which you use?
2. Why is `.lean()` used on the Mongoose query in `lookupTenant`? What do you lose by using it?
3. Explain the three layers of the tenant cache. What consistency guarantees does each layer provide?
4. Why does `updateLastActiveDebounced` use fire-and-forget (`catch(() => {})`) instead of awaiting the update?
5. What is a "cache stampede"? Does `lookupTenant` suffer from it? How would you fix it?
6. The custom domain lookup has no Redis cache. What production problem would this cause at 10,000 req/s?
7. Why does `tenantAuthMiddleware` return a hard 403 while `authMiddleware` (auth.ts) uses a soft-fail approach?
8. What is the security implication of using `hostname.includes(d)` vs `hostname === d` in `tenantSecurityMiddleware`?
9. In `extractSubdomain`, why is `parts[0] !== 'www'` checked in the localhost branch? What would happen without it?
10. A tenant is suspended mid-day. How quickly will `tenantRoutingMiddleware` stop serving that tenant, given the caching setup?

---

## What Would You Change? — 3 Concrete Improvements

**1. Cache custom domain lookups through `lookupTenant`:**
```typescript
async function lookupTenant(
  value: string,
  field: 'subdomain' | 'domain' = 'subdomain'
): Promise<{ tenant: ITenant; tenantId: string } | null> {
  const cacheKey = `${field}:${value}`;
  const redisKey = `luxgen:tenant:${cacheKey}`;
  // ... same cache logic, parameterized key
  const tenant = await Tenant.findOne({ [field]: value, status: 'active' }).lean();
  // ...
}
```

**2. Fix the substring domain match in `tenantSecurityMiddleware`:**
```typescript
const isAllowedDomain = (hostname: string, allowed: string[]): boolean =>
  allowed.some(d => hostname === d || hostname.endsWith(`.${d}`));
```

**3. Cache `resolveEffectivePlan` result in Redis with a short TTL:**
```typescript
async function getCachedEffectivePlan(tenantSubdomain: string): Promise<PlanTier> {
  const redis = getRedisClient();
  if (redis?.status === 'ready') {
    const cached = await redis.get(`luxgen:plan:${tenantSubdomain}`);
    if (cached) return cached as PlanTier;
  }
  const plan = await resolveEffectivePlan(tenantSubdomain);
  redis?.setex(`luxgen:plan:${tenantSubdomain}`, 60, plan).catch(() => {});
  return plan;
}
```

---

## Related Concepts to Review

- Multi-tenant SaaS architecture patterns (subdomain, custom domain, path-based)
- Redis cache-aside pattern and cache invalidation strategies
- Cache stampede problem and solutions (mutex locking, probabilistic early expiry)
- MongoDB `.lean()` vs full Mongoose document
- CORS vs application-level origin checking
- Fire-and-forget async patterns and their tradeoffs
- LRU cache eviction algorithms
