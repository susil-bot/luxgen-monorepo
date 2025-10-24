import { Router, Request, Response } from 'express';
import { Tenant } from '@luxgen/db';
import { getTenantConfig, validateTenantConfig } from '../config/tenants';
import { getTenantContext } from '../middleware/tenantRouting';

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
        message: 'No tenant context found'
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
        plan: tenant.metadata.plan,
        branding: tenant.settings.branding,
        features: tenant.settings.config.features,
        limits: tenant.settings.config.limits,
        createdAt: tenant.createdAt,
        lastActive: tenant.metadata.lastActive
      }
    });
  } catch (error) {
    console.error('Get current tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        message: 'No tenant context found'
      });
    }

    const { tenant } = tenantContext;
    
    res.json({
      success: true,
      data: {
        branding: tenant.settings.branding,
        security: tenant.settings.security,
        config: tenant.settings.config
      }
    });
  } catch (error) {
    console.error('Get tenant config error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        message: 'No tenant context found'
      });
    }

    const { tenantId } = tenantContext;
    const { branding } = req.body;

    // Validate branding data
    if (!branding) {
      return res.status(400).json({
        success: false,
        message: 'Branding data is required'
      });
    }

    // Update tenant branding
    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { 
        'settings.branding': { ...tenant.settings.branding, ...branding },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedTenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      message: 'Branding updated successfully',
      data: {
        branding: updatedTenant.settings.branding
      }
    });
  } catch (error) {
    console.error('Update tenant branding error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        message: 'No tenant context found'
      });
    }

    const { tenantId, tenant } = tenantContext;
    const { security } = req.body;

    // Validate security data
    if (!security) {
      return res.status(400).json({
        success: false,
        message: 'Security data is required'
      });
    }

    // Update tenant security settings
    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { 
        'settings.security': { ...tenant.settings.security, ...security },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedTenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: {
        security: updatedTenant.settings.security
      }
    });
  } catch (error) {
    console.error('Update tenant security error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        message: 'No tenant context found'
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
        plan: tenant.metadata.plan,
        limits: tenant.settings.config.limits,
        usage: {
          users: userCount,
          storage: 0, // TODO: Calculate actual storage usage
          apiCalls: 0 // TODO: Calculate actual API calls
        }
      }
    });
  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        message: 'Subdomain is required'
      });
    }

    // Check if tenant already exists
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Tenant already exists',
        data: { subdomain: existingTenant.subdomain }
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
        errors
      });
    }

    // Create new tenant
    const newTenant = new Tenant(tenantConfig);
    await newTenant.save();

    res.status(201).json({
      success: true,
      message: 'Tenant initialized successfully',
      data: {
        id: newTenant._id,
        name: newTenant.name,
        subdomain: newTenant.subdomain,
        status: newTenant.status,
        plan: newTenant.metadata.plan
      }
    });
  } catch (error) {
    console.error('Initialize tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
