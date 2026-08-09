export const funnelTemplateTypeDefs = `
  """T-VERT-06 — data-only vertical bundle: vocabulary preset + feature flags + automation templates."""
  type FunnelStage {
    stage: String!
    description: String!
  }

  type FunnelTemplate {
    id: ID!
    slug: String!
    name: String!
    description: String!
    industry: [String!]!
    vocabularyPreset: JSON!
    enabledModules: [String!]!
    automationTemplateSlugs: [String!]!
    funnelStages: [FunnelStage!]!
    installCount: Int!
  }

  extend type Query {
    funnelTemplates(industry: String): [FunnelTemplate!]!
    funnelTemplate(slug: String!): FunnelTemplate
  }

  extend type Mutation {
    """Applies the template's vocabulary + feature flags + installs its automation templates."""
    installFunnelTemplate(tenantId: ID!, slug: String!): FunnelTemplate!
  }
`;
