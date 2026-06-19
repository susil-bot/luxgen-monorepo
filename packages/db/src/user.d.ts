import { Schema, Document } from 'mongoose';
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
export interface IUserPermissions {
  canManageUsers: boolean;
  canManageTenants: boolean;
  canManageCourses: boolean;
  canManageGroups: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canInviteUsers: boolean;
  canApproveRequests: boolean;
}
export interface IUserMetadata {
  lastLogin?: Date;
  loginCount: number;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    language: string;
  };
  permissions: IUserPermissions;
  tenantRoles: Array<{
    tenantId: Schema.Types.ObjectId;
    role: UserRole;
    assignedBy: Schema.Types.ObjectId;
    assignedAt: Date;
  }>;
}
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  tenant: Schema.Types.ObjectId;
  isActive: boolean;
  metadata: IUserMetadata;
  createdAt: Date;
  updatedAt: Date;
}
export declare const User: import('mongoose').Model<
  IUser,
  {},
  {},
  {},
  Document<unknown, {}, IUser> &
    IUser & {
      _id: import('mongoose').Types.ObjectId;
    },
  any
>;
