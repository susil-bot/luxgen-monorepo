import { Request, Response, NextFunction } from 'express';
import { User } from '@luxgen/db';
import { verifyToken, getTenantFromToken } from '../utils/jwt';

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next();
    }

    const user = await User.findById(decoded.id).populate('tenant');
    if (user) {
      const tokenTenant = getTenantFromToken(token);
      if (tokenTenant && (user.tenant as any)?._id?.toString() !== tokenTenant) {
        return next();
      }
      req.user = user;
    }

    next();
  } catch {
    next();
  }
};
