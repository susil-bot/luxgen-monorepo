import { IUser, ITenant } from '@luxgen/db';
import { UserRole } from '@luxgen/auth';
import type { AuthErrorCode } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tenant?: ITenant;
      tenantId?: string;
      subdomain?: string;
      isCustomDomain?: boolean;
      tenantContext?: string;
      authError?: AuthErrorCode;
    }
  }
}
