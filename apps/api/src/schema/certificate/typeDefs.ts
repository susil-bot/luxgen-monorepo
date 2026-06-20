export const certificateTypeDefs = `
  type Certificate {
    id: ID!
    tenantId: ID!
    courseId: ID!
    studentId: ID!
    courseTitle: String!
    studentName: String!
    certificateNumber: String!
    issuedAt: Date!
  }

  extend type Query {
    certificate(id: ID!): Certificate
    studentCertificates(tenantId: ID!, studentId: ID!): [Certificate!]!
  }
`;
