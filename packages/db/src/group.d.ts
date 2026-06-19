import mongoose, { Document } from 'mongoose';
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
export declare const Group: mongoose.Model<
  IGroup,
  {},
  {},
  {},
  mongoose.Document<unknown, {}, IGroup> &
    IGroup &
    Required<{
      _id: string;
    }>,
  any
>;
export declare const GroupMember: mongoose.Model<
  IGroupMember,
  {},
  {},
  {},
  mongoose.Document<unknown, {}, IGroupMember> &
    IGroupMember &
    Required<{
      _id: string;
    }>,
  any
>;
