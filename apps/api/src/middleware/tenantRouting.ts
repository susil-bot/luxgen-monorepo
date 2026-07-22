import { Request, Response, NextFunction } from 'express';
import { isDevLocalOrigin } from '@luxgen/config';
import { Tenant, ITenant, resolveEffectivePlan } from '@luxgen/db';
import { verifyToken, getTenantFromToken } from '../utils/jwt';
import { renderTenantNotFound } from '../utils/tenantNotFound';
import { getRedisClient } from '../lib/redis';

export interface TenantContext {
  tenant: ITenant;
  tenantId: string;
  subdomain: string;
  isCustomDomain: boolean;
}

export const extractSubdomain = (hostname: string): string | null => {
  const cleanHostname = hostname.split(':')[0];
  const parts = cleanHostname.split('.');

  if (cleanHostname.includes('localhost') || cleanHostname.includes('127.0.0.1')) {
    if (parts.length >= 2 && parts[0] !== 'www') return parts[0];
    return null;
  }

  return parts.length >= 3 ? parts[0] : null;
};

export const extractCustomDomain = (hostname: string): string | null => {
  const cleanHostname = hostname.split(':')[0];
  if (
    cleanHostname.includes('localhost') ||
    cleanHostname.includes('127.0.0.1') ||
    cleanHostname.includes('.vercel.app') ||
    cleanHostname.includes('.netlify.app')
  ) {
    return null;
  }
  return cleanHostname;
};

const BYPASS_PATHS = new Set(['/health', '/api/health', '/api/status', '/graphql']);

const isPublicPath = (path: string) => BYPASS_PATHS.has(path) || path.startsWith('/api/tenant-config/');

const TENANT_CACHE_TTL_MS = 30_000; // 30 seconds
interface CachedTenant {
  tenant: ITenant;
  tenantId: string;
  fetchedAt: number;
}
const tenantCache = new Map<string, CachedTenant>();

async function lookupTenant(subdomain: string): Promise<{ tenant: ITenant; tenantId: string } | null> {
  const redis = getRedisClient();

  // Try Redis cache first
  if (redis && redis.status === 'ready') {
    try {
      const raw = await redis.get(`luxgen:tenant:${subdomain}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { tenant: ITenant; tenantId: string };
        return parsed;
      }
    } catch {
      // fall through to DB
    }
  }

  // Try in-memory cache
  const cached = tenantCache.get(subdomain);
  if (cached && Date.now() - cached.fetchedAt < TENANT_CACHE_TTL_MS) {
    return { tenant: cached.tenant, tenantId: cached.tenantId };
  }

  // DB lookup
  const tenant = (await Tenant.findOne({ subdomain, status: 'active' }).lean()) as ITenant | null;
  if (!tenant) return null;

  const tenantId = (tenant._id as any).toString();

  // Populate caches
  tenantCache.set(subdomain, { tenant, tenantId, fetchedAt: Date.now() });
  if (redis && redis.status === 'ready') {
    try {
      await redis.setex(`luxgen:tenant:${subdomain}`, 30, JSON.stringify({ tenant, tenantId }));
    } catch {
      // non-fatal
    }
  }

  return { tenant, tenantId };
}

// Debounce lastActive writes: at most once per 5 min per tenant
const lastActiveWritten = new Map<string, number>();
const LAST_ACTIVE_DEBOUNCE_MS = 5 * 60 * 1000;

function updateLastActiveDebounced(tenantId: string): void {
  const last = lastActiveWritten.get(tenantId);
  if (last && Date.now() - last < LAST_ACTIVE_DEBOUNCE_MS) return;
  lastActiveWritten.set(tenantId, Date.now());
  // Fire-and-forget: don't block the request
  Tenant.findByIdAndUpdate(tenantId, { 'metadata.lastActive': new Date() }).catch(() => {});
}

export const tenantRoutingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hostname = req.get('host') || req.hostname;
    const subdomain = extractSubdomain(hostname);
    const customDomain = extractCustomDomain(hostname);

    let tenant: ITenant | null = null;
    let tenantId: string | undefined;
    let isCustomDomain = false;

    if (subdomain) {
      const result = await lookupTenant(subdomain);
      if (result) {
        tenant = result.tenant;
        tenantId = result.tenantId;
        req.subdomain = subdomain;
      }
    }

    if (!tenant && customDomain) {
      const byDomain = (await Tenant.findOne({ domain: customDomain, status: 'active' }).lean()) as ITenant | null;
      if (byDomain) {
        tenant = byDomain;
        tenantId = (byDomain._id as any).toString();
        isCustomDomain = true;
        req.isCustomDomain = true;
      }
    }

    if (!tenant) {
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
      if (isPublicPath(req.path)) return next();
      // Auth routes handle their own tenant scoping; allow them through even without a resolved tenant
      if (req.path.startsWith('/api/auth/')) return next();
      if (req.path === '/' || !req.path.startsWith('/api/')) {
        return res.status(404).send(renderTenantNotFound(subdomain ?? ''));
      }
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    updateLastActiveDebounced(tenantId!);

    req.tenant = tenant;
    req.tenantId = tenantId;
    req.subdomain = subdomain || '';
    req.isCustomDomain = isCustomDomain;

    res.set('X-Tenant-ID', tenantId!);
    res.set('X-Tenant-Name', tenant.name);
    res.set('X-Tenant-Subdomain', tenant.subdomain);
    const effectivePlan = await resolveEffectivePlan(tenant.subdomain);
    res.set('X-Tenant-Plan', effectivePlan);

    next();
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error', error: 'Failed to resolve tenant' });
  }
};

export const tenantAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant || !req.tenantId) return next();

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return next();

    const decoded = verifyToken(token);
    const tokenTenantId = getTenantFromToken(token);

    if (!decoded || !tokenTenantId) return next();

    if (tokenTenantId !== req.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Token tenant mismatch',
        error: 'User token does not belong to current tenant',
      });
    }

    next();
  } catch {
    next();
  }
};

export const tenantSecurityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) return next();

    const { security } = req.tenant.settings;
    const origin = req.get('origin');

    if (
      origin &&
      security.corsOrigins.length > 0 &&
      !security.corsOrigins.includes(origin) &&
      !isDevLocalOrigin(origin)
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'CORS policy violation', error: 'Origin not allowed for this tenant' });
    }

    const hostname = req.get('host') || req.hostname;
    if (security.allowedDomains.length > 0 && !security.allowedDomains.some((d: string) => hostname.includes(d))) {
      return res
        .status(403)
        .json({ success: false, message: 'Domain not allowed', error: 'Request domain not in allowed domains list' });
    }

    next();
  } catch {
    next();
  }
};

export const getTenantContext = (req: Request): TenantContext | null => {
  if (!req.tenant || !req.tenantId) return null;
  return {
    tenant: req.tenant,
    tenantId: req.tenantId,
    subdomain: req.subdomain || '',
    isCustomDomain: req.isCustomDomain || false,
  };
};
