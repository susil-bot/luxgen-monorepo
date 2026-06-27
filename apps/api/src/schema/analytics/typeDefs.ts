export const analyticsTypeDefs = `
  type CourseAnalyticsTopCourse { id: ID! title: String! enrollments: Int! completionRate: Int! }
  type EnrollmentTrendPoint { label: String! enrollments: Int! }
  type CourseAnalyticsSummary { totalCourses: Int! totalEnrollments: Int! activeStudents: Int! completionRate: Int! averageRating: Int! revenueCents: Int! topCourses: [CourseAnalyticsTopCourse!]! enrollmentTrends: [EnrollmentTrendPoint!]! }
  type GroupAnalyticsTopGroup { id: ID! name: String! memberCount: Int! isActive: Boolean! }
  type GroupAnalyticsSummary { totalGroups: Int! activeGroups: Int! totalMembers: Int! averageMembersPerGroup: Int! topGroups: [GroupAnalyticsTopGroup!]! }
  extend type Query { courseAnalytics(tenantId: ID!, days: Int): CourseAnalyticsSummary! groupAnalytics(tenantId: ID!): GroupAnalyticsSummary! }
`;
