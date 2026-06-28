import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@luxgen/db';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
  tenant: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Tenant-aware: reads kid from JWT header → TENANT_<KID>_KEY → JWT_SECRET fallback
const verifyJwtToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    const kid = (decoded?.header as { kid?: string })?.kid;
    const tenantKey = kid ? process.env[`TENANT_${kid.toUpperCase()}_KEY`] : undefined;
    const secret = tenantKey || process.env.JWT_SECRET!;
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
};

// Extract tenant ID from JWT token
const extractTenantFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded?.tenant || null;
  } catch {
    return null;
  }
};

export default async function getCurrentUser(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenant } = req.query;

  if (!tenant || Array.isArray(tenant)) {
    return res.status(400).json({ error: 'Tenant parameter is required' });
  }

  try {
    // Extract authorization token from request headers
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authorization token provided',
      });
    }

    // Verify JWT token and extract payload
    const tokenPayload = verifyJwtToken(authToken);

    if (!tokenPayload) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token verification failed',
      });
    }

    const userRecord = await User.findById(tokenPayload.id).populate('tenant');

    if (!userRecord) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist in database',
      });
    }

    // JWT `tenant` is Mongo id; query param is subdomain (or id)
    const tokenTenantId = extractTenantFromToken(authToken);
    const userTenantId =
      userRecord.tenant && typeof userRecord.tenant === 'object' && '_id' in userRecord.tenant
        ? (userRecord.tenant as { _id: { toString(): string } })._id.toString()
        : null;
    const userSubdomain =
      userRecord.tenant && typeof userRecord.tenant === 'object' && 'subdomain' in userRecord.tenant
        ? String(userRecord.tenant.subdomain)
        : null;

    if (tokenTenantId && userTenantId && tokenTenantId !== userTenantId) {
      return res.status(403).json({
        error: 'Tenant mismatch',
        message: 'Token tenant does not match user tenant',
      });
    }

    const requestedTenant = String(tenant);
    if (userSubdomain && requestedTenant !== userSubdomain && userTenantId && requestedTenant !== userTenantId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'User does not belong to requested tenant',
      });
    }

    // Format user data for API response
    const userResponse = {
      id: userRecord._id.toString(),
      name: `${userRecord.firstName} ${userRecord.lastName}`,
      email: userRecord.email,
      role: userRecord.role,
      avatar: (userRecord as any).avatar || undefined,
      tenant: {
        id:
          userRecord.tenant && typeof userRecord.tenant === 'object' && '_id' in userRecord.tenant
            ? (userRecord.tenant as any)._id.toString()
            : tenant,
        name:
          userRecord.tenant && typeof userRecord.tenant === 'object' && 'name' in userRecord.tenant
            ? userRecord.tenant.name
            : `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Company`,
        subdomain:
          userRecord.tenant && typeof userRecord.tenant === 'object' && 'subdomain' in userRecord.tenant
            ? userRecord.tenant.subdomain
            : tenant,
      },
      createdAt: userRecord.createdAt.toISOString(),
      updatedAt: userRecord.updatedAt.toISOString(),
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
