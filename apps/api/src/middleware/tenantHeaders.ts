import { resolveEffectivePlan } from '@luxgen/db';
import { Request, Response, NextFunction } from 'express';
import { isDevLocalOrigin } from '@luxgen/config';
import { getRedisClient } from '../lib/redis';

// Strip CR/LF to prevent HTTP header injection
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]/g, '');
}

// Allow only safe CSS color values (hex, rgb, named, hsl)
function sanitizeCssColor(value: string): string {
  if (
    /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*[\d,.%\s]+\)|hsl\(\s*[\d,.%\s]+\)|[a-zA-Z]+)$/.test(
      value.trim(),
    )
  ) {
    return value.trim();
  }
  return '#000000';
}

// Allow only safe font-family names
function sanitizeFontFamily(value: string): string {
  if (/^[a-zA-Z0-9\s,'"-]+$/.test(value.trim())) {
    return value.trim();
  }
  return 'sans-serif';
}

export const tenantHeadersMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) return next();

    const tenant = req.tenant;
    const { branding, security, config } = tenant.settings;

    res.set('X-Tenant-ID', sanitizeHeader(tenant._id.toString()));
    res.set('X-Tenant-Name', sanitizeHeader(tenant.name));
    res.set('X-Tenant-Subdomain', sanitizeHeader(tenant.subdomain));
    res.set('X-Tenant-Status', sanitizeHeader(tenant.status));
    const effectivePlan = await resolveEffectivePlan(tenant.subdomain);
    res.set('X-Tenant-Plan', sanitizeHeader(effectivePlan));

    res.set('X-Tenant-Primary-Color', sanitizeHeader(sanitizeCssColor(branding.primaryColor)));
    res.set('X-Tenant-Secondary-Color', sanitizeHeader(sanitizeCssColor(branding.secondaryColor)));
    res.set('X-Tenant-Accent-Color', sanitizeHeader(sanitizeCssColor(branding.accentColor)));
    res.set('X-Tenant-Font-Family', sanitizeHeader(sanitizeFontFamily(branding.fontFamily)));

    if (branding.logo) res.set('X-Tenant-Logo', sanitizeHeader(branding.logo));
    if (branding.favicon) res.set('X-Tenant-Favicon', sanitizeHeader(branding.favicon));

    res.set('X-Tenant-Session-Timeout', String(security.sessionTimeout));
    res.set('X-Tenant-Require-MFA', String(security.requireMFA));

    res.set(
      'X-Tenant-Features',
      JSON.stringify({
        analytics: config.features.analytics,
        notifications: config.features.notifications,
        fileUpload: config.features.fileUpload,
        apiAccess: config.features.apiAccess,
        customDomain: config.features.customDomain,
      }),
    );

    if (security.rateLimiting.enabled) {
      res.set('X-Rate-Limit-Limit', String(security.rateLimiting.maxRequests));
      res.set('X-Rate-Limit-Window', String(security.rateLimiting.windowMs));
    }

    if (security.corsOrigins.length > 0) {
      const origin = req.get('Origin');
      if (origin && (security.corsOrigins.includes(origin) || isDevLocalOrigin(origin))) {
        res.set('Access-Control-Allow-Origin', origin);
      }
    }

    res.set('X-Tenant-API-Version', '1.0');
    res.set('X-Tenant-Environment', sanitizeHeader(process.env.NODE_ENV || 'development'));

    next();
  } catch (error) {
    console.error('Tenant headers middleware error:', error);
    next();
  }
};

// Injects sanitized CSS variables into res.locals for template rendering.
// customCSS is intentionally excluded — inject it only via a dedicated,
// admin-controlled mechanism with explicit escaping.
export const tenantBrandingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant || !req.accepts('text/html')) return next();

    const { branding } = req.tenant.settings;
    const primary = sanitizeCssColor(branding.primaryColor);
    const secondary = sanitizeCssColor(branding.secondaryColor);
    const accent = sanitizeCssColor(branding.accentColor);
    const font = sanitizeFontFamily(branding.fontFamily);

    res.locals.tenantCSS = `
      :root {
        --tenant-primary-color: ${primary};
        --tenant-secondary-color: ${secondary};
        --tenant-accent-color: ${accent};
        --tenant-font-family: ${font};
      }
      body {
        font-family: var(--tenant-font-family);
        --primary-color: var(--tenant-primary-color);
        --secondary-color: var(--tenant-secondary-color);
        --accent-color: var(--tenant-accent-color);
      }
    `;

    res.locals.tenantBranding = {
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      fontFamily: font,
      logo: branding.logo,
      favicon: branding.favicon,
    };

    next();
  } catch (error) {
    console.error('Tenant branding middleware error:', error);
    next();
  }
};

export const tenantSecurityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) return next();

    const { security } = req.tenant.settings;

    // CSP without unsafe-inline/unsafe-eval; connect-src includes self + websocket upgrade
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // inline styles only (no inline scripts)
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self' wss:",
      "object-src 'none'",
      "base-uri 'self'",
    ];

    if (security.allowedDomains.length > 0) {
      const domains = security.allowedDomains.map(sanitizeHeader).join(' ');
      cspDirectives.push(`frame-src 'self' ${domains}`);
    }

    res.set('Content-Security-Policy', cspDirectives.join('; '));
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('X-Session-Timeout', String(security.sessionTimeout * 60));

    next();
  } catch (error) {
    console.error('Tenant security headers middleware error:', error);
    next();
  }
};

// In-memory fallback (per-process) when Redis is unavailable
interface RateWindow {
  count: number;
  resetAt: number;
}
const rateFallback = new Map<string, RateWindow>();

async function checkTenantRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ limited: boolean; remaining: number; resetAt: number }> {
  const redis = getRedisClient();
  const now = Date.now();

  if (redis && redis.status === 'ready') {
    try {
      const rKey = `luxgen:ratelimit:${key}`;
      const count = await redis.incr(rKey);
      if (count === 1) await redis.pexpire(rKey, windowMs);
      const ttl = await redis.pttl(rKey);
      const resetAt = now + (ttl > 0 ? ttl : windowMs);
      return { limited: count > max, remaining: Math.max(0, max - count), resetAt };
    } catch {
      // fall through to in-memory
    }
  }

  // Evict expired in-memory entries
  for (const [k, w] of rateFallback) {
    if (now >= w.resetAt) rateFallback.delete(k);
  }

  let entry = rateFallback.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    rateFallback.set(key, entry);
  }
  entry.count += 1;
  return {
    limited: entry.count > max,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt,
  };
}

export const tenantRateLimitMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.tenant) return next();

    const { rateLimiting } = req.tenant.settings.security;
    if (!rateLimiting.enabled) return next();

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `tenant:${req.tenantId}:${ip}`;
    const { limited, remaining, resetAt } = await checkTenantRateLimit(
      key,
      rateLimiting.maxRequests,
      rateLimiting.windowMs,
    );

    res.set('X-Rate-Limit-Limit', String(rateLimiting.maxRequests));
    res.set('X-Rate-Limit-Remaining', String(remaining));
    res.set('X-Rate-Limit-Reset', new Date(resetAt).toISOString());

    if (limited) {
      res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
      return;
    }

    next();
  } catch (error) {
    console.error('Tenant rate limit middleware error:', error);
    next();
  }
};
