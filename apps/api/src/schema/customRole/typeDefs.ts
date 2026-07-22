export const customRoleTypeDefs = `
  type CustomRolePermissions { canManageUsers: Boolean! canManageCourses: Boolean! canManageGroups: Boolean! canViewReports: Boolean! canManageSettings: Boolean! }
  type CustomRole { id: ID! name: String! description: String permissions: CustomRolePermissions! createdAt: Date! updatedAt: Date! }
  input CustomRolePermissionsInput { canManageUsers: Boolean canManageCourses: Boolean canManageGroups: Boolean canViewReports: Boolean canManageSettings: Boolean }
  input CreateCustomRoleInput { tenantId: ID! name: String! description: String permissions: CustomRolePermissionsInput! }
  input UpdateCustomRoleInput { id: ID! name: String description: String permissions: CustomRolePermissionsInput }
  extend type Query { customRoles(tenantId: ID!): [CustomRole!]! customRole(id: ID!): CustomRole }
  extend type Mutation { createCustomRole(input: CreateCustomRoleInput!): CustomRole! updateCustomRole(input: UpdateCustomRoleInput!): CustomRole! deleteCustomRole(id: ID!): Boolean! }
`;
