export const groupTypeDefs = `
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Group {
    id: ID!
    name: String!
    description: String
    color: String
    icon: String
    tenant: Tenant!
    createdBy: User!
    members: [User!]!
    memberCount: Int!
    isActive: Boolean!
    settings: GroupSettings
    createdAt: Date!
    updatedAt: Date!
  }

  type GroupSettings {
    allowSelfJoin: Boolean!
    requireApproval: Boolean!
    maxMembers: Int
    allowFileSharing: Boolean!
    allowComments: Boolean!
    allowNudges: Boolean!
    canSendNudges: Boolean!
    notifications: GroupNotificationSettings
  }

  type GroupNotificationSettings {
    onMemberJoin: Boolean!
    onMemberLeave: Boolean!
    onTrainingUpdate: Boolean!
    onNudgeSent: Boolean!
    onReportGenerated: Boolean!
  }

  type GroupMember {
    id: ID!
    user: User!
    group: Group!
    role: GroupMemberRole!
    joinedAt: Date!
    isActive: Boolean!
    permissions: GroupMemberPermissions
  }

  type GroupMemberPermissions {
    canInviteMembers: Boolean!
    canRemoveMembers: Boolean!
    canEditGroup: Boolean!
    canViewReports: Boolean!
    canManageTraining: Boolean!
    canSendNudges: Boolean!
  }

  enum GroupMemberRole {
    ADMIN
    MODERATOR
    MEMBER
  }

  input CreateGroupInput {
    name: String!
    description: String
    color: String
    icon: String
    settings: GroupSettingsInput
  }

  input GroupSettingsInput {
    allowSelfJoin: Boolean
    requireApproval: Boolean
    maxMembers: Int
    allowFileSharing: Boolean
    allowComments: Boolean
    allowNudges: Boolean
    canSendNudges: Boolean
    notifications: GroupNotificationSettingsInput
  }

  input GroupNotificationSettingsInput {
    onMemberJoin: Boolean
    onMemberLeave: Boolean
    onTrainingUpdate: Boolean
    onNudgeSent: Boolean
    onReportGenerated: Boolean
  }

  input UpdateGroupInput {
    id: ID!
    name: String
    description: String
    color: String
    icon: String
    settings: GroupSettingsInput
  }

  input AddGroupMemberInput {
    groupId: ID!
    userId: ID!
    role: GroupMemberRole
  }

  input RemoveGroupMemberInput {
    groupId: ID!
    userId: ID!
  }

  input UpdateGroupMemberInput {
    groupId: ID!
    userId: ID!
    role: GroupMemberRole
    permissions: GroupMemberPermissionsInput
  }

  input GroupMemberPermissionsInput {
    canInviteMembers: Boolean
    canRemoveMembers: Boolean
    canEditGroup: Boolean
    canViewReports: Boolean
    canManageTraining: Boolean
    canSendNudges: Boolean
  }

  type GroupConnection {
    edges: [GroupEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type GroupEdge {
    node: Group!
    cursor: String!
  }

  type GroupMemberConnection {
    edges: [GroupMemberEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type GroupMemberEdge {
    node: GroupMember!
    cursor: String!
  }

  extend type Query {
    groups(
      first: Int
      after: String
      last: Int
      before: String
      search: String
      isActive: Boolean
      createdBy: ID
    ): GroupConnection!
    
    group(id: ID!): Group
    
    groupMembers(
      groupId: ID!
      first: Int
      after: String
      last: Int
      before: String
      role: GroupMemberRole
      isActive: Boolean
    ): GroupMemberConnection!
    
    userGroups(
      userId: ID!
      first: Int
      after: String
      last: Int
      before: String
      role: GroupMemberRole
      isActive: Boolean
    ): GroupConnection!
  }

  extend type Mutation {
    createGroup(input: CreateGroupInput!): Group!
    updateGroup(input: UpdateGroupInput!): Group!
    deleteGroup(id: ID!): Boolean!
    
    addGroupMember(input: AddGroupMemberInput!): GroupMember!
    removeGroupMember(input: RemoveGroupMemberInput!): Boolean!
    updateGroupMember(input: UpdateGroupMemberInput!): GroupMember!
    
    joinGroup(groupId: ID!): GroupMember!
    leaveGroup(groupId: ID!): Boolean!
    
    bulkAddGroupMembers(
      groupId: ID!
      userIds: [ID!]!
      role: GroupMemberRole
    ): [GroupMember!]!
    
    bulkRemoveGroupMembers(
      groupId: ID!
      userIds: [ID!]!
    ): Boolean!
  }
`;
