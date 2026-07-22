import { gql } from '@apollo/client';

export const GET_ORDER_ROWS = gql`
  query GetOrderRows($tenantId: ID!) {
    orderRows(tenantId: $tenantId) {
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
      total
      itemCount
      courseTitle
      archived
    }
  }
`;
