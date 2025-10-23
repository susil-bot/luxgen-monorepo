import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@luxgen/db';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // TODO: Fetch user from database using decoded.id
    // For now, we'll just add the user ID to the request
    req.user = { id: decoded.id } as User;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
};
