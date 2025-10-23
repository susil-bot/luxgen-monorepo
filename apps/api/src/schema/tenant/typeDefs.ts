export const tenantTypeDefs = `
  type Tenant {
    id: ID!
    name: String!
    subdomain: String!
    settings: JSON
    createdAt: Date!
    updatedAt: Date!
  }

  input CreateTenantInput {
    name: String!
    subdomain: String!
    settings: JSON
  }

  input UpdateTenantInput {
    name: String
    subdomain: String
    settings: JSON
  }

  extend type Query {
    tenant(id: ID!): Tenant
    tenantBySubdomain(subdomain: String!): Tenant
    tenants: [Tenant!]!
  }

  extend type Mutation {
    createTenant(input: CreateTenantInput!): Tenant!
    updateTenant(id: ID!, input: UpdateTenantInput!): Tenant!
    deleteTenant(id: ID!): Boolean!
  }
`;
