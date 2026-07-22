import { User, type IUser } from '@luxgen/db';
import { verifyToken, getTenantFromToken } from './jwt';
import { isAccountActive } from './accountStatus';
import type { AuthErrorCode } from '../types/auth';

export type ResolveAuthenticatedUserResult = {
  user?: IUser;
  authError?: AuthErrorCode;
};

export async function resolveAuthenticatedUser(token: string): Promise<ResolveAuthenticatedUserResult> {
  try {
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return { authError: 'INVALID_TOKEN' };
    }

    const found = await User.findById(decoded.id).populate('tenant');
    if (!found) {
      return { authError: 'INVALID_TOKEN' };
    }

    if (!isAccountActive(found)) {
      return { authError: 'ACCOUNT_DEACTIVATED' };
    }

    const tokenTenant = getTenantFromToken(token);
    const userTenantId = (found.tenant as { _id?: { toString(): string } })?._id?.toString();
    if (tokenTenant && userTenantId && tokenTenant !== userTenantId) {
      return { authError: 'TENANT_MISMATCH' };
    }

    return { user: found };
  } catch {
    return { authError: 'INVALID_TOKEN' };
  }
}
