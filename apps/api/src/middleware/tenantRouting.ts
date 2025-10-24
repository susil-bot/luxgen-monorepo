import { Request, Response, NextFunction } from 'express';
import { Tenant, ITenant } from '@luxgen/db';
import { verifyToken, getTenantFromToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      tenant?: ITenant;
      tenantId?: string;
      subdomain?: string;
      isCustomDomain?: boolean;
    }
  }
}

export interface TenantContext {
  tenant: ITenant;
  tenantId: string;
  subdomain: string;
  isCustomDomain: boolean;
}

/**
 * Extract subdomain from hostname
 */
export const extractSubdomain = (hostname: string): string | null => {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];
  
  // Split by dots
  const parts = cleanHostname.split('.');
  
  // For localhost development, check for subdomain pattern
  if (cleanHostname.includes('localhost') || cleanHostname.includes('127.0.0.1')) {
    // Handle patterns like: demo.localhost:3000 or demo.127.0.0.1:3000
    if (parts.length >= 2 && parts[0] !== 'www') {
      return parts[0];
    }
    return null;
  }
  
  // For production domains, expect at least 3 parts (subdomain.domain.tld)
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
};

/**
 * Extract custom domain from hostname
 */
export const extractCustomDomain = (hostname: string): string | null => {
  const cleanHostname = hostname.split(':')[0];
  
  // Skip localhost and known development domains
  if (cleanHostname.includes('localhost') || 
      cleanHostname.includes('127.0.0.1') || 
      cleanHostname.includes('.vercel.app') ||
      cleanHostname.includes('.netlify.app')) {
    return null;
  }
  
  return cleanHostname;
};

/**
 * Tenant routing middleware
 * Determines tenant based on subdomain or custom domain
 */
export const tenantRoutingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hostname = req.get('host') || req.hostname;
    const subdomain = extractSubdomain(hostname);
    const customDomain = extractCustomDomain(hostname);
    
    let tenant: ITenant | null = null;
    let tenantId: string | null = null;
    let isCustomDomain = false;
    
    // Try to find tenant by subdomain first
    if (subdomain) {
      tenant = await Tenant.findOne({ 
        subdomain,
        status: 'active'
      }).populate('metadata.createdBy');
      
      if (tenant) {
        tenantId = tenant._id.toString();
        req.subdomain = subdomain;
      }
    }
    
    // If no subdomain match, try custom domain
    if (!tenant && customDomain) {
      tenant = await Tenant.findOne({ 
        domain: customDomain,
        status: 'active'
      }).populate('metadata.createdBy');
      
      if (tenant) {
        tenantId = tenant._id.toString();
        isCustomDomain = true;
        req.isCustomDomain = true;
      }
    }
    
    // If still no tenant found, return 404
    if (!tenant) {
      // Only allow health checks, GraphQL, and specific API routes without tenant context
      if (req.path === '/health' || 
          req.path === '/api/health' ||
          req.path === '/api/status' ||
          req.path === '/graphql' ||
          req.path.startsWith('/api/tenant-config/')) {
        return next();
      }
      
      // For web requests, return 404 page
      if (req.path === '/' || !req.path.startsWith('/api/')) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tenant Not Found - LuxGen</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container { 
                text-align: center; 
                background: white;
                padding: 3rem;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 2rem;
              }
              .error-code { 
                font-size: 6rem; 
                font-weight: bold; 
                color: #e53e3e; 
                margin: 0;
                line-height: 1;
              }
              .error-title { 
                font-size: 1.5rem; 
                color: #2d3748; 
                margin: 1rem 0;
              }
              .error-message { 
                color: #718096; 
                margin-bottom: 2rem;
                line-height: 1.6;
              }
              .subdomain { 
                background: #f7fafc; 
                padding: 0.5rem 1rem; 
                border-radius: 6px; 
                font-family: monospace; 
                color: #2d3748;
                display: inline-block;
                margin: 0.5rem;
              }
              .available-tenants {
                margin-top: 2rem;
                padding-top: 2rem;
                border-top: 1px solid #e2e8f0;
              }
              .tenant-link {
                display: inline-block;
                background: #4299e1;
                color: white;
                padding: 0.75rem 1.5rem;
                text-decoration: none;
                border-radius: 6px;
                margin: 0.5rem;
                transition: background 0.2s;
              }
              .tenant-link:hover {
                background: #3182ce;
              }
              .footer {
                margin-top: 2rem;
                color: #a0aec0;
                font-size: 0.875rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-code">404</div>
              <h1 class="error-title">Tenant Not Found</h1>
              <p class="error-message">
                The tenant <span class="subdomain">${subdomain || 'unknown'}</span> does not exist or is not available.
              </p>
              <div class="available-tenants">
                <p>Available tenants:</p>
                <a href="http://demo.localhost:3000" class="tenant-link">Demo Platform</a>
                <a href="http://idea-vibes.localhost:3000" class="tenant-link">Idea Vibes</a>
              </div>
              <div class="footer">
                <p>LuxGen Multi-Tenant Platform</p>
              </div>
            </div>
          </body>
          </html>
        `);
      }
      
      // For API requests, return JSON 404
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
        error: 'Invalid subdomain or domain',
        availableTenants: ['demo', 'idea-vibes']
      });
    }
    
    // Check tenant status
    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not active',
        error: `Tenant status: ${tenant.status}`
      });
    }
    
    // Update tenant last active timestamp
    await Tenant.findByIdAndUpdate(tenant._id, {
      'metadata.lastActive': new Date()
    });
    
    // Set tenant context
    req.tenant = tenant;
    req.tenantId = tenantId;
    req.subdomain = subdomain || '';
    req.isCustomDomain = isCustomDomain;
    
    // Add tenant headers for client-side use
    res.set('X-Tenant-ID', tenantId);
    res.set('X-Tenant-Name', tenant.name);
    res.set('X-Tenant-Subdomain', tenant.subdomain);
    res.set('X-Tenant-Plan', tenant.metadata.plan);
    
    next();
  } catch (error) {
    console.error('Tenant routing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to resolve tenant'
    });
  }
};

/**
 * Tenant authentication middleware
 * Validates that the user belongs to the current tenant
 */
export const tenantAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip if no tenant context
    if (!req.tenant || !req.tenantId) {
      return next();
    }
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }
    
    // Verify token and get tenant from token
    const decoded = verifyToken(token);
    const tokenTenantId = getTenantFromToken(token);
    
    if (!decoded || !tokenTenantId) {
      return next();
    }
    
    // Check if token tenant matches current tenant
    if (tokenTenantId !== req.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Token tenant mismatch',
        error: 'User token does not belong to current tenant'
      });
    }
    
    next();
  } catch (error) {
    console.error('Tenant auth middleware error:', error);
    next();
  }
};

/**
 * Tenant security middleware
 * Applies tenant-specific security settings
 */
export const tenantSecurityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant) {
      return next();
    }
    
    const { security } = req.tenant.settings;
    
    // Apply CORS settings
    const origin = req.get('origin');
    if (origin && security.corsOrigins.length > 0) {
      if (!security.corsOrigins.includes(origin)) {
        return res.status(403).json({
          success: false,
          message: 'CORS policy violation',
          error: 'Origin not allowed for this tenant'
        });
      }
    }
    
    // Apply domain restrictions
    const hostname = req.get('host') || req.hostname;
    if (security.allowedDomains.length > 0) {
      const isAllowed = security.allowedDomains.some(domain => 
        hostname.includes(domain)
      );
      
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Domain not allowed',
          error: 'Request domain not in allowed domains list'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Tenant security middleware error:', error);
    next();
  }
};

/**
 * Get tenant context from request
 */
export const getTenantContext = (req: Request): TenantContext | null => {
  if (!req.tenant || !req.tenantId) {
    return null;
  }
  
  
  return {
    tenant: req.tenant,
    tenantId: req.tenantId,
    subdomain: req.subdomain || '',
    isCustomDomain: req.isCustomDomain || false
  };
};
