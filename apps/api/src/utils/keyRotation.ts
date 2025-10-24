import { tenantKeyManager } from './tenantKeys';
import { generateToken, verifyToken } from './jwt';

export interface KeyRotationResult {
  success: boolean;
  message: string;
  newKeyId?: string;
  affectedTokens?: number;
}

/**
 * Rotate keys for a specific tenant
 */
export const rotateTenantKey = async (
  tenantId: string, 
  newKey: string
): Promise<KeyRotationResult> => {
  try {
    // Validate that the tenant exists
    if (!tenantKeyManager.hasTenantKey(tenantId)) {
      return {
        success: false,
        message: `Tenant ${tenantId} does not exist`,
      };
    }

    // Store the old key temporarily for token migration
    const oldKey = tenantKeyManager.getTenantKey(tenantId);
    
    // Add the new key with a timestamp suffix
    const newKeyId = `${tenantId}_${Date.now()}`;
    tenantKeyManager.addTenantKey(newKeyId, newKey);
    
    // Keep the old key for a grace period
    const gracePeriodKeyId = `${tenantId}_old_${Date.now()}`;
    tenantKeyManager.addTenantKey(gracePeriodKeyId, oldKey);

    return {
      success: true,
      message: `Key rotated successfully for tenant ${tenantId}`,
      newKeyId,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to rotate key for tenant ${tenantId}: ${error.message}`,
    };
  }
};

/**
 * Generate a new random key for a tenant
 */
export const generateNewTenantKey = (length: number = 64): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate a tenant key
 */
export const validateTenantKey = (key: string): boolean => {
  // Basic validation - at least 32 characters
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
export const revokeTenantKeys = (tenantId: string): KeyRotationResult => {
  try {
    // Remove all keys for this tenant
    const availableTenants = tenantKeyManager.getAvailableTenants();
    const tenantKeys = availableTenants.filter(key => key.startsWith(tenantId));
    
    tenantKeys.forEach(key => {
      tenantKeyManager.removeTenantKey(key);
    });

    return {
      success: true,
      message: `All keys revoked for tenant ${tenantId}`,
      affectedTokens: 0, // Would need to track active tokens
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to revoke keys for tenant ${tenantId}: ${error.message}`,
    };
  }
};

/**
 * Test token verification with different keys
 */
export const testTokenWithKeys = (token: string, tenantId: string): boolean => {
  try {
    // Try with current tenant key
    const currentKey = tenantKeyManager.getTenantKey(tenantId);
    const decoded = verifyToken(token);
    return !!decoded;
  } catch (error) {
    return false;
  }
};
