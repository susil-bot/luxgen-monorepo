import { Request, Response, NextFunction } from 'express';
import { tenantConfigService, TenantConfigUtils, TenantWorkflow } from '@luxgen/shared';

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

const errMsg = (e: unknown) =>
  process.env.NODE_ENV === 'development' ? (e instanceof Error ? e.message : String(e)) : undefined;

export const tenantWorkflowMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = TenantConfigUtils.getTenantIdFromRequest(req);

    if (!tenantId) {
      if (
        req.path.startsWith('/api/') ||
        req.path.startsWith('/graphql') ||
        req.path === '/health' ||
        req.path === '/'
      ) {
        return next();
      }
      res.status(404).json({ success: false, message: 'Tenant not found', error: 'Invalid subdomain or domain' });
      return;
    }

    const tenantWorkflow = await tenantConfigService.getTenantConfig(tenantId);

    if (!tenantWorkflow) {
      res.status(404).json({ success: false, message: 'Tenant configuration not found', error: 'Invalid tenant ID' });
      return;
    }

    if (tenantWorkflow.status !== 'active') {
      res.status(403).json({
        success: false,
        message: 'Tenant is not active',
        error: `Tenant status: ${tenantWorkflow.status}`,
      });
      return;
    }

    req.tenantId = tenantId;
    req.tenantWorkflow = tenantWorkflow;
    req.tenantBranding = tenantWorkflow.branding;
    req.tenantSecurity = tenantWorkflow.security;
    req.tenantFeatures = tenantWorkflow.features;
    req.tenantLimits = tenantWorkflow.limits;

    applyTenantHeaders(req, res, tenantWorkflow);
    applyTenantSecurity(req, res, tenantWorkflow);
    applyTenantBranding(req, res, tenantWorkflow);

    next();
  } catch (error) {
    console.error('Tenant workflow middleware error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: errMsg(error) });
  }
};

function applyTenantHeaders(_req: Request, res: Response, workflow: TenantWorkflow): void {
  res.setHeader('X-Tenant-ID', workflow.id);
  res.setHeader('X-Tenant-Name', workflow.name);
  res.setHeader('X-Tenant-Plan', workflow.metadata.plan);
  res.setHeader('X-Tenant-Tier', workflow.metadata.tier);
  res.setHeader('X-Tenant-Primary-Color', workflow.branding.colors.primary);
  res.setHeader('X-Tenant-Secondary-Color', workflow.branding.colors.secondary);
  res.setHeader('X-Tenant-Accent-Color', workflow.branding.colors.accent);
  res.setHeader('X-Tenant-Font-Family', workflow.branding.typography.fontFamily.primary);

  Object.entries(workflow.security.securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value as string);
  });

  if (workflow.security.cors.enabled) {
    res.setHeader('Access-Control-Allow-Origin', workflow.security.cors.origins.join(', '));
    res.setHeader('Access-Control-Allow-Methods', workflow.security.cors.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', workflow.security.cors.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Allow-Credentials', workflow.security.cors.credentials.toString());
    res.setHeader('Access-Control-Max-Age', workflow.security.cors.maxAge.toString());
  }
}

function applyTenantSecurity(req: Request, res: Response, workflow: TenantWorkflow): void {
  const { security } = workflow;

  if (security.domainRestrictions.allowedDomains.length > 0) {
    const hostname = req.get('host') || req.hostname;
    const isAllowed = security.domainRestrictions.allowedDomains.some((domain: string) => hostname.includes(domain));
    if (!isAllowed) {
      res.status(403).json({ success: false, message: 'Domain not allowed', error: 'Access denied for this domain' });
      return;
    }
  }

  if (security.domainRestrictions.blockedDomains.length > 0) {
    const hostname = req.get('host') || req.hostname;
    const isBlocked = security.domainRestrictions.blockedDomains.some((domain: string) => hostname.includes(domain));
    if (isBlocked) {
      res.status(403).json({ success: false, message: 'Domain blocked', error: 'Access denied for this domain' });
      return;
    }
  }

  if (security.rateLimiting.enabled) {
    res.setHeader('X-RateLimit-Limit', security.rateLimiting.maxRequests.toString());
    res.setHeader('X-RateLimit-Window', security.rateLimiting.windowMs.toString());
  }
}

function applyTenantBranding(_req: Request, res: Response, workflow: TenantWorkflow): void {
  const { branding } = workflow;
  res.setHeader('X-Tenant-Logo', branding.logo.primary);
  res.setHeader('X-Tenant-Favicon', branding.logo.favicon);
  res.setHeader('X-Tenant-Hero-Image', branding.assets.heroImage || '');

  const tenantCSS = TenantConfigUtils.generateTenantCSS(branding);
  res.setHeader('X-Tenant-CSS', Buffer.from(tenantCSS).toString('base64'));

  if (branding.customCSS) {
    res.setHeader('X-Tenant-Custom-CSS', Buffer.from(branding.customCSS).toString('base64'));
  }
  if (branding.customJS) {
    res.setHeader('X-Tenant-Custom-JS', Buffer.from(branding.customJS).toString('base64'));
  }
}

export const tenantFeatureMiddleware = (featurePath: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context required',
          error: 'No tenant ID found in request',
        });
        return;
      }

      const isEnabled = await tenantConfigService.isFeatureEnabled(req.tenantId, featurePath);

      if (!isEnabled) {
        res.status(403).json({
          success: false,
          message: 'Feature not available',
          error: `Feature '${featurePath}' is not enabled for this tenant`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Tenant feature middleware error:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: errMsg(error) });
    }
  };
};

export const tenantLimitMiddleware = (limitType: keyof TenantWorkflow['limits']) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context required',
          error: 'No tenant ID found in request',
        });
        return;
      }

      const isLimitReached = await tenantConfigService.isLimitReached(req.tenantId, limitType);

      if (isLimitReached) {
        res.status(429).json({
          success: false,
          message: 'Limit reached',
          error: `Tenant has reached the limit for ${String(limitType)}`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Tenant limit middleware error:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: errMsg(error) });
    }
  };
};

export const tenantUsageTrackingMiddleware = (limitType: keyof TenantWorkflow['limits']) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.tenantId) {
        console.log(`Tenant ${req.tenantId} used ${String(limitType)}`);
      }
      next();
    } catch (error) {
      console.error('Tenant usage tracking middleware error:', error);
      next();
    }
  };
};

export const tenantComplianceMiddleware = (complianceType: keyof TenantWorkflow['compliance']) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.tenantWorkflow) {
        res.status(400).json({
          success: false,
          message: 'Tenant context required',
          error: 'No tenant workflow found in request',
        });
        return;
      }

      const compliance = req.tenantWorkflow.compliance[complianceType];

      if (!compliance || !compliance.enabled) {
        res.status(403).json({
          success: false,
          message: 'Compliance required',
          error: `${String(complianceType)} compliance is required for this operation`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Tenant compliance middleware error:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: errMsg(error) });
    }
  };
};
