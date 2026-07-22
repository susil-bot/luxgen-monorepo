import { gql } from '@apollo/client';
export const GET_COURSE_ANALYTICS = gql`
  query GetCourseAnalytics($tenantId: ID!, $days: Int) {
    courseAnalytics(tenantId: $tenantId, days: $days) {
      totalCourses
      totalEnrollments
      activeStudents
      completionRate
      averageRating
      revenueCents
      topCourses {
        id
        title
        enrollments
        completionRate
      }
      enrollmentTrends {
        label
        enrollments
      }
    }
  }
`;
export const GET_GROUP_ANALYTICS = gql`
  query GetGroupAnalytics($tenantId: ID!) {
    groupAnalytics(tenantId: $tenantId) {
      totalGroups
      activeGroups
      totalMembers
      averageMembersPerGroup
      topGroups {
        id
        name
        memberCount
        isActive
      }
    }
  }
`;
