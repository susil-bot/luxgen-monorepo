import { UserRole, UserStatus } from '@luxgen/db';

export { UserRole, UserStatus };

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.INSTRUCTOR]: 3,
  [UserRole.STUDENT]: 2,
  [UserRole.USER]: 2,
};

export const hasRoleAtLeast = (userRole: UserRole, minimumRole: UserRole): boolean => {
  const userRank = ROLE_RANK[userRole];
  const minimumRank = ROLE_RANK[minimumRole];
  if (userRank === undefined || minimumRank === undefined) return false;
  return userRank >= minimumRank;
};

const LEARNER_PERMISSIONS = ['course:read', 'group:read', 'profile:read', 'profile:write'];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
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
  [UserRole.INSTRUCTOR]: ['course:read', 'course:write', 'group:read', 'profile:read', 'profile:write', 'report:read'],
  [UserRole.STUDENT]: LEARNER_PERMISSIONS,
  [UserRole.USER]: LEARNER_PERMISSIONS,
};

export const hasPermission = (role: UserRole, permission: string): boolean =>
  ROLE_PERMISSIONS[role]?.includes(permission) || false;

export const isSuperAdmin = (role: UserRole): boolean => role === UserRole.SUPER_ADMIN;
export const isAdmin = (role: UserRole): boolean => role === UserRole.ADMIN;
export const isUser = (role: UserRole): boolean => role === UserRole.USER || role === UserRole.STUDENT;
export const canManageTenants = (role: UserRole): boolean => role === UserRole.SUPER_ADMIN;
export const canManageUsers = (role: UserRole): boolean => role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
export const canInviteUsers = (role: UserRole): boolean => role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
export const canApproveRequests = (role: UserRole): boolean => role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
