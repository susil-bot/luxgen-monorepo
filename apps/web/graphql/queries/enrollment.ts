import { gql } from '@apollo/client';

export const GET_ENROLLMENTS = gql`
  query GetEnrollments($tenantId: ID!) {
    enrollments(tenantId: $tenantId) {
      id
      courseId
      studentId
      notes
      paymentStatus
      enrolledAt
    }
  }
`;

export const GET_ENROLLMENT_BY_ID = gql`
  query GetEnrollmentById($id: ID!) {
    enrollmentById(id: $id) {
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

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      id
      notes
      paymentStatus
      paidAt
      cancelledAt
      enrolledAt
    }
  }
`;

export const REFUND_ORDER = gql`
  mutation RefundOrder($courseId: ID!, $studentId: ID!) {
    refundOrder(courseId: $courseId, studentId: $studentId) {
      id
      paymentStatus
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($courseId: ID!, $studentId: ID!) {
    cancelOrder(courseId: $courseId, studentId: $studentId) {
      id
      paymentStatus
      cancelledAt
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
