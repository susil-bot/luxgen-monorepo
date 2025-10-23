import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenant?: string;
    }
  }
}

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = req.headers.host;
    const subdomain = host?.split('.')[0];
    
    // Extract tenant from subdomain or header
    const tenant = subdomain || req.headers['x-tenant'] as string || 'default';
    
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    req.tenant = 'default';
    next();
  }
};
