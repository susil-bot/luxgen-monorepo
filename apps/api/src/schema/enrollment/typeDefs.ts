export const enrollmentTypeDefs = `
  enum EnrollmentPaymentStatus {
    PENDING
    PAID
    REFUNDED
    VOIDED
  }

  enum EnrollmentLearningStatus {
    ACTIVE
    COMPLETED
  }

  type Enrollment {
    id: ID!
    courseId: ID!
    studentId: ID!
    notes: String!
    tags: [String!]!
    paymentStatus: EnrollmentPaymentStatus!
    progressPercent: Int!
    learningStatus: EnrollmentLearningStatus!
    lastAccessedAt: Date
    completedAt: Date
    paidAt: Date
    cancelledAt: Date
    enrolledAt: Date!
  }

  input UpdateOrderNotesInput {
    courseId: ID!
    studentId: ID!
    notes: String!
  }

  input UpdateOrderInput {
    courseId: ID!
    studentId: ID!
    notes: String
    tags: [String!]
    paymentStatus: EnrollmentPaymentStatus
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

  input UpdateEnrollmentProgressInput {
    courseId: ID!
    studentId: ID!
    progressPercent: Int!
  }

  extend type Query {
    enrollment(courseId: ID!, studentId: ID!): Enrollment
    enrollmentById(id: ID!): Enrollment
    enrollments(tenantId: ID!): [Enrollment!]!
    studentEnrollments(tenantId: ID!, studentId: ID!): [Enrollment!]!
  }

  extend type Mutation {
    updateOrderNotes(input: UpdateOrderNotesInput!): Enrollment!
    updateOrder(input: UpdateOrderInput!): Enrollment!
    refundOrder(courseId: ID!, studentId: ID!): Enrollment!
    cancelOrder(courseId: ID!, studentId: ID!): Enrollment!
    updateCustomerNotes(input: UpdateCustomerNotesInput!): User!
    createOrderCheckoutSession(input: CreateOrderCheckoutInput!): OrderCheckoutSession!
    confirmOrderPaymentDev(courseId: ID!, studentId: ID!, tenantId: ID!): Enrollment!
    updateEnrollmentProgress(input: UpdateEnrollmentProgressInput!): Enrollment!
    markCourseComplete(courseId: ID!): Enrollment!
  }
`;
