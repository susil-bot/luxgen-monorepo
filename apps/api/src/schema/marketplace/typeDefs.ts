export const marketplaceTypeDefs = `
  enum TemplateCategory {
    ONBOARDING
    COMPLETION
    ENGAGEMENT
    RETENTION
    AGENT_OPS
    INTEGRATIONS
  }

  type AutomationTemplateAction {
    type: AutomationActionType!
    label: String!
    config: JSON
  }

  type AutomationTemplate {
    id: ID!
    slug: String!
    name: String!
    description: String!
    category: TemplateCategory!
    priceCents: Int!
    priceLabel: String!
    featured: Boolean!
    triggerType: AutomationTriggerType!
    triggerLabel: String!
    actions: [AutomationTemplateAction!]!
    installCount: Int!
    tags: [String!]!
  }

  type UsageLimitsStatus {
    automationRuns: Boolean!
    activeLearners: Boolean!
    automations: Boolean!
  }

  type UsagePercentUsed {
    automationRuns: Int!
    activeLearners: Int!
  }

  type TenantUsageSummary {
    tenantId: String!
    period: String!
    plan: PlanTier!
    automationRuns: Int!
    activeLearners: Int!
    agentTasks: Int!
    automationCount: Int!
    limits: PlanLimits!
    percentUsed: UsagePercentUsed!
    withinLimits: UsageLimitsStatus!
  }

  extend type Query {
    automationTemplates(category: TemplateCategory, featured: Boolean): [AutomationTemplate!]!
    automationTemplate(slug: String!): AutomationTemplate
    tenantUsage(tenantId: String!): TenantUsageSummary!
  }

  extend type Mutation {
    installAutomationTemplate(
      tenantId: String!
      slug: String!
      nameOverride: String
    ): Automation!
  }
`;
