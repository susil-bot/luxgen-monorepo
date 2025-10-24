import jwt from 'jsonwebtoken';
import { tenantKeyManager } from './tenantKeys';

export interface JwtPayload {
  id: string;
  email: string;
  tenant?: string;
  role?: string;
}

export interface JwtHeader {
  alg: string;
  typ: string;
  kid?: string;
}

/**
 * Generate a JWT token with tenant-specific signing key
 */
export const generateToken = (payload: JwtPayload, tenantId?: string): string => {
  const keyId = tenantId || payload.tenant || 'default';
  const secret = tenantKeyManager.getTenantKey(keyId);
  
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
    header: {
      alg: 'HS256',
      typ: 'JWT',
      kid: keyId, // Key ID for tenant identification
    },
  });
};

/**
 * Verify a JWT token using the tenant-specific key
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    // First decode the header to get the key ID
    const header = jwt.decode(token, { complete: true })?.header as JwtHeader;
    if (!header?.kid) {
      // Fallback to default key if no key ID
      return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    }

    // Get the tenant-specific key
    const secret = tenantKeyManager.getTenantKey(header.kid);
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

/**
 * Decode token without verification (for getting key ID)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Decode token header to get key ID
 */
export const decodeTokenHeader = (token: string): JwtHeader | null => {
  try {
    return jwt.decode(token, { complete: true })?.header as JwtHeader;
  } catch (error) {
    return null;
  }
};

/**
 * Get tenant ID from token without full verification
 */
export const getTenantFromToken = (token: string): string | null => {
  const header = decodeTokenHeader(token);
  return header?.kid || null;
};

/**
 * Verify token with specific tenant key
 */
export const verifyTokenWithTenant = (token: string, tenantId: string): JwtPayload | null => {
  try {
    const secret = tenantKeyManager.getTenantKey(tenantId);
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};
