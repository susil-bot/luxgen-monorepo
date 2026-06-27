import { Router, Request, Response } from 'express';
import { Tenant, TenantSubscription, resolveEffectivePlan } from '@luxgen/db';
import { getTenantConfig, validateTenantConfig, getInitialSubscriptionPlan } from '../config/tenants';
import { getTenantContext } from '../middleware/tenantRouting';
import { validateStorefrontPatchBody, validationErrorsToRecord, mergeStorefrontPatch } from '../middleware/validation';

const router = Router();

/**
 * Get current tenant information
 */
router.get('/current', async (req: Request, res: Response) => {
  try {
    const tenantContext = getTenantContext(req);

    if (!tenantContext) {
      return res.status(404).json({
        success: false,
        message: 'No tenant context found',
      });
    }

    const { tenant } = tenantContext;

    res.json({
      success: true,
      data: {
        id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        domain: tenant.domain,
        status: tenant.status,
        plan: await resolveEffectivePlan(tenant.subdomain),
        branding: tenant.settings?.branding || {},
        features: tenant.settings?.config?.features || {},
        limits: tenant.settings?.config?.limits || {},
        createdAt: tenant.createdAt,
        lastActive: tenant.metadata?.lastActive || tenant.createdAt,
      },
    });
  } catch (error) {
    console.error('Get current tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

/**
 * Get tenant configuration
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const tenantContext = getTenantContext(req);

    if (!tenantContext) {
      return res.status(404).json({
        success: false,
        message: 'No tenant context found',
      });
    }

    const { tenant } = tenantContext;

    res.json({
      success: true,
      data: {
        branding: tenant.settings?.branding || {},
        security: tenant.settings?.security || {},
        config: tenant.settings?.config || {},
      },
    });
  } catch (error) {
    console.error('Get tenant config error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

/**
 * Update tenant branding
 */
router.patch('/branding', async (req: Request, res: Response) => {
  try {
    const tenantContext = getTenantContext(req);

    if (!tenantContext) {
      return res.status(404).json({
        success: false,
        message: 'No tenant context found',
      });
    }

    const { tenantId, tenant } = tenantContext;
    const { branding } = req.body;

    // Validate branding data
    if (!branding) {
      return res.status(400).json({
        success: false,
        message: 'Branding data is required',
      });
    }

    // Update tenant branding
    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      {
        'settings.branding': { ...tenant.settings.branding, ...branding },
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedTenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    res.json({
      success: true,
      message: 'Branding updated successfully',
      data: {
        branding: updatedTenant.settings.branding,
      },
    });
  } catch (error) {
    console.error('Update tenant branding error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

/**
 * Update tenant general / regional settings
 */
router.patch('/general', async (req: Request, res: Response) => {
  try {
    const tenantContext = getTenantContext(req);

    if (!tenantContext) {
      return res.status(404).json({
        success: false,
        message: 'No tenant context found',
      });
    }

    const { tenantId, tenant } = tenantContext;
    const { name, regional } = req.body as {
      name?: string;
      regional?: { contactEmail?: string; timezone?: string; currency?: string };
    };

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name?.trim()) {
      update.name = name.trim();
    }
    if (regional) {
      const existingRegional =
        (tenant.settings?.config as unknown as Record<string, unknown> | undefined)?.regional ?? {};
      update['settings.config.regional'] = { ...existingRegional, ...regional };
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(tenantId, update, { new: true });

    if (!updatedTenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const config = updatedTenant.settings?.config as unknown as Record<string, unknown> | undefined;

    res.json({
      success: true,
      message: 'General settings updated successfully',
      data: {
        name: updatedTenant.name,
        regional: config?.regional ?? {},
      },
    });
  } catch (error) {
    console.error('Update tenant general error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * Update tenant security settings
 */
router.patch('/security', async (req: Request, res: Response) => {
  try {
    const tenantContext = getTenantContext(req);

    if (!tenantContext) {
      return res.status(404).json({
        success: false,
        message: 'No tenant context found',
      });
    }

    const { tenantId, tenant } = tenantContext;
    const { security } = req.body;

    // Validate security data
    if (!security) {
      return res.status(400).json({
        success: false,
        message: 'Security data is required',
      });
    }

    // Update tenant security settings
    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      {
        'settings.security': { ...tenant.settings.security, ...security },
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedTenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: {
        security: updatedTenant.settings.security,
      },
    });
  } catch (error) {
    console.error('Update tenant security error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

/**
 * Get tenant statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const tenantContext = getTenantContext(req);

    if (!tenantContext) {
      return res.status(404).json({
        success: false,
        message: 'No tenant context found',
      });
    }

    const { tenantId, tenant } = tenantContext;

    // Get user count for this tenant
    const { User } = await import('@luxgen/db');
    const userCount = await User.countDocuments({ tenant: tenantId });

    // Get course count for this tenant
    const { Course } = await import('@luxgen/db');
    const courseCount = await Course.countDocuments({ tenant: tenantId });

    res.json({
      success: true,
      data: {
        users: userCount,
        courses: courseCount,
        plan: await resolveEffectivePlan(tenant.subdomain),
        limits: tenant.settings?.config?.limits || {},
        usage: {
          users: userCount,
          storage: 0, // TODO: Calculate actual storage usage
          apiCalls: 0, // TODO: Calculate actual API calls
        },
      },
    });
  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

/**
 * Initialize tenant with default configuration
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    const { subdomain } = req.body;

    if (!subdomain) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain is required',
      });
    }

    // Check if tenant already exists
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Tenant already exists',
        data: { subdomain: existingTenant.subdomain },
      });
    }

    // Get tenant configuration
    const tenantConfig = getTenantConfig(subdomain);

    // Validate configuration
    const errors = validateTenantConfig(tenantConfig);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tenant configuration',
        errors,
      });
    }

    // Create new tenant
    const newTenant = new Tenant(tenantConfig);
    await newTenant.save();

    const initialPlan = getInitialSubscriptionPlan(subdomain);
    await TenantSubscription.findOneAndUpdate(
      { tenantId: subdomain },
      { $set: { plan: initialPlan, status: 'active' } },
      { upsert: true, new: true },
    );

    res.status(201).json({
      success: true,
      message: 'Tenant initialized successfully',
      data: {
        id: newTenant._id,
        name: newTenant.name,
        subdomain: newTenant.subdomain,
        status: newTenant.status,
        plan: getInitialSubscriptionPlan(subdomain),
      },
    });
  } catch (error) {
    console.error('Initialize tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

/**
 * Update public storefront landing (trainer/mentor marketplace home)
 */
router.patch('/storefront', async (req: Request, res: Response) => {
  try {
    const tenantContext = getTenantContext(req);

    if (!tenantContext) {
      return res.status(404).json({
        success: false,
        message: 'No tenant context found',
      });
    }

    const { tenantId, tenant } = tenantContext;
    const validation = validateStorefrontPatchBody(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrorsToRecord(validation.errors),
      });
    }

    const { landingEnabled, slug, routes, content, theme } = validation.data;

    const existing = (tenant.settings?.config as unknown as Record<string, unknown> | undefined)?.storefront ?? {};
    const existingRecord = existing as Record<string, unknown>;
    const nextStorefront = mergeStorefrontPatch(existingRecord, {
      ...(typeof landingEnabled === 'boolean' ? { landingEnabled } : {}),
      ...(slug ? { slug } : {}),
      ...(routes ? { routes } : {}),
      ...(content ? { content } : {}),
      ...(theme ? { theme } : {}),
    });

    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      {
        'settings.config.storefront': nextStorefront,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedTenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const config = updatedTenant.settings?.config as unknown as Record<string, unknown> | undefined;

    res.json({
      success: true,
      message: 'Storefront settings updated successfully',
      data: {
        storefront: config?.storefront ?? nextStorefront,
      },
    });
  } catch (error) {
    console.error('Update tenant storefront error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

const MAX_LOGO_BYTES = 512_000;
const LOGO_PREFIXES = ['data:image/jpeg;', 'data:image/png;', 'data:image/svg+xml;', 'data:image/webp;'];

function isValidLogoUrl(value: string): boolean {
  if (value.startsWith('https://') || value.startsWith('http://')) return value.length <= 2048;
  if (!LOGO_PREFIXES.some((p) => value.startsWith(p))) return false;
  const base64Part = value.split(',')[1];
  if (!base64Part) return false;
  return Math.ceil((base64Part.length * 3) / 4) <= MAX_LOGO_BYTES;
}

router.post('/branding/logo', async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    const tenantContext = getTenantContext(req);
    if (!tenantContext) return res.status(404).json({ success: false, message: 'No tenant context found' });
    const { logoUrl } = req.body as { logoUrl?: string };
    if (!logoUrl || !isValidLogoUrl(logoUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid logo URL or image (max 500KB)' });
    }
    const updated = await Tenant.findByIdAndUpdate(
      tenantContext.tenantId,
      { 'settings.branding.logo': logoUrl, updatedAt: new Date() },
      { new: true },
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Tenant not found' });
    res.json({ success: true, data: { logo: updated.settings?.branding?.logo } });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
