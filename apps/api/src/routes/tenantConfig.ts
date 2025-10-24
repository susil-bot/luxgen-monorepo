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
    
    // Return tenant configuration in the format expected by frontend
    const config = {
      id: tenant.subdomain,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      status: tenant.status,
      theme: {
        colors: {
          primary: tenant.metadata?.branding?.primaryColor || '#3B82F6',
          secondary: tenant.metadata?.branding?.secondaryColor || '#10B981',
          background: tenant.metadata?.branding?.backgroundColor || '#F8FAFC',
          text: tenant.metadata?.branding?.textColor || '#1F2937',
        },
        fonts: {
          primary: tenant.metadata?.branding?.primaryFont || 'Inter',
          secondary: tenant.metadata?.branding?.secondaryFont || 'Inter',
        }
      },
      branding: {
        logo: {
          text: tenant.metadata?.branding?.logoText || tenant.name,
          image: tenant.metadata?.branding?.logoImage || null,
        },
        favicon: tenant.metadata?.branding?.favicon || null,
      },
      features: tenant.metadata?.features || [],
      limits: tenant.metadata?.limits || {},
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
        text: tenant.metadata?.branding?.logoText || tenant.name,
        image: tenant.metadata?.branding?.logoImage || null,
      },
      favicon: tenant.metadata?.branding?.favicon || null,
      background: tenant.metadata?.branding?.backgroundImage || null,
      colors: {
        primary: tenant.metadata?.branding?.primaryColor || '#3B82F6',
        secondary: tenant.metadata?.branding?.secondaryColor || '#10B981',
        background: tenant.metadata?.branding?.backgroundColor || '#F8FAFC',
        text: tenant.metadata?.branding?.textColor || '#1F2937',
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
