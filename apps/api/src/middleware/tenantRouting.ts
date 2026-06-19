import { Request, Response, NextFunction } from 'express';
import { Tenant, ITenant } from '@luxgen/db';
import { verifyToken, getTenantFromToken } from '../utils/jwt';
import { renderTenantNotFound } from '../utils/tenantNotFound';

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

export const tenantRoutingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hostname = req.get('host') || req.hostname;
    const subdomain = extractSubdomain(hostname);
    const customDomain = extractCustomDomain(hostname);

    let tenant: ITenant | null = null;
    let tenantId: string | undefined = undefined;
    let isCustomDomain = false;

    if (subdomain) {
      tenant = await Tenant.findOne({ subdomain, status: 'active' }).populate('metadata.createdBy');
      if (tenant) {
        tenantId = (tenant._id as any).toString();
        req.subdomain = subdomain;
      }
    }

    if (!tenant && customDomain) {
      tenant = await Tenant.findOne({ domain: customDomain, status: 'active' }).populate('metadata.createdBy');
      if (tenant) {
        tenantId = (tenant._id as any).toString();
        isCustomDomain = true;
        req.isCustomDomain = true;
      }
    }

    if (!tenant) {
      const headerTenant = req.get('x-tenant')?.trim().toLowerCase();
      if (headerTenant) {
        tenant = await Tenant.findOne({ subdomain: headerTenant, status: 'active' }).populate(
          'metadata.createdBy',
        );
        if (tenant) {
          tenantId = (tenant._id as any).toString();
          req.subdomain = headerTenant;
        }
      }
    }

    if (!tenant) {
      if (isPublicPath(req.path)) return next();

      if (req.path === '/' || !req.path.startsWith('/api/')) {
        return res.status(404).send(renderTenantNotFound(subdomain ?? ''));
      }

      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
        error: 'Invalid subdomain or domain',
        availableTenants: ['demo', 'idea-vibes'],
      });
    }

    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not active',
        error: `Tenant status: ${tenant.status}`,
      });
    }

    await Tenant.findByIdAndUpdate(tenant._id as any, { 'metadata.lastActive': new Date() });

    req.tenant = tenant;
    req.tenantId = tenantId;
    req.subdomain = subdomain || '';
    req.isCustomDomain = isCustomDomain;

    res.set('X-Tenant-ID', tenantId);
    res.set('X-Tenant-Name', tenant.name);
    res.set('X-Tenant-Subdomain', tenant.subdomain);
    res.set('X-Tenant-Plan', tenant.metadata.plan);

    next();
  } catch {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to resolve tenant',
    });
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

    if (origin && security.corsOrigins.length > 0 && !security.corsOrigins.includes(origin)) {
      return res.status(403).json({
        success: false,
        message: 'CORS policy violation',
        error: 'Origin not allowed for this tenant',
      });
    }

    const hostname = req.get('host') || req.hostname;
    if (security.allowedDomains.length > 0 && !security.allowedDomains.some((d: string) => hostname.includes(d))) {
      return res.status(403).json({
        success: false,
        message: 'Domain not allowed',
        error: 'Request domain not in allowed domains list',
      });
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
