import { tenantKeyManager, gracePeriodExpiresAt } from './tenantKeys';
import { verifyToken } from './jwt';

export interface KeyRotationResult {
  success: boolean;
  message: string;
  newKeyId?: string;
  affectedTokens?: number;
}

/**
 * Rotate the active signing key for a tenant. The previous key remains valid
 * during the grace period so existing JWTs keep working until they expire.
 */
export const rotateTenantKey = async (tenantId: string, newKey: string): Promise<KeyRotationResult> => {
  try {
    if (!tenantKeyManager.hasTenantKey(tenantId)) {
      return {
        success: false,
        message: `Tenant ${tenantId} does not exist`,
      };
    }

    const oldKey = tenantKeyManager.getTenantKey(tenantId);
    const expiresAt = gracePeriodExpiresAt();

    await tenantKeyManager.addGraceKey(tenantId, oldKey, expiresAt);
    await tenantKeyManager.setActiveKey(tenantId, newKey);

    return {
      success: true,
      message: `Key rotated successfully for tenant ${tenantId}`,
      newKeyId: tenantId,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to rotate key for tenant ${tenantId}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

export { generateNewTenantKey } from './tenantKeys';

/**
 * Validate a tenant key
 */
export const validateTenantKey = (key: string): boolean => {
  return Boolean(key && key.length >= 32);
};

/**
 * Get key information for a tenant
 */
export const getTenantKeyInfo = (tenantId: string) => {
  const hasKey = tenantKeyManager.hasTenantKey(tenantId);
  const availableTenants = tenantKeyManager.getAvailableTenants();

  return {
    tenantId,
    hasKey,
    availableTenants,
    keyExists: hasKey,
  };
};

/**
 * Revoke all keys for a tenant (emergency)
 */
export const revokeTenantKeys = async (tenantId: string): Promise<KeyRotationResult> => {
  try {
    const affectedKeys = await tenantKeyManager.revokeTenantKeys(tenantId);

    return {
      success: true,
      message: `All keys revoked for tenant ${tenantId}`,
      affectedTokens: affectedKeys,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to revoke keys for tenant ${tenantId}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Test token verification with different keys
 */
export const testTokenWithKeys = (token: string, tenantId: string): boolean => {
  try {
    const decoded = verifyToken(token);
    return !!decoded && decoded.tenant === tenantId;
  } catch {
    return false;
  }
};
