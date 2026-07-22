import { Router, Request, Response } from 'express';
import { Tenant } from '@luxgen/db';

const router = Router();

/**
 * Get tenant configuration by subdomain
 */
router.get('/config/:subdomain', async (req: Request, res: Response) => {
  try {
    const { subdomain } = req.params;
    
    const tenant = await Tenant.findOne({ 
      subdomain,
      status: 'active'
    });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
        error: 'Invalid subdomain'
      });
    }
    
    // Return tenant configuration in the format expected by frontend.
    //
    // This previously read everything from tenant.metadata.branding /
    // .features / .limits, none of which exist on the Tenant schema
    // (metadata only has plan/createdAt/lastActive/createdBy - see
    // packages/db/src/tenant.ts). The real data lives under
    // tenant.settings. Optional chaining meant this never crashed, it
    // just silently returned hardcoded defaults for every tenant,
    // regardless of what branding/features/limits were actually
    // configured. background/text colors and separate primary/secondary
    // fonts and a text-vs-image logo split aren't modeled on
    // TenantBranding today (it only has logo, favicon, primaryColor,
    // secondaryColor, accentColor, fontFamily) - those specific fields
    // keep their hardcoded fallback until the schema grows to cover them.
    const config = {
      id: tenant.subdomain,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      status: tenant.status,
      theme: {
        colors: {
          primary: tenant.settings?.branding?.primaryColor || '#3B82F6',
          secondary: tenant.settings?.branding?.secondaryColor || '#10B981',
          background: '#F8FAFC',
          text: '#1F2937',
        },
        fonts: {
          primary: tenant.settings?.branding?.fontFamily || 'Inter',
          secondary: tenant.settings?.branding?.fontFamily || 'Inter',
        }
      },
      branding: {
        logo: {
          text: tenant.name,
          image: tenant.settings?.branding?.logo || null,
        },
        favicon: tenant.settings?.branding?.favicon || null,
      },
      features: tenant.settings?.config?.features || [],
      limits: tenant.settings?.config?.limits || {},
      plan: tenant.metadata?.plan || 'free',
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching tenant config:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch tenant configuration'
    });
  }
});

/**
 * Get all available tenants (for tenant switcher)
 */
router.get('/available', async (req: Request, res: Response) => {
  try {
    const tenants = await Tenant.find({ 
      status: 'active'
    }).select('subdomain name metadata.plan');
    
    const availableTenants = tenants.map(tenant => ({
      id: tenant.subdomain,
      name: tenant.name,
      subdomain: tenant.subdomain,
      plan: tenant.metadata?.plan || 'free',
    }));
    
    res.json({
      success: true,
      data: availableTenants
    });
  } catch (error) {
    console.error('Error fetching available tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch available tenants'
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
      status: 'active'
    });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
        error: 'Invalid subdomain'
      });
    }
    
    const assets = {
      logo: {
        text: tenant.name,
        image: tenant.settings?.branding?.logo || null,
      },
      favicon: tenant.settings?.branding?.favicon || null,
      background: null,
      colors: {
        primary: tenant.settings?.branding?.primaryColor || '#3B82F6',
        secondary: tenant.settings?.branding?.secondaryColor || '#10B981',
        background: '#F8FAFC',
        text: '#1F2937',
      }
    };
    
    res.json({
      success: true,
      data: assets
    });
  } catch (error) {
    console.error('Error fetching tenant assets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch tenant assets'
    });
  }
});

export default router;
