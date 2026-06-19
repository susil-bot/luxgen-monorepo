'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.GroupMember = exports.Group = void 0;
const mongoose_1 = __importStar(require('mongoose'));
const GroupSchema = new mongoose_1.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true },
    icon: { type: String, trim: true },
    tenant: { type: String, required: true, index: true },
    createdBy: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true },
    settings: {
      allowSelfJoin: { type: Boolean, default: false },
      requireApproval: { type: Boolean, default: true },
      maxMembers: { type: Number },
      allowFileSharing: { type: Boolean, default: true },
      allowComments: { type: Boolean, default: true },
      allowNudges: { type: Boolean, default: true },
      canSendNudges: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  },
);
const GroupMemberSchema = new mongoose_1.Schema(
  {
    groupId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    permissions: {
      canInvite: { type: Boolean, default: false },
      canRemove: { type: Boolean, default: false },
      canEdit: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  },
);
// Indexes for better performance
GroupSchema.index({ tenant: 1, isActive: 1 });
GroupSchema.index({ createdBy: 1 });
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
GroupMemberSchema.index({ userId: 1, isActive: 1 });
exports.Group = mongoose_1.default.model('Group', GroupSchema);
exports.GroupMember = mongoose_1.default.model('GroupMember', GroupMemberSchema);
