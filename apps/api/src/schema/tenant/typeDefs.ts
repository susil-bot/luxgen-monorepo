export const tenantTypeDefs = `
  """T-VERT-01 — per-tenant display-name overrides. Internal names never change."""
  type TenantVocabulary {
    course: String!
    enrollment: String!
    student: String!
    instructor: String!
    certificate: String!
    group: String!
    order: String!
    product: String!
  }

  input TenantVocabularyInput {
    course: String
    enrollment: String
    student: String
    instructor: String
    certificate: String
    group: String
    order: String
    product: String
  }

  type Tenant {
    id: ID!
    name: String!
    subdomain: String!
    settings: JSON
    vocabulary: TenantVocabulary!
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
    """Partial update — omitted terms keep their current value (server-side merge, not replace)."""
    updateTenantVocabulary(tenantId: ID!, vocabulary: TenantVocabularyInput!): TenantVocabulary!
  }
`;
