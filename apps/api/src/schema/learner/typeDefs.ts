export const learnerTypeDefs = `
  enum CustomerSegmentId {
    ALL
    ACTIVE_LEARNERS
    AT_RISK
    HIGH_VALUE
    INACTIVE
  }

  type LearnerCourseProgress {
    enrollmentId: ID!
    courseId: ID!
    courseTitle: String!
    instructorName: String!
    progressPercent: Int!
    learningStatus: String!
    lastAccessedAt: Date
    completedAt: Date
    enrolledAt: Date!
    paymentStatus: String!
  }

  type LearnerDashboardStats {
    enrolledCount: Int!
    inProgressCount: Int!
    completedCount: Int!
    certificateCount: Int!
  }

  type LearnerDashboard {
    studentId: ID!
    courses: [LearnerCourseProgress!]!
    subscriptions: [LearnerSubscriptionRecord!]!
    stats: LearnerDashboardStats!
  }

  type CustomerSegmentSummary {
    segment: CustomerSegmentId!
    label: String!
    customerCount: Int!
    orderCount: Int!
    avgProgressPercent: Int!
  }

  type CustomerSegmentMember {
    customerId: ID!
    customerName: String!
    customerEmail: String!
    orderCount: Int!
    lastOrderAt: Date
    totalPaidCents: Int!
    avgProgressPercent: Int!
    segment: CustomerSegmentId!
  }

  extend type Query {
    learnerDashboard(tenantId: ID!, studentId: ID): LearnerDashboard!
    customerSegments(tenantId: ID!): [CustomerSegmentSummary!]!
    customersInSegment(tenantId: ID!, segment: CustomerSegmentId!): [CustomerSegmentMember!]!
  }
`;
