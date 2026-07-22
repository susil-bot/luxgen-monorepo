export const billingTypeDefs = `
  enum PlanTier {
    FREE
    STARTER
    PRO
    BUSINESS
    ENTERPRISE
  }

  enum SubscriptionStatus {
    active
    trialing
    past_due
    canceled
    incomplete
    incomplete_expired
    unpaid
    paused
  }

  type PlanLimits {
    maxLearners: Int!
    maxAutomations: Int!
    maxAutomationRunsPerMonth: Int!
  }

  type PlanFeatureFlags {
    automations: Boolean!
    analytics: Boolean!
    project: Boolean!
    webhooks: Boolean!
    customDomain: Boolean!
    agentStudio: Boolean!
    mobileApp: Boolean!
    apiAccess: Boolean!
  }

  type PricingPlan {
    id: PlanTier!
    name: String!
    priceMonthly: Int!
    description: String!
    features: [String!]!
    limits: PlanLimits!
  }

  type TenantBilling {
    tenantId: String!
    plan: PlanTier!
    planName: String!
    priceMonthly: Int!
    subscriptionStatus: SubscriptionStatus!
    stripeConfigured: Boolean!
    stripeCustomerId: String
    currentPeriodEnd: Date
    cancelAtPeriodEnd: Boolean!
    limits: PlanLimits!
    features: [String!]!
    featureFlags: PlanFeatureFlags!
  }

  type CheckoutSession {
    url: String!
    sessionId: String!
  }

  type BillingPortalSession {
    url: String!
  }

  extend type Query {
    tenantBilling(tenantId: String!): TenantBilling!
    pricingPlans: [PricingPlan!]!
  }

  extend type Mutation {
    createCheckoutSession(
      tenantId: String!
      plan: PlanTier!
      successUrl: String!
      cancelUrl: String!
    ): CheckoutSession!
    createBillingPortalSession(tenantId: String!, returnUrl: String!): BillingPortalSession!
    setTenantPlanDev(tenantId: String!, plan: PlanTier!): TenantBilling!
  }
`;
