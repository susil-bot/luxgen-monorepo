export const userTypeDefs = `
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    status: UserStatus!
    isActive: Boolean!
    tenant: Tenant!
    phone: String
    marketingEmail: Boolean
    marketingSms: Boolean
    marketingWhatsapp: Boolean
    staffNotes: String
    createdAt: Date!
    updatedAt: Date!
  }

  enum UserRole {
    SUPER_ADMIN
    ADMIN
    INSTRUCTOR
    STUDENT
    USER
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    PENDING
    SUSPENDED
  }

  input CreateUserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    tenantId: ID!
  }

  input UpdateUserInput {
    email: String
    firstName: String
    lastName: String
    role: UserRole
    phone: String
    marketingEmail: Boolean
    marketingSms: Boolean
    marketingWhatsapp: Boolean
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    user(id: ID!): User
    users(tenantId: ID!): [User!]!
    customers(tenantId: ID!, search: String): [User!]!
    currentUser: User
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    login(input: LoginInput!): AuthPayload!
    register(input: CreateUserInput!): AuthPayload!
    registerPushToken(token: String!): Boolean!
  }
`;
