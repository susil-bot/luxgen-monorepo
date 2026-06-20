import jwt from 'jsonwebtoken';

export interface WebJwtPayload {
  id: string;
  email: string;
  tenant?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

interface JwtHeader {
  kid?: string;
}

/** Resolve signing secret — mirrors apps/api tenantKeyManager.getTenantKey (kid → JWT_SECRET fallback). */
function getSigningSecret(kid?: string): string | undefined {
  if (kid) {
    const envKey = process.env[`TENANT_${kid.toUpperCase()}_KEY`];
    if (envKey) return envKey;
  }
  return process.env.JWT_SECRET;
}

/** Verify JWT for Next.js API routes — same kid/JWT_SECRET rules as GraphQL API. */
export function verifyWebJwt(token: string): WebJwtPayload | null {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string') return null;

    const header = decoded.header as JwtHeader;
    const secret = getSigningSecret(header.kid);
    if (!secret) return null;

    return jwt.verify(token, secret) as WebJwtPayload;
  } catch {
    return null;
  }
}

export function extractTenantIdFromJwt(token: string): string | null {
  const payload = jwt.decode(token) as WebJwtPayload | null;
  return payload?.tenant ?? null;
}
