import { Request, Response } from 'express';
import { IUser, ITenant } from '@luxgen/db';
import type { AuthErrorCode } from './types/auth';
import type { VerifiedMcpApiKey } from './services/mcpApiKeyService';
import { buildGraphQLContext } from './context/buildContext';

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: IUser;
  /** Subdomain string — kept for backward compatibility with existing resolvers */
  tenant?: string;
  /** Full tenant document resolved by tenantRoutingMiddleware (available on HTTP requests) */
  tenantDoc?: ITenant;
  /** MongoDB ObjectId string for the resolved tenant */
  tenantId?: string;
  authError?: AuthErrorCode;
  mcpApiKey?: VerifiedMcpApiKey;
}

export const context = ({ req, res }: { req: Request; res: Response }): GraphQLContext => {
  const tenantSubdomain = req.subdomain || req.tenant?.subdomain || req.get('x-tenant') || 'demo';

  return {
    req,
    res,
    user: req.user,
    tenant: tenantSubdomain,
    tenantDoc: req.tenant,
    tenantId: req.tenantId,
    authError: req.authError,
    mcpApiKey: req.mcpApiKey,
  };
};

export { buildGraphQLContext };
