export const LearnerStreakTypeDefs = `
  type LearnerStreak { streakDays: Int! lastActiveAt: Date }
  extend type Query { learnerStreak(tenantId: ID!): LearnerStreak! }`;
