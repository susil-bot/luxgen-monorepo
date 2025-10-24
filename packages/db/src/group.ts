import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  tenant: string;
  createdBy: string;
  isActive: boolean;
  settings: {
    allowSelfJoin: boolean;
    requireApproval: boolean;
    maxMembers?: number;
    allowFileSharing: boolean;
    allowComments: boolean;
    allowNudges: boolean;
    canSendNudges: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupMember extends Document {
  _id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  isActive: boolean;
  permissions: {
    canInvite: boolean;
    canRemove: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>({
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
}, {
  timestamps: true,
});

const GroupMemberSchema = new Schema<IGroupMember>({
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
}, {
  timestamps: true,
});

// Indexes for better performance
GroupSchema.index({ tenant: 1, isActive: 1 });
GroupSchema.index({ createdBy: 1 });
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
GroupMemberSchema.index({ userId: 1, isActive: 1 });

export const Group = mongoose.model<IGroup>('Group', GroupSchema);
export const GroupMember = mongoose.model<IGroupMember>('GroupMember', GroupMemberSchema);
