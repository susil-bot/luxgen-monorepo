import { Request, Response, NextFunction } from 'express';

/**
 * @deprecated Use tenantRoutingMiddleware from ./tenantRouting instead.
 * This middleware is kept for reference only and must not be registered
 * in app.ts — it would overwrite the full ITenant object set by tenantRoutingMiddleware
 * with a plain string, breaking all downstream code that reads tenant settings.
 */
export const tenantMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const host = req.headers.host;
  const subdomain = host?.split('.')[0];
  req.subdomain = subdomain || 'default';
  next();
};
