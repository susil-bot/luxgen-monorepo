import { IUser, ITenant } from '@luxgen/db';
import { UserRole } from '@luxgen/auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tenant?: ITenant;
      tenantId?: string;
      subdomain?: string;
      isCustomDomain?: boolean;
      tenantContext?: string;
    }
  }
}
