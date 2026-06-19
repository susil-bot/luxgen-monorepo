import { gql } from '@apollo/client';

export const GET_ENROLLMENT = gql`
  query GetEnrollment($courseId: ID!, $studentId: ID!) {
    enrollment(courseId: $courseId, studentId: $studentId) {
      id
      courseId
      studentId
      notes
      paymentStatus
      paidAt
      cancelledAt
      enrolledAt
    }
  }
`;

export const UPDATE_ORDER_NOTES = gql`
  mutation UpdateOrderNotes($input: UpdateOrderNotesInput!) {
    updateOrderNotes(input: $input) {
      id
      notes
      paymentStatus
    }
  }
`;

export const UPDATE_CUSTOMER_NOTES = gql`
  mutation UpdateCustomerNotes($input: UpdateCustomerNotesInput!) {
    updateCustomerNotes(input: $input) {
      id
      staffNotes
    }
  }
`;

export const CREATE_ORDER_CHECKOUT = gql`
  mutation CreateOrderCheckout($input: CreateOrderCheckoutInput!) {
    createOrderCheckoutSession(input: $input) {
      url
      sessionId
    }
  }
`;

export const CONFIRM_ORDER_PAYMENT_DEV = gql`
  mutation ConfirmOrderPaymentDev($courseId: ID!, $studentId: ID!, $tenantId: ID!) {
    confirmOrderPaymentDev(courseId: $courseId, studentId: $studentId, tenantId: $tenantId) {
      id
      paymentStatus
      paidAt
    }
  }
`;
