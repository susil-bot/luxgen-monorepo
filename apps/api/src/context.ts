import { Request, Response } from 'express';
import { User, IUser } from '@luxgen/db';

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: IUser;
  tenant?: string;
}

export const context = ({ req, res }: { req: Request; res: Response }): GraphQLContext => {
  // GraphQLContext.tenant is a plain subdomain/identifier string (consumed
  // as such by dashboard and userRole resolvers, e.g. getDashboardStats(tenantId)).
  // That's a different shape from req.tenant, which tenantRoutingMiddleware
  // (middleware/tenantRouting.ts) sets to the full populated ITenant document.
  // Use req.subdomain - the string form the same middleware already derived -
  // rather than req.tenant, and fall back to headers / 'demo' as before.
  let tenant = req.subdomain;

  if (!tenant) {
    // Check for tenant in headers
    const tenantHeader = req.get('x-tenant');
    if (tenantHeader) {
      tenant = tenantHeader;
    } else {
      // Default to demo tenant for GraphQL requests
      tenant = 'demo';
    }
  }
  
  return {
    req,
    res,
    user: req.user,
    tenant,
  };
};
