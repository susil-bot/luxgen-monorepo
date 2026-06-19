export const userTypeDefs = `
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    tenant: Tenant!
    phone: String
    marketingEmail: Boolean
    marketingSms: Boolean
    marketingWhatsapp: Boolean
    createdAt: Date!
    updatedAt: Date!
  }

  enum UserRole {
    ADMIN
    INSTRUCTOR
    STUDENT
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
    currentUser: User
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    login(input: LoginInput!): AuthPayload!
    register(input: CreateUserInput!): AuthPayload!
  }
`;
