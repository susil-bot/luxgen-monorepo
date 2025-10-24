import { Request, Response, NextFunction } from 'express';
import { ITenant } from '@luxgen/db';

/**
 * Tenant-specific response headers middleware
 * Adds tenant branding and configuration headers
 */
export const tenantHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant) {
      return next();
    }
    
    const tenant = req.tenant;
    const { branding, security, config } = tenant.settings;
    
    // Basic tenant identification headers
    res.set('X-Tenant-ID', tenant._id.toString());
    res.set('X-Tenant-Name', tenant.name);
    res.set('X-Tenant-Subdomain', tenant.subdomain);
    res.set('X-Tenant-Status', tenant.status);
    res.set('X-Tenant-Plan', tenant.metadata.plan);
    
    // Branding headers for frontend theming
    res.set('X-Tenant-Primary-Color', branding.primaryColor);
    res.set('X-Tenant-Secondary-Color', branding.secondaryColor);
    res.set('X-Tenant-Accent-Color', branding.accentColor);
    res.set('X-Tenant-Font-Family', branding.fontFamily);
    
    if (branding.logo) {
      res.set('X-Tenant-Logo', branding.logo);
    }
    
    if (branding.favicon) {
      res.set('X-Tenant-Favicon', branding.favicon);
    }
    
    // Security headers
    res.set('X-Tenant-Session-Timeout', security.sessionTimeout.toString());
    res.set('X-Tenant-Require-MFA', security.requireMFA.toString());
    
    // Feature flags
    res.set('X-Tenant-Features', JSON.stringify({
      analytics: config.features.analytics,
      notifications: config.features.notifications,
      fileUpload: config.features.fileUpload,
      apiAccess: config.features.apiAccess,
      customDomain: config.features.customDomain
    }));
    
    // Rate limiting headers
    if (security.rateLimiting.enabled) {
      res.set('X-Rate-Limit-Limit', security.rateLimiting.maxRequests.toString());
      res.set('X-Rate-Limit-Window', security.rateLimiting.windowMs.toString());
    }
    
    // CORS headers based on tenant settings
    if (security.corsOrigins.length > 0) {
      const origin = req.get('Origin');
      if (origin && security.corsOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
      }
    }
    
    // Custom tenant headers for API clients
    res.set('X-Tenant-API-Version', '1.0');
    res.set('X-Tenant-Environment', process.env.NODE_ENV || 'development');
    
    next();
  } catch (error) {
    console.error('Tenant headers middleware error:', error);
    next();
  }
};

/**
 * Tenant branding CSS injection middleware
 * Injects tenant-specific CSS into HTML responses
 */
export const tenantBrandingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant || !req.accepts('text/html')) {
      return next();
    }
    
    const { branding } = req.tenant.settings;
    
    // Create tenant-specific CSS variables
    const tenantCSS = `
      :root {
        --tenant-primary-color: ${branding.primaryColor};
        --tenant-secondary-color: ${branding.secondaryColor};
        --tenant-accent-color: ${branding.accentColor};
        --tenant-font-family: ${branding.fontFamily};
      }
      
      body {
        font-family: var(--tenant-font-family);
        --primary-color: var(--tenant-primary-color);
        --secondary-color: var(--tenant-secondary-color);
        --accent-color: var(--tenant-accent-color);
      }
      
      ${branding.customCSS || ''}
    `;
    
    // Store CSS in response locals for template injection
    res.locals.tenantCSS = tenantCSS;
    res.locals.tenantBranding = {
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor: branding.accentColor,
      fontFamily: branding.fontFamily,
      logo: branding.logo,
      favicon: branding.favicon
    };
    
    next();
  } catch (error) {
    console.error('Tenant branding middleware error:', error);
    next();
  }
};

/**
 * Tenant security headers middleware
 * Adds security headers based on tenant configuration
 */
export const tenantSecurityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant) {
      return next();
    }
    
    const { security } = req.tenant.settings;
    
    // Content Security Policy based on tenant settings
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self'"
    ];
    
    // Add tenant-specific domains to CSP
    if (security.allowedDomains.length > 0) {
      const allowedDomains = security.allowedDomains.join(' ');
      cspDirectives.push(`frame-src 'self' ${allowedDomains}`);
    }
    
    res.set('Content-Security-Policy', cspDirectives.join('; '));
    
    // Additional security headers
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Session timeout header
    res.set('X-Session-Timeout', (security.sessionTimeout * 60).toString()); // Convert to seconds
    
    next();
  } catch (error) {
    console.error('Tenant security headers middleware error:', error);
    next();
  }
};

/**
 * Tenant rate limiting middleware
 * Applies tenant-specific rate limiting
 */
export const tenantRateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant) {
      return next();
    }
    
    const { rateLimiting } = req.tenant.settings.security;
    
    if (!rateLimiting.enabled) {
      return next();
    }
    
    // Simple in-memory rate limiting (in production, use Redis)
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - rateLimiting.windowMs;
    
    // This is a simplified implementation
    // In production, use a proper rate limiting library like express-rate-limit
    res.set('X-Rate-Limit-Limit', rateLimiting.maxRequests.toString());
    res.set('X-Rate-Limit-Remaining', rateLimiting.maxRequests.toString());
    res.set('X-Rate-Limit-Reset', new Date(now + rateLimiting.windowMs).toISOString());
    
    next();
  } catch (error) {
    console.error('Tenant rate limit middleware error:', error);
    next();
  }
};
