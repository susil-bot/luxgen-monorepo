export const dashboardTypeDefs = `
  type DashboardStats {
    totalCourses: Int!
    activeStudents: Int!
    completionRate: Float!
    totalGroups: Int!
    pendingRequests: Int!
    recentActivities: Int!
  }

  type UserRetentionData {
    period: String!
    retention: Float!
    users: Int!
  }

  type EngagementBreakdownData {
    category: String!
    value: Float!
    color: String!
  }

  type EngagementTrendData {
    date: String!
    activeUsers: Int!
    completedCourses: Int!
    newUsers: Int!
  }

  type RecentActivity {
    id: ID!
    type: String!
    title: String!
    description: String!
    user: String!
    userAvatar: String
    timestamp: String!
    status: String
    metadata: JSON
  }

  type SurveyData {
    id: ID!
    title: String!
    description: String!
    status: String!
    progress: Float!
    totalQuestions: Int!
    completedQuestions: Int!
    createdAt: String!
    expiresAt: String
    responses: Int!
  }

  type PermissionRequest {
    id: ID!
    user: String!
    userAvatar: String
    requestType: String!
    description: String!
    status: String!
    requestedAt: String!
    metadata: JSON
  }

  type DashboardData {
    stats: DashboardStats!
    userRetention: [UserRetentionData!]!
    engagementBreakdown: [EngagementBreakdownData!]!
    engagementTrends: [EngagementTrendData!]!
    recentActivities: [RecentActivity!]!
    lastSurvey: SurveyData
    permissionRequests: [PermissionRequest!]!
  }

  extend type Query {
    getDashboardData(tenant: String): DashboardData!
    getDashboardStats(tenant: String): DashboardStats!
    getUserRetentionData(tenant: String, period: String): [UserRetentionData!]!
    getEngagementBreakdown(tenant: String): [EngagementBreakdownData!]!
    getEngagementTrends(tenant: String, days: Int): [EngagementTrendData!]!
    getRecentActivities(tenant: String, limit: Int): [RecentActivity!]!
    getLastSurvey(tenant: String): SurveyData
    getPermissionRequests(tenant: String, status: String, limit: Int): [PermissionRequest!]!
  }
`;
