import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData($tenant: String) {
    getDashboardData(tenant: $tenant) {
      stats {
        totalCourses
        activeStudents
        completionRate
        totalGroups
        pendingRequests
        recentActivities
      }
      userRetention {
        period
        retention
        users
      }
      engagementBreakdown {
        category
        value
        color
      }
      engagementTrends {
        date
        activeUsers
        completedCourses
        newUsers
      }
      recentActivities {
        id
        type
        title
        description
        user
        userAvatar
        timestamp
        status
        metadata
      }
      lastSurvey {
        id
        title
        description
        status
        progress
        totalQuestions
        completedQuestions
        createdAt
        expiresAt
        responses
      }
      permissionRequests {
        id
        user
        userAvatar
        requestType
        description
        status
        requestedAt
        metadata
      }
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($tenant: String) {
    getDashboardStats(tenant: $tenant) {
      totalCourses
      activeStudents
      completionRate
      totalGroups
      pendingRequests
      recentActivities
    }
  }
`;

export const GET_USER_RETENTION_DATA = gql`
  query GetUserRetentionData($tenant: String, $period: String) {
    getUserRetentionData(tenant: $tenant, period: $period) {
      period
      retention
      users
    }
  }
`;

export const GET_ENGAGEMENT_BREAKDOWN = gql`
  query GetEngagementBreakdown($tenant: String) {
    getEngagementBreakdown(tenant: $tenant) {
      category
      value
      color
    }
  }
`;

export const GET_ENGAGEMENT_TRENDS = gql`
  query GetEngagementTrends($tenant: String, $days: Int) {
    getEngagementTrends(tenant: $tenant, days: $days) {
      date
      activeUsers
      completedCourses
      newUsers
    }
  }
`;

export const GET_RECENT_ACTIVITIES = gql`
  query GetRecentActivities($tenant: String, $limit: Int) {
    getRecentActivities(tenant: $tenant, limit: $limit) {
      id
      type
      title
      description
      user
      userAvatar
      timestamp
      status
      metadata
    }
  }
`;

export const GET_LAST_SURVEY = gql`
  query GetLastSurvey($tenant: String) {
    getLastSurvey(tenant: $tenant) {
      id
      title
      description
      status
      progress
      totalQuestions
      completedQuestions
      createdAt
      expiresAt
      responses
    }
  }
`;

export const GET_PERMISSION_REQUESTS = gql`
  query GetPermissionRequests($tenant: String, $status: String, $limit: Int) {
    getPermissionRequests(tenant: $tenant, status: $status, limit: $limit) {
      id
      user
      userAvatar
      requestType
      description
      status
      requestedAt
      metadata
    }
  }
`;
