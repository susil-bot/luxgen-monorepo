export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: [
    'tenant:read',
    'tenant:write',
    'tenant:delete',
    'user:read',
    'user:write',
    'user:delete',
    'course:read',
    'course:write',
    'course:delete',
    'group:read',
    'group:write',
    'group:delete',
    'report:read',
    'report:write',
    'settings:read',
    'settings:write',
    'invite:send',
    'request:approve',
    'request:deny',
    'cross_tenant_access',
    'manage_all_tenants',
  ],
  [UserRole.ADMIN]: [
    'tenant:read',
    'user:read',
    'user:write',
    'user:delete',
    'course:read',
    'course:write',
    'course:delete',
    'group:read',
    'group:write',
    'group:delete',
    'report:read',
    'settings:read',
    'invite:send',
    'request:approve',
    'request:deny',
    'manage_tenant_users',
  ],
  [UserRole.USER]: [
    'course:read',
    'group:read',
    'profile:read',
    'profile:write',
  ],
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

export const isSuperAdmin = (role: UserRole): boolean => {
  return role === UserRole.SUPER_ADMIN;
};

export const isAdmin = (role: UserRole): boolean => {
  return role === UserRole.ADMIN;
};

export const isUser = (role: UserRole): boolean => {
  return role === UserRole.USER;
};

export const canManageTenants = (role: UserRole): boolean => {
  return role === UserRole.SUPER_ADMIN;
};

export const canManageUsers = (role: UserRole): boolean => {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};

export const canInviteUsers = (role: UserRole): boolean => {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};

export const canApproveRequests = (role: UserRole): boolean => {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};