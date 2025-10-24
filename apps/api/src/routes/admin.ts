import { Router, Request, Response } from 'express';
import { tenantKeyManager } from '../utils/tenantKeys';
import { 
  rotateTenantKey, 
  generateNewTenantKey, 
  validateTenantKey,
  getTenantKeyInfo,
  revokeTenantKeys 
} from '../utils/keyRotation';

const router = Router();

// Middleware to check if user is admin
const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

// Get all available tenants and their key status
router.get('/tenants/keys', requireAdmin, (req: Request, res: Response) => {
  try {
    const availableTenants = tenantKeyManager.getAvailableTenants();
    const tenantInfo = availableTenants.map(tenantId => getTenantKeyInfo(tenantId));

    res.json({
      success: true,
      data: {
        tenants: tenantInfo,
        totalTenants: availableTenants.length,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tenant key information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get key information for a specific tenant
router.get('/tenants/:tenantId/keys', requireAdmin, (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const keyInfo = getTenantKeyInfo(tenantId);

    res.json({
      success: true,
      data: keyInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tenant key information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Generate a new key for a tenant
router.post('/tenants/:tenantId/keys/generate', requireAdmin, (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { length = 64 } = req.body;

    const newKey = generateNewTenantKey(length);
    
    if (!validateTenantKey(newKey)) {
      return res.status(400).json({
        success: false,
        message: 'Generated key is not valid',
      });
    }

    // Add the new key
    tenantKeyManager.addTenantKey(tenantId, newKey);

    res.json({
      success: true,
      message: `New key generated for tenant ${tenantId}`,
      data: {
        tenantId,
        keyLength: newKey.length,
        // Don't return the actual key for security
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate new key',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Rotate keys for a tenant
router.post('/tenants/:tenantId/keys/rotate', requireAdmin, (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { newKey } = req.body;

    if (!newKey) {
      return res.status(400).json({
        success: false,
        message: 'New key is required',
      });
    }

    if (!validateTenantKey(newKey)) {
      return res.status(400).json({
        success: false,
        message: 'New key is not valid (must be at least 32 characters)',
      });
    }

    const result = rotateTenantKey(tenantId, newKey);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          tenantId,
          newKeyId: result.newKeyId,
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to rotate tenant key',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Revoke all keys for a tenant (emergency)
router.delete('/tenants/:tenantId/keys', requireAdmin, (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const result = revokeTenantKeys(tenantId);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          tenantId,
          affectedTokens: result.affectedTokens,
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to revoke tenant keys',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Reload keys from environment variables
router.post('/keys/reload', requireAdmin, (req: Request, res: Response) => {
  try {
    tenantKeyManager.reloadKeys();
    const availableTenants = tenantKeyManager.getAvailableTenants();

    res.json({
      success: true,
      message: 'Keys reloaded successfully',
      data: {
        availableTenants,
        totalTenants: availableTenants.length,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reload keys',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
