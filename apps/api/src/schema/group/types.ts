export enum GroupMemberRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export interface GroupNotificationSettingsInput {
  onMemberJoin?: boolean;
  onMemberLeave?: boolean;
  onTrainingUpdate?: boolean;
  onNudgeSent?: boolean;
  onReportGenerated?: boolean;
}

export interface GroupSettingsInput {
  allowSelfJoin?: boolean;
  requireApproval?: boolean;
  maxMembers?: number;
  allowFileSharing?: boolean;
  allowComments?: boolean;
  allowNudges?: boolean;
  canSendNudges?: boolean;
  notifications?: GroupNotificationSettingsInput;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  settings?: GroupSettingsInput;
}

export interface UpdateGroupInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  settings?: GroupSettingsInput;
}

export interface AddGroupMemberInput {
  groupId: string;
  userId: string;
  role?: GroupMemberRole;
}

export interface RemoveGroupMemberInput {
  groupId: string;
  userId: string;
}

export interface GroupMemberPermissionsInput {
  canInviteMembers?: boolean;
  canRemoveMembers?: boolean;
  canEditGroup?: boolean;
  canViewReports?: boolean;
  canManageTraining?: boolean;
  canSendNudges?: boolean;
}

export interface UpdateGroupMemberInput {
  groupId: string;
  userId: string;
  role?: GroupMemberRole;
  permissions?: GroupMemberPermissionsInput;
}

export interface GroupsQueryArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  search?: string;
  isActive?: boolean;
  createdBy?: string;
}

export interface GroupMembersQueryArgs {
  groupId: string;
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  role?: GroupMemberRole;
  isActive?: boolean;
}

export interface UserGroupsQueryArgs {
  userId: string;
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  role?: GroupMemberRole;
  isActive?: boolean;
}

/** Minimal parent shape returned by GroupService field mappers. */
export interface GroupParent {
  id: string;
}

/** Minimal parent shape returned by GroupService member mappers. */
export interface GroupMemberParent {
  id: string;
}
