import type { Request, Response } from 'express';
import { User, Tenant, type IUser, type ITenant } from '@luxgen/db';
import { verifyToken, getTenantFromToken } from '../utils/jwt';
import { isAccountActive } from '../utils/accountStatus';
import type { GraphQLContext } from '../context';
import type { AuthErrorCode } from '../types/auth';

export async function buildGraphQLContext(req: Partial<Request>, res?: Response): Promise<GraphQLContext> {
  const headers = req.headers ?? {};
  const tenantSubdomain =
    req.subdomain || req.tenant?.subdomain || (headers['x-tenant'] as string | undefined) || 'demo';

  // Resolve tenant document and ID (needed by services — avoids per-service DB lookups)
  let tenantDoc: ITenant | undefined = req.tenant as ITenant | undefined;
  let tenantId: string | undefined = req.tenantId;
  if (!tenantDoc && tenantSubdomain) {
    const found = (await Tenant.findOne({ subdomain: tenantSubdomain, status: 'active' }).lean()) as ITenant | null;
    if (found) {
      tenantDoc = found;
      tenantId = (found._id as any).toString();
    }
  }

  const token = (headers.authorization as string | undefined)?.replace('Bearer ', '');
  let user: IUser | undefined;
  let authError: AuthErrorCode | undefined;

  if (token) {
    try {
      const decoded = verifyToken(token);
      if (!decoded?.id) {
        authError = 'INVALID_TOKEN';
      } else {
        const found = await User.findById(decoded.id).populate('tenant');
        if (!found) {
          authError = 'INVALID_TOKEN';
        } else if (!isAccountActive(found)) {
          authError = 'ACCOUNT_DEACTIVATED';
        } else {
          const tokenTenant = getTenantFromToken(token);
          const userTenantId = (found.tenant as { _id?: { toString(): string } })?._id?.toString();
          if (tokenTenant && userTenantId && tokenTenant !== userTenantId) {
            authError = 'TENANT_MISMATCH';
          } else {
            user = found;
          }
        }
      }
    } catch {
      authError = 'INVALID_TOKEN';
    }
  }

  return {
    req: req as Request,
    res: res as Response,
    user,
    tenant: tenantSubdomain,
    tenantDoc,
    tenantId,
    authError,
  };
}
