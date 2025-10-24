import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '@luxgen/db';
import { verifyToken, getTenantFromToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    // Verify token using tenant-specific key
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return next();
    }

    // Fetch user from database using decoded.id
    const user = await User.findById(decoded.id).populate('tenant');
    if (user) {
      // Verify that the token's tenant matches the user's tenant
      const tokenTenant = getTenantFromToken(token);
      if (tokenTenant && user.tenant._id?.toString() !== tokenTenant) {
        console.warn('Token tenant mismatch for user:', user._id);
        return next();
      }
      
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
};
