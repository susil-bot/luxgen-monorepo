import { Router, Request, Response } from 'express';
import { Tenant, TenantSubscription } from '@luxgen/db';

const router = Router();

/**
 * Get tenant configuration by subdomain
 */
router.get('/config/:subdomain', async (req: Request, res: Response) => {
  try {
    const { subdomain } = req.params;

    const tenant = await Tenant.findOne({
      subdomain,
      status: 'active',
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
        error: 'Invalid subdomain',
      });
    }

    // Return tenant configuration in the format expected by frontend
    const meta = tenant.metadata as any;
    const b = tenant.settings?.branding;
    const config = {
      id: tenant.subdomain,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      status: tenant.status,
      theme: {
        colors: {
          primary: meta?.branding?.primaryColor || b?.primaryColor || '#3B82F6',
          secondary: meta?.branding?.secondaryColor || b?.secondaryColor || '#10B981',
          background: meta?.branding?.backgroundColor || '#F8FAFC',
          text: meta?.branding?.textColor || '#1F2937',
        },
        fonts: {
          primary: meta?.branding?.primaryFont || b?.fontFamily || 'Inter',
          secondary: meta?.branding?.secondaryFont || b?.fontFamily || 'Inter',
        },
      },
      branding: {
        logo: {
          text: meta?.branding?.logoText || tenant.name,
          image: meta?.branding?.logoImage || b?.logo || null,
        },
        favicon: meta?.branding?.favicon || b?.favicon || null,
      },
      features: meta?.features || [],
      limits: meta?.limits || {},
      plan: tenant.metadata?.plan || 'free',
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching tenant config:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch tenant configuration',
    });
  }
});

/**
 * Get all available tenants (for tenant switcher)
 */
router.get('/available', async (req: Request, res: Response) => {
  try {
    const tenants = await Tenant.find({
      status: 'active',
    }).select('subdomain name');

    const subs = await TenantSubscription.find({
      tenantId: { $in: tenants.map((t) => t.subdomain) },
    }).lean();
    const planByTenant = new Map(subs.map((s) => [s.tenantId, s.plan]));

    const availableTenants = tenants.map((tenant) => ({
      id: tenant.subdomain,
      name: tenant.name,
      subdomain: tenant.subdomain,
      plan: planByTenant.get(tenant.subdomain) ?? 'free',
    }));

    res.json({
      success: true,
      data: availableTenants,
    });
  } catch (error) {
    console.error('Error fetching available tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch available tenants',
    });
  }
});

/**
 * Get tenant assets (logos, images, etc.)
 */
router.get('/assets/:subdomain', async (req: Request, res: Response) => {
  try {
    const { subdomain } = req.params;

    const tenant = await Tenant.findOne({
      subdomain,
      status: 'active',
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
        error: 'Invalid subdomain',
      });
    }

    const branding = tenant.settings?.branding as unknown as Record<string, string | undefined> | undefined;
    const assets = {
      logo: {
        text: branding?.logoText || branding?.logo || tenant.name,
        image: branding?.logoImage || branding?.logo || null,
      },
      favicon: branding?.favicon || null,
      background: branding?.backgroundImage || null,
      colors: {
        primary: branding?.primaryColor || '#3B82F6',
        secondary: branding?.secondaryColor || '#10B981',
        background: branding?.backgroundColor || '#F8FAFC',
        text: branding?.textColor || '#1F2937',
      },
    };

    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error('Error fetching tenant assets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch tenant assets',
    });
  }
});

export default router;
