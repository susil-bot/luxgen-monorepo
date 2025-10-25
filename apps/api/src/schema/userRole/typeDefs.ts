export const userRoleTypeDefs = `
  enum UserRole {
    SUPER_ADMIN
    ADMIN
    USER
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    PENDING
    SUSPENDED
  }

  type UserPermissions {
    canManageUsers: Boolean!
    canManageTenants: Boolean!
    canManageCourses: Boolean!
    canManageGroups: Boolean!
    canViewReports: Boolean!
    canManageSettings: Boolean!
    canInviteUsers: Boolean!
    canApproveRequests: Boolean!
  }

  type UserMetadata {
    lastLogin: Date
    loginCount: Int!
    preferences: UserPreferences!
    permissions: UserPermissions!
    tenantRoles: [TenantRole!]!
  }

  type UserPreferences {
    theme: String!
    notifications: Boolean!
    language: String!
  }

  type TenantRole {
    tenantId: ID!
    role: UserRole!
    assignedBy: ID!
    assignedAt: Date!
  }

  type User {
    id: ID!
    email: String!
    username: String  
    firstName: String!
    lastName: String!
    role: UserRole!
    status: UserStatus!
    tenant: Tenant!
    isActive: Boolean!
    metadata: UserMetadata!
    createdAt: Date!
    updatedAt: Date!
  }

  type UserInvitation {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    tenant: Tenant!
    invitedBy: User!
    invitedAt: Date!
    status: String!
    expiresAt: Date!
  }

  type RoleAssignment {
    id: ID!
    user: User!
    newRole: UserRole!
    previousRole: UserRole!
    assignedBy: User!
    assignedAt: Date!
    reason: String
  }

  input UserRegistrationInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    tenantId: ID!
    invitedBy: ID
    metadata: UserMetadataInput
  }

  input UserMetadataInput {
    preferences: UserPreferencesInput
  }

  input UserPreferencesInput {
    theme: String
    notifications: Boolean
    language: String
  }

  input UserPermissionsInput {
    canManageUsers: Boolean
    canManageTenants: Boolean
    canManageCourses: Boolean
    canManageGroups: Boolean
    canViewReports: Boolean
    canManageSettings: Boolean
    canInviteUsers: Boolean
    canApproveRequests: Boolean
  }

  input UserInvitationInput {
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    tenantId: ID!
  }

  input RoleUpdateInput {
    userId: ID!
    newRole: UserRole!
    reason: String
  }

  type UserRegistrationResult {
    success: Boolean!
    message: String!
    user: User
    errors: JSON
  }

  type UserInvitationResult {
    success: Boolean!
    message: String!
    invitation: UserInvitation
    tempPassword: String
    errors: JSON
  }

  type RoleUpdateResult {
    success: Boolean!
    message: String!
    assignment: RoleAssignment
    errors: JSON
  }

  extend type Query {
    getUsers(tenantId: ID, role: UserRole, status: UserStatus, limit: Int, offset: Int): [User!]!
    getUserById(userId: ID!): User
    getUsersByRole(role: UserRole!, tenantId: ID): [User!]!
    getPendingUsers(tenantId: ID): [User!]!
    getUserPermissions(userId: ID!): UserPermissions!
    getRoleAssignments(userId: ID!): [RoleAssignment!]!
    getTenantAdmins(tenantId: ID!): [User!]!
    getUserInvitations(tenantId: ID, status: String): [UserInvitation!]!
  }

  extend type Mutation {
    registerUser(input: UserRegistrationInput!): UserRegistrationResult!
    inviteUser(input: UserInvitationInput!): UserInvitationResult!
    updateUserRole(input: RoleUpdateInput!): RoleUpdateResult!
    activateUser(userId: ID!): UserRegistrationResult!
    deactivateUser(userId: ID!): UserRegistrationResult!
    suspendUser(userId: ID!, reason: String): UserRegistrationResult!
    updateUserPermissions(userId: ID!, permissions: UserPermissionsInput!): UserRegistrationResult!
    assignTenantRole(userId: ID!, tenantId: ID!, role: UserRole!): RoleUpdateResult!
    removeTenantRole(userId: ID!, tenantId: ID!): RoleUpdateResult!
    bulkUpdateUserRoles(updates: [RoleUpdateInput!]!): [RoleUpdateResult!]!
  }
`;
