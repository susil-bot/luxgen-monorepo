/** Mirror `@luxgen/db` enums — defined here so mobile clients avoid mongoose. */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  /** @deprecated Use STUDENT — kept for legacy seed data */
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

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
