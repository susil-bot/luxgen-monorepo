import { Router, Request, Response, NextFunction } from 'express';
import { UserRole } from '@luxgen/auth';
import { tenantKeyManager } from '../utils/tenantKeys';
import {
  rotateTenantKey,
  generateNewTenantKey,
  validateTenantKey,
  getTenantKeyInfo,
  revokeTenantKeys,
} from '../utils/keyRotation';

const router = Router();

const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  }
  next();
};

router.get('/tenants/keys', requireSuperAdmin, (_req: Request, res: Response) => {
  try {
    const availableTenants = tenantKeyManager.getAvailableTenants();
    const tenants = availableTenants.map(getTenantKeyInfo);
    res.json({ success: true, data: { tenants, totalTenants: availableTenants.length } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to retrieve tenant key information' });
  }
});

router.get('/tenants/:tenantId/keys', requireSuperAdmin, (req: Request, res: Response) => {
  try {
    const keyInfo = getTenantKeyInfo(req.params.tenantId);
    res.json({ success: true, data: keyInfo });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to retrieve tenant key information' });
  }
});

router.post('/tenants/:tenantId/keys/generate', requireSuperAdmin, (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { length = 64 } = req.body;
    const newKey = generateNewTenantKey(length);

    if (!validateTenantKey(newKey)) {
      return res.status(400).json({ success: false, message: 'Generated key is not valid' });
    }

    tenantKeyManager.addTenantKey(tenantId, newKey);
    res.json({
      success: true,
      message: `New key generated for tenant ${tenantId}`,
      data: { tenantId, keyLength: newKey.length },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to generate new key' });
  }
});

router.post('/tenants/:tenantId/keys/rotate', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { newKey } = req.body;

    if (!newKey) {
      return res.status(400).json({ success: false, message: 'New key is required' });
    }
    if (!validateTenantKey(newKey)) {
      return res.status(400).json({ success: false, message: 'New key is not valid (must be at least 32 characters)' });
    }

    const result = await rotateTenantKey(tenantId, newKey);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      data: { tenantId, newKeyId: result.newKeyId },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to rotate tenant key' });
  }
});

router.delete('/tenants/:tenantId/keys', requireSuperAdmin, (req: Request, res: Response) => {
  try {
    const result = revokeTenantKeys(req.params.tenantId);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      data: { tenantId: req.params.tenantId, affectedTokens: result.affectedTokens },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to revoke tenant keys' });
  }
});

router.post('/keys/reload', requireSuperAdmin, (_req: Request, res: Response) => {
  try {
    tenantKeyManager.reloadKeys();
    const availableTenants = tenantKeyManager.getAvailableTenants();
    res.json({
      success: true,
      message: 'Keys reloaded successfully',
      data: { availableTenants, totalTenants: availableTenants.length },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to reload keys' });
  }
});

export default router;
