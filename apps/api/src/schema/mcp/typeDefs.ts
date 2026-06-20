export const mcpTypeDefs = `
  enum McpApiKeyScope {
    READ
    WRITE
  }

  type McpApiKey {
    id: ID!
    tenantId: String!
    name: String!
    scopes: [McpApiKeyScope!]!
    keyPrefix: String!
    createdAt: Date!
    revokedAt: Date
    lastUsedAt: Date
  }

  type McpApiKeyCreateResult {
    key: McpApiKey!
    secret: String!
  }

  type McpKeyContext {
    keyId: ID!
    tenantId: String!
    name: String!
    scopes: [McpApiKeyScope!]!
  }

  type McpToolAuditEntry {
    id: ID!
    tenantId: String!
    keyId: String
    userId: String
    tool: String!
    success: Boolean!
    durationMs: Int!
    error: String
    timestamp: Date!
  }

  input RecordMcpToolAuditInput {
    tenantId: String!
    tool: String!
    success: Boolean!
    durationMs: Int!
    error: String
  }

  extend type Query {
    mcpApiKeys(tenantId: String!): [McpApiKey!]!
    mcpKeyContext: McpKeyContext
    mcpToolAuditLog(tenantId: String!, limit: Int): [McpToolAuditEntry!]!
  }

  extend type Mutation {
    createMcpApiKey(tenantId: String!, name: String!, scopes: [McpApiKeyScope!]!): McpApiKeyCreateResult!
    revokeMcpApiKey(id: ID!): McpApiKey
    recordMcpToolAudit(input: RecordMcpToolAuditInput!): Boolean!
  }
`;
