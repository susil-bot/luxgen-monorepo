import { Request, Response } from 'express';
import { IUser } from '@luxgen/db';

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: IUser;
  tenant?: string;
}

export const context = ({ req, res }: { req: Request; res: Response }): GraphQLContext => {
  // req.tenant is ITenant (full object) set by tenantRoutingMiddleware.
  // GraphQL resolvers and services expect a string subdomain, so extract it here.
  // req.subdomain is also set by tenantRoutingMiddleware as a convenience.
  const tenantSubdomain = req.subdomain || req.tenant?.subdomain || req.get('x-tenant') || 'demo';

  return {
    req,
    res,
    user: req.user,
    tenant: tenantSubdomain,
  };
};
