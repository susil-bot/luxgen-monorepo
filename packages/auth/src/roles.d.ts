export declare enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}
export declare enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}
export declare const ROLE_PERMISSIONS: {
  SUPER_ADMIN: string[];
  ADMIN: string[];
  USER: string[];
};
export declare const hasPermission: (role: UserRole, permission: string) => boolean;
export declare const isSuperAdmin: (role: UserRole) => boolean;
export declare const isAdmin: (role: UserRole) => boolean;
export declare const isUser: (role: UserRole) => boolean;
export declare const canManageTenants: (role: UserRole) => boolean;
export declare const canManageUsers: (role: UserRole) => boolean;
export declare const canInviteUsers: (role: UserRole) => boolean;
export declare const canApproveRequests: (role: UserRole) => boolean;
