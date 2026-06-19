'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.User = exports.UserStatus = exports.UserRole = void 0;
const mongoose_1 = require('mongoose');
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
const userSchema = new mongoose_1.Schema(
  {
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
      type: mongoose_1.Schema.Types.ObjectId,
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
      tenantRoles: [
        {
          tenantId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
          },
          role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
          },
          assignedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          assignedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);
exports.User = (0, mongoose_1.model)('User', userSchema);
