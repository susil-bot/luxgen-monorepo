import { gql } from '@apollo/client';

export const GET_LEARNER_DASHBOARD = gql`
  query GetLearnerDashboard($tenantId: ID!, $studentId: ID) {
    learnerDashboard(tenantId: $tenantId, studentId: $studentId) {
      studentId
      stats {
        enrolledCount
        inProgressCount
        completedCount
        certificateCount
      }
      courses {
        enrollmentId
        courseId
        courseTitle
        instructorName
        progressPercent
        learningStatus
        lastAccessedAt
        completedAt
        enrolledAt
        paymentStatus
      }
      subscriptions {
        id
        status
        currentPeriodEnd
        bundle {
          id
          title
          billingInterval
          priceCents
          currency
        }
      }
    }
  }
`;

export const GET_CUSTOMER_SEGMENTS = gql`
  query GetCustomerSegments($tenantId: ID!) {
    customerSegments(tenantId: $tenantId) {
      segment
      label
      customerCount
      orderCount
      avgProgressPercent
    }
  }
`;

export const GET_CUSTOMERS_IN_SEGMENT = gql`
  query GetCustomersInSegment($tenantId: ID!, $segment: CustomerSegmentId!) {
    customersInSegment(tenantId: $tenantId, segment: $segment) {
      customerId
      customerName
      customerEmail
      orderCount
      lastOrderAt
      totalPaidCents
      avgProgressPercent
      segment
    }
  }
`;
