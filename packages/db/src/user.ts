import { Schema, model, Document } from 'mongoose';

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

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.PENDING,
  },
  tenant: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  metadata: {
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    permissions: {
      canManageUsers: {
        type: Boolean,
        default: false,
      },
      canManageTenants: {
        type: Boolean,
        default: false,
      },
      canManageCourses: {
        type: Boolean,
        default: false,
      },
      canManageGroups: {
        type: Boolean,
        default: false,
      },
      canViewReports: {
        type: Boolean,
        default: false,
      },
      canManageSettings: {
        type: Boolean,
        default: false,
      },
      canInviteUsers: {
        type: Boolean,
        default: false,
      },
      canApproveRequests: {
        type: Boolean,
        default: false,
      },
    },
    tenantRoles: [{
      tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
      },
      role: {
        type: String,
        enum: Object.values(UserRole),
        required: true,
      },
      assignedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      assignedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
}, {
  timestamps: true,
});

export const User = model<IUser>('User', userSchema);
