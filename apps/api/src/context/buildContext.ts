import type { Request, Response } from 'express';
import { User, type IUser } from '@luxgen/db';
import { verifyToken, getTenantFromToken } from '../utils/jwt';
import { isAccountActive } from '../utils/accountStatus';
import type { GraphQLContext } from '../context';
import type { AuthErrorCode } from '../types/auth';

export async function buildGraphQLContext(req: Partial<Request>, res?: Response): Promise<GraphQLContext> {
  const headers = req.headers ?? {};
  const tenantSubdomain =
    req.subdomain || req.tenant?.subdomain || (headers['x-tenant'] as string | undefined) || 'demo';

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
    authError,
  };
}
