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
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
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
    const header = jwt.decode(token, { complete: true })?.header as JwtHeader;

    if (!header?.kid) {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET is not configured');
      return jwt.verify(token, secret) as JwtPayload;
    }

    const secrets = tenantKeyManager.getSigningSecretsForKid(header.kid);
    for (const secret of secrets) {
      try {
        return jwt.verify(token, secret) as JwtPayload;
      } catch {
        // try next grace key
      }
    }
    return null;
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
  } catch {
    return null;
  }
};

/**
 * Decode token header to get key ID
 */
export const decodeTokenHeader = (token: string): JwtHeader | null => {
  try {
    return jwt.decode(token, { complete: true })?.header as JwtHeader;
  } catch {
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
  } catch {
    return null;
  }
};
