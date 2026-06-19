import { Request, Response } from 'express';
import { IUser } from '@luxgen/db';
import type { AuthErrorCode } from './types/auth';
import { buildGraphQLContext } from './context/buildContext';

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: IUser;
  tenant?: string;
  authError?: AuthErrorCode;
}

export const context = ({ req, res }: { req: Request; res: Response }): GraphQLContext => {
  const tenantSubdomain = req.subdomain || req.tenant?.subdomain || req.get('x-tenant') || 'demo';

  return {
    req,
    res,
    user: req.user,
    tenant: tenantSubdomain,
    authError: req.authError,
  };
};

export { buildGraphQLContext };
