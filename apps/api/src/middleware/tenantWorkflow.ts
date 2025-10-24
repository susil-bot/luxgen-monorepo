/**
 * Tenant Workflow Middleware
 * 
 * This middleware integrates the centralized tenant workflow system
 * with the Express application, providing type-safe access to tenant
 * configurations throughout the application.
 */

import { Request, Response, NextFunction } from 'express';
import { tenantConfigService, TenantConfigUtils } from '@luxgen/shared/tenant/TenantConfigService';
import { TenantWorkflow } from '@luxgen/shared/tenant/TenantWorkflow';

// Extend Express Request interface to include tenant workflow
declare global {
  namespace Express {
    interface Request {
      tenantWorkflow?: TenantWorkflow;
      tenantId?: string;
      tenantBranding?: TenantWorkflow['branding'];
      tenantSecurity?: TenantWorkflow['security'];
      tenantFeatures?: TenantWorkflow['features'];
      tenantLimits?: TenantWorkflow['limits'];
    }
  }
}

/**
 * Tenant Workflow Middleware
 * 
 * This middleware:
 * 1. Extracts tenant ID from request (subdomain, domain, or header)
 * 2. Loads tenant workflow configuration
 * 3. Attaches tenant context to request object
 * 4. Applies tenant-specific headers and branding
 * 5. Enforces tenant-specific security policies
 */
export const tenantWorkflowMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract tenant ID from request
    const tenantId = TenantConfigUtils.getTenantIdFromRequest(req);
    
    if (!tenantId) {
      // For API routes, health checks, and GraphQL, allow without tenant context
      if (req.path.startsWith('/api/') ||
          req.path.startsWith('/graphql') ||
          req.path === '/health' ||
          req.path === '/') {
        return next();
      }
      
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
        error: 'Invalid subdomain or domain'
      });
    }
    
    // Load tenant workflow configuration
    const tenantWorkflow = await tenantConfigService.getTenantConfig(tenantId);
    
    if (!tenantWorkflow) {
      return res.status(404).json({
        success: false,
        message: 'Tenant configuration not found',
        error: 'Invalid tenant ID'
      });
    }
    
    // Check if tenant is active
    if (tenantWorkflow.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not active',
        error: `Tenant status: ${tenantWorkflow.status}`
      });
    }
    
    // Attach tenant context to request
    req.tenantId = tenantId;
    req.tenantWorkflow = tenantWorkflow;
    req.tenantBranding = tenantWorkflow.branding;
    req.tenantSecurity = tenantWorkflow.security;
    req.tenantFeatures = tenantWorkflow.features;
    req.tenantLimits = tenantWorkflow.limits;
    
    // Apply tenant-specific headers
    applyTenantHeaders(req, res, tenantWorkflow);
    
    // Apply tenant-specific security policies
    applyTenantSecurity(req, res, tenantWorkflow);
    
    // Apply tenant-specific branding
    applyTenantBranding(req, res, tenantWorkflow);
    
    next();
  } catch (error) {
    console.error('Tenant workflow middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Apply tenant-specific headers
 */
function applyTenantHeaders(req: Request, res: Response, workflow: TenantWorkflow): void {
  // Set tenant identification headers
  res.setHeader('X-Tenant-ID', workflow.id);
  res.setHeader('X-Tenant-Name', workflow.name);
  res.setHeader('X-Tenant-Plan', workflow.metadata.plan);
  res.setHeader('X-Tenant-Tier', workflow.metadata.tier);
  
  // Set branding headers
  res.setHeader('X-Tenant-Primary-Color', workflow.branding.colors.primary);
  res.setHeader('X-Tenant-Secondary-Color', workflow.branding.colors.secondary);
  res.setHeader('X-Tenant-Accent-Color', workflow.branding.colors.accent);
  res.setHeader('X-Tenant-Font-Family', workflow.branding.typography.fontFamily.primary);
  
  // Set security headers
  Object.entries(workflow.security.securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Set CORS headers
  if (workflow.security.cors.enabled) {
    res.setHeader('Access-Control-Allow-Origin', workflow.security.cors.origins.join(', '));
    res.setHeader('Access-Control-Allow-Methods', workflow.security.cors.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', workflow.security.cors.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Allow-Credentials', workflow.security.cors.credentials.toString());
    res.setHeader('Access-Control-Max-Age', workflow.security.cors.maxAge.toString());
  }
}

/**
 * Apply tenant-specific security policies
 */
function applyTenantSecurity(req: Request, res: Response, workflow: TenantWorkflow): void {
  const { security } = workflow;
  
  // Check domain restrictions
  if (security.domainRestrictions.allowedDomains.length > 0) {
    const hostname = req.get('host') || req.hostname;
    const isAllowed = security.domainRestrictions.allowedDomains.some(domain => 
      hostname.includes(domain)
    );
    
    if (!isAllowed) {
      res.status(403).json({
        success: false,
        message: 'Domain not allowed',
        error: 'Access denied for this domain'
      });
      return;
    }
  }
  
  // Check blocked domains
  if (security.domainRestrictions.blockedDomains.length > 0) {
    const hostname = req.get('host') || req.hostname;
    const isBlocked = security.domainRestrictions.blockedDomains.some(domain => 
      hostname.includes(domain)
    );
    
    if (isBlocked) {
      res.status(403).json({
        success: false,
        message: 'Domain blocked',
        error: 'Access denied for this domain'
      });
      return;
    }
  }
  
  // Apply rate limiting (basic implementation)
  if (security.rateLimiting.enabled) {
    // This would typically integrate with a rate limiting library
    // For now, we'll just set headers
    res.setHeader('X-RateLimit-Limit', security.rateLimiting.maxRequests.toString());
    res.setHeader('X-RateLimit-Window', security.rateLimiting.windowMs.toString());
  }
}

/**
 * Apply tenant-specific branding
 */
function applyTenantBranding(req: Request, res: Response, workflow: TenantWorkflow): void {
  const { branding } = workflow;
  
  // Set branding headers
  res.setHeader('X-Tenant-Logo', branding.logo.primary);
  res.setHeader('X-Tenant-Favicon', branding.logo.favicon);
  res.setHeader('X-Tenant-Hero-Image', branding.assets.heroImage || '');
  
  // Generate and inject tenant-specific CSS
  const tenantCSS = TenantConfigUtils.generateTenantCSS(branding);
  res.setHeader('X-Tenant-CSS', Buffer.from(tenantCSS).toString('base64'));
  
  // Set custom CSS and JS if available
  if (branding.customCSS) {
    res.setHeader('X-Tenant-Custom-CSS', Buffer.from(branding.customCSS).toString('base64'));
  }
  
  if (branding.customJS) {
    res.setHeader('X-Tenant-Custom-JS', Buffer.from(branding.customJS).toString('base64'));
  }
}

/**
 * Feature flag middleware
 * Checks if a specific feature is enabled for the tenant
 */
export const tenantFeatureMiddleware = (featurePath: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context required',
          error: 'No tenant ID found in request'
        });
      }
      
      const isEnabled = await tenantConfigService.isFeatureEnabled(req.tenantId, featurePath);
      
      if (!isEnabled) {
        return res.status(403).json({
          success: false,
          message: 'Feature not available',
          error: `Feature '${featurePath}' is not enabled for this tenant`
        });
      }
      
      next();
    } catch (error) {
      console.error('Tenant feature middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Tenant limit middleware
 * Checks if tenant has reached a specific limit
 */
export const tenantLimitMiddleware = (limitType: keyof TenantWorkflow['limits']) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context required',
          error: 'No tenant ID found in request'
        });
      }
      
      const isLimitReached = await tenantConfigService.isLimitReached(req.tenantId, limitType);
      
      if (isLimitReached) {
        return res.status(429).json({
          success: false,
          message: 'Limit reached',
          error: `Tenant has reached the limit for ${limitType}`
        });
      }
      
      next();
    } catch (error) {
      console.error('Tenant limit middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Tenant usage tracking middleware
 * Tracks usage for tenant limits
 */
export const tenantUsageTrackingMiddleware = (limitType: keyof TenantWorkflow['limits']) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.tenantId) {
        return next();
      }
      
      // Track usage (this would typically update a database)
      // For now, we'll just log it
      console.log(`Tenant ${req.tenantId} used ${limitType}`);
      
      next();
    } catch (error) {
      console.error('Tenant usage tracking middleware error:', error);
      // Don't fail the request for usage tracking errors
      next();
    }
  };
};

/**
 * Tenant compliance middleware
 * Ensures tenant compliance with regulations
 */
export const tenantComplianceMiddleware = (complianceType: keyof TenantWorkflow['compliance']) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.tenantWorkflow) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context required',
          error: 'No tenant workflow found in request'
        });
      }
      
      const compliance = req.tenantWorkflow.compliance[complianceType];
      
      if (!compliance || !compliance.enabled) {
        return res.status(403).json({
          success: false,
          message: 'Compliance required',
          error: `${complianceType} compliance is required for this operation`
        });
      }
      
      next();
    } catch (error) {
      console.error('Tenant compliance middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};
