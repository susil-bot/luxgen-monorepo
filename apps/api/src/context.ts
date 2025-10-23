import { Request, Response } from 'express';
import { User } from '@luxgen/db';

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: User;
  tenant?: string;
}

export const context = ({ req, res }: { req: Request; res: Response }): GraphQLContext => {
  return {
    req,
    res,
    user: req.user,
    tenant: req.tenant,
  };
};
