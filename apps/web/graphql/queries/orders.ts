import { gql } from '@apollo/client';

export const GET_ORDER_ROWS = gql`
  query GetOrderRows($tenantId: ID!, $statusTab: String) {
    orderRows(tenantId: $tenantId, statusTab: $statusTab) {
      id
      subjectId
      courseId
      studentId
      orderNumber
      date
      customerId
      customerName
      customerEmail
      paymentStatus
      fulfillmentStatus
      learningStatus
      total
      itemCount
      courseTitle
      archived
    }
  }
`;
