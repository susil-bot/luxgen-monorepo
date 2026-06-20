export const storefrontTypeDefs = `
  type StorefrontProduct {
    id: ID!
    title: String!
    description: String!
    status: String!
    priceCents: Int!
    currency: String!
    instructorName: String
    enrollmentCount: Int!
    tenantId: ID!
  }

  type StorefrontCollection {
    id: ID!
    name: String!
    description: String!
    color: String
    icon: String
    memberCount: Int!
    tenantId: ID!
  }

  type StorefrontBundle {
    id: ID!
    title: String!
    description: String!
    slug: String!
    courseIds: [ID!]!
    priceCents: Int!
    currency: String!
    billingInterval: String!
    status: String!
  }

  type LearnerSubscriptionRecord {
    id: ID!
    status: String!
    currentPeriodEnd: Date
    bundle: StorefrontBundle
  }

  type SubscribeToBundleResult {
    subscriptionId: ID!
    alreadySubscribed: Boolean!
    bundleId: ID!
  }

  extend type Query {
    storefrontProducts(tenantId: ID!): [StorefrontProduct!]!
    storefrontProduct(id: ID!): StorefrontProduct
    storefrontCollections(tenantId: ID!): [StorefrontCollection!]!
    storefrontCollection(id: ID!, tenantId: ID!): StorefrontCollection
    storefrontBundles(tenantId: ID!): [StorefrontBundle!]!
    storefrontBundle(id: ID!, tenantId: ID!): StorefrontBundle
    learnerSubscriptions(tenantId: ID!): [LearnerSubscriptionRecord!]!
  }

  extend type Mutation {
    subscribeToBundle(bundleId: ID!): SubscribeToBundleResult!
    cancelLearnerSubscription(subscriptionId: ID!): Boolean!
  }
`;
