import { Request, Response, NextFunction } from 'express';
import { User } from '@luxgen/db';
import { verifyToken, getTenantFromToken } from '../utils/jwt';
import { isAccountActive } from '../utils/accountStatus';

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    if (!decoded?.id) {
      req.authError = 'INVALID_TOKEN';
      return next();
    }

    const user = await User.findById(decoded.id).populate('tenant');
    if (!user) {
      req.authError = 'INVALID_TOKEN';
      return next();
    }

    if (!isAccountActive(user)) {
      req.authError = 'ACCOUNT_DEACTIVATED';
      return next();
    }

    const tokenTenant = getTenantFromToken(token);
    const userTenantId = (user.tenant as { _id?: { toString(): string } })?._id?.toString();
    if (tokenTenant && userTenantId && tokenTenant !== userTenantId) {
      req.authError = 'TENANT_MISMATCH';
      return next();
    }

    req.user = user;
    next();
  } catch {
    req.authError = 'INVALID_TOKEN';
    next();
  }
};
