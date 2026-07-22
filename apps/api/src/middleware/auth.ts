import { Request, Response, NextFunction } from 'express';
import { resolveAuthenticatedUser } from '../utils/resolveAuthenticatedUser';

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const { user, authError } = await resolveAuthenticatedUser(token);
    if (authError) {
      req.authError = authError;
      return next();
    }

    req.user = user;
    next();
  } catch {
    req.authError = 'INVALID_TOKEN';
    next();
  }
};
