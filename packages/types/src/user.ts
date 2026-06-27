export { UserRole, UserStatus } from '@luxgen/db';

import type { UserRole, UserStatus } from '@luxgen/db';

export interface TenantSummary {
  id: string;
  name: string;
  subdomain: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status?: UserStatus;
  tenant: TenantSummary;
}

export interface AuthPayload {
  token: string;
  user: User;
}
