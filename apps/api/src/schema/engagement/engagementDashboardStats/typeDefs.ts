export const EngagementDashboardStatsTypeDefs = `
  type EngagementDashboardStats { enrolledCount: Int! inProgressCount: Int! completedCount: Int! certificateCount: Int! activeSubscriptionCount: Int! }
  extend type Query { engagementDashboardStats(tenantId: ID!): EngagementDashboardStats! }`;
