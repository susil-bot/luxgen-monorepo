export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    'tenant:read',
    'tenant:write',
    'tenant:delete',
    'user:read',
    'user:write',
    'user:delete',
    'course:read',
    'course:write',
    'course:delete',
  ],
  [UserRole.INSTRUCTOR]: [
    'course:read',
    'course:write',
    'user:read',
  ],
  [UserRole.STUDENT]: [
    'course:read',
  ],
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

export const isAdmin = (role: UserRole): boolean => {
  return role === UserRole.ADMIN;
};

export const isInstructor = (role: UserRole): boolean => {
  return role === UserRole.INSTRUCTOR;
};

export const isStudent = (role: UserRole): boolean => {
  return role === UserRole.STUDENT;
};
