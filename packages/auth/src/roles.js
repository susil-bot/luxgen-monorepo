'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.canApproveRequests =
  exports.canInviteUsers =
  exports.canManageUsers =
  exports.canManageTenants =
  exports.isUser =
  exports.isAdmin =
  exports.isSuperAdmin =
  exports.hasPermission =
  exports.ROLE_PERMISSIONS =
  exports.UserStatus =
  exports.UserRole =
    void 0;
var UserRole;
(function (UserRole) {
  UserRole['SUPER_ADMIN'] = 'SUPER_ADMIN';
  UserRole['ADMIN'] = 'ADMIN';
  UserRole['USER'] = 'USER';
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
  UserStatus['ACTIVE'] = 'ACTIVE';
  UserStatus['INACTIVE'] = 'INACTIVE';
  UserStatus['PENDING'] = 'PENDING';
  UserStatus['SUSPENDED'] = 'SUSPENDED';
})(UserStatus || (exports.UserStatus = UserStatus = {}));
exports.ROLE_PERMISSIONS = {
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
  [UserRole.USER]: ['course:read', 'group:read', 'profile:read', 'profile:write'],
};
const hasPermission = (role, permission) => {
  return exports.ROLE_PERMISSIONS[role]?.includes(permission) || false;
};
exports.hasPermission = hasPermission;
const isSuperAdmin = (role) => {
  return role === UserRole.SUPER_ADMIN;
};
exports.isSuperAdmin = isSuperAdmin;
const isAdmin = (role) => {
  return role === UserRole.ADMIN;
};
exports.isAdmin = isAdmin;
const isUser = (role) => {
  return role === UserRole.USER;
};
exports.isUser = isUser;
const canManageTenants = (role) => {
  return role === UserRole.SUPER_ADMIN;
};
exports.canManageTenants = canManageTenants;
const canManageUsers = (role) => {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};
exports.canManageUsers = canManageUsers;
const canInviteUsers = (role) => {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};
exports.canInviteUsers = canInviteUsers;
const canApproveRequests = (role) => {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
};
exports.canApproveRequests = canApproveRequests;
