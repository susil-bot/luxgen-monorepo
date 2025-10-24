import { tenantKeyManager } from '../utils/tenantKeys';
import { 
  generateToken, 
  verifyToken, 
  getTenantFromToken,
  verifyTokenWithTenant 
} from '../utils/jwt';
import { 
  generateNewTenantKey, 
  validateTenantKey,
  rotateTenantKey 
} from '../utils/keyRotation';

describe('Per-Tenant JWT Keys', () => {
  const testTenantId = 'test-tenant';
  const testKey = 'test-tenant-specific-key-here-32-chars-minimum';

  beforeEach(() => {
    // Add test tenant key
    tenantKeyManager.addTenantKey(testTenantId, testKey);
  });

  afterEach(() => {
    // Clean up test keys
    tenantKeyManager.removeTenantKey(testTenantId);
  });

  describe('TenantKeyManager', () => {
    it('should add and retrieve tenant key', () => {
      expect(tenantKeyManager.hasTenantKey(testTenantId)).toBe(true);
      expect(tenantKeyManager.getTenantKey(testTenantId)).toBe(testKey);
    });

    it('should return default key for unknown tenant', () => {
      const defaultKey = tenantKeyManager.getTenantKey('unknown-tenant');
      expect(defaultKey).toBeDefined();
    });

    it('should get available tenants', () => {
      const tenants = tenantKeyManager.getAvailableTenants();
      expect(tenants).toContain(testTenantId);
    });

    it('should remove tenant key', () => {
      tenantKeyManager.removeTenantKey(testTenantId);
      expect(tenantKeyManager.hasTenantKey(testTenantId)).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate token with tenant-specific key', () => {
      const payload = {
        id: 'user123',
        email: 'user@test.com',
        tenant: testTenantId,
        role: 'STUDENT'
      };

      const token = generateToken(payload, testTenantId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should include key ID in token header', () => {
      const payload = {
        id: 'user123',
        email: 'user@test.com',
        tenant: testTenantId,
        role: 'STUDENT'
      };

      const token = generateToken(payload, testTenantId);
      const tenantFromToken = getTenantFromToken(token);
      expect(tenantFromToken).toBe(testTenantId);
    });
  });

  describe('JWT Token Verification', () => {
    let validToken: string;

    beforeEach(() => {
      const payload = {
        id: 'user123',
        email: 'user@test.com',
        tenant: testTenantId,
        role: 'STUDENT'
      };
      validToken = generateToken(payload, testTenantId);
    });

    it('should verify token with correct tenant key', () => {
      const decoded = verifyToken(validToken);
      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe('user123');
      expect(decoded?.email).toBe('user@test.com');
      expect(decoded?.tenant).toBe(testTenantId);
    });

    it('should verify token with specific tenant key', () => {
      const decoded = verifyTokenWithTenant(validToken, testTenantId);
      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe('user123');
    });

    it('should fail verification with wrong tenant key', () => {
      const wrongTenantId = 'wrong-tenant';
      tenantKeyManager.addTenantKey(wrongTenantId, 'wrong-key');
      
      const decoded = verifyTokenWithTenant(validToken, wrongTenantId);
      expect(decoded).toBeNull();
    });
  });

  describe('Key Rotation', () => {
    it('should generate new tenant key', () => {
      const newKey = generateNewTenantKey(64);
      expect(newKey).toBeDefined();
      expect(newKey.length).toBe(64);
      expect(validateTenantKey(newKey)).toBe(true);
    });

    it('should validate key strength', () => {
      expect(validateTenantKey('short')).toBe(false);
      expect(validateTenantKey('a'.repeat(32))).toBe(true);
      expect(validateTenantKey('')).toBe(false);
    });

    it('should rotate tenant key', async () => {
      const newKey = generateNewTenantKey(64);
      const result = await rotateTenantKey(testTenantId, newKey);
      
      expect(result.success).toBe(true);
      expect(result.newKeyId).toBeDefined();
    });

    it('should fail rotation for non-existent tenant', async () => {
      const newKey = generateNewTenantKey(64);
      const result = await rotateTenantKey('non-existent-tenant', newKey);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('does not exist');
    });
  });

  describe('Cross-Tenant Security', () => {
    let tenantAToken: string;
    let tenantBToken: string;

    beforeEach(() => {
      const tenantAId = 'tenant-a';
      const tenantBId = 'tenant-b';
      const tenantAKey = 'tenant-a-specific-key-32-chars-minimum';
      const tenantBKey = 'tenant-b-specific-key-32-chars-minimum';

      tenantKeyManager.addTenantKey(tenantAId, tenantAKey);
      tenantKeyManager.addTenantKey(tenantBId, tenantBKey);

      const payloadA = {
        id: 'user-a',
        email: 'user@tenant-a.com',
        tenant: tenantAId,
        role: 'STUDENT'
      };

      const payloadB = {
        id: 'user-b',
        email: 'user@tenant-b.com',
        tenant: tenantBId,
        role: 'STUDENT'
      };

      tenantAToken = generateToken(payloadA, tenantAId);
      tenantBToken = generateToken(payloadB, tenantBId);
    });

    afterEach(() => {
      tenantKeyManager.removeTenantKey('tenant-a');
      tenantKeyManager.removeTenantKey('tenant-b');
    });

    it('should prevent cross-tenant token usage', () => {
      // Token from tenant A should not work with tenant B's key
      const decodedWithWrongTenant = verifyTokenWithTenant(tenantAToken, 'tenant-b');
      expect(decodedWithWrongTenant).toBeNull();
    });

    it('should maintain tenant isolation', () => {
      const decodedA = verifyToken(tenantAToken);
      const decodedB = verifyToken(tenantBToken);

      expect(decodedA?.tenant).toBe('tenant-a');
      expect(decodedB?.tenant).toBe('tenant-b');
      expect(decodedA?.tenant).not.toBe(decodedB?.tenant);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tokens gracefully', () => {
      const invalidToken = 'invalid.jwt.token';
      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });

    it('should handle tokens without key ID', () => {
      // This would be a legacy token without kid in header
      const legacyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QifQ.invalid';
      const decoded = verifyToken(legacyToken);
      // Should fallback to default key or return null
      expect(decoded).toBeNull();
    });

    it('should handle missing tenant keys', () => {
      // Clear the default key to ensure the test works
      const originalDefault = tenantKeyManager['keyStore']['default'];
      delete tenantKeyManager['keyStore']['default'];
      
      expect(() => {
        tenantKeyManager.getTenantKey('non-existent-tenant');
      }).toThrow('No signing key found for tenant: non-existent-tenant');
      
      // Restore the default key
      if (originalDefault) {
        tenantKeyManager['keyStore']['default'] = originalDefault;
      }
    });
  });
});
