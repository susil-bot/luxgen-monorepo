import crypto from 'crypto';
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
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to rotate key for tenant ${tenantId}: ${message}`,
    };
  }
};

/**
 * Generate a new random key for a tenant.
 *
 * Uses crypto.randomBytes (CSPRNG), not Math.random() - Math.random() is
 * not cryptographically secure and must never back a JWT signing secret;
 * its internal state can be inferred from a handful of outputs, which
 * would let an attacker forge tokens for any tenant.
 */
export const generateNewTenantKey = (length: number = 64): string => {
  // base64url has ~4 output chars per 3 input bytes; over-generate then
  // trim so the returned string is exactly `length` characters.
  const byteLength = Math.ceil((length * 3) / 4) + 4;
  return crypto
    .randomBytes(byteLength)
    .toString('base64url')
    .slice(0, length);
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
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to revoke keys for tenant ${tenantId}: ${message}`,
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
