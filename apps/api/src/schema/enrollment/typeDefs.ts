export const enrollmentTypeDefs = `
  enum EnrollmentPaymentStatus {
    PENDING
    PAID
    REFUNDED
    VOIDED
  }

  type Enrollment {
    id: ID!
    courseId: ID!
    studentId: ID!
    notes: String!
    paymentStatus: EnrollmentPaymentStatus!
    paidAt: Date
    cancelledAt: Date
    enrolledAt: Date!
  }

  extend type User {
    staffNotes: String
  }

  input UpdateOrderNotesInput {
    courseId: ID!
    studentId: ID!
    notes: String!
  }

  input UpdateCustomerNotesInput {
    customerId: ID!
    notes: String!
  }

  input CreateOrderCheckoutInput {
    tenantId: ID!
    courseId: ID!
    studentId: ID!
    amountCents: Int!
    courseTitle: String!
    customerEmail: String
    successUrl: String!
    cancelUrl: String!
  }

  type OrderCheckoutSession {
    url: String!
    sessionId: String!
  }

  extend type Query {
    enrollment(courseId: ID!, studentId: ID!): Enrollment
  }

  extend type Mutation {
    updateOrderNotes(input: UpdateOrderNotesInput!): Enrollment!
    updateCustomerNotes(input: UpdateCustomerNotesInput!): User!
    createOrderCheckoutSession(input: CreateOrderCheckoutInput!): OrderCheckoutSession!
    confirmOrderPaymentDev(courseId: ID!, studentId: ID!, tenantId: ID!): Enrollment!
  }
`;
