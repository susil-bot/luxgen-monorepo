import { Request, Response } from 'express';
import { User, IUser } from '@luxgen/db';

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: IUser;
  tenant?: string;
}

export const context = ({ req, res }: { req: Request; res: Response }): GraphQLContext => {
  // For GraphQL requests, try to get tenant from headers or default to 'demo'
  let tenant = req.tenant;
  
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
