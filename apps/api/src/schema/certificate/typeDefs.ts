export const certificateTypeDefs = `
  type Certificate {
    id: ID!
    courseId: ID!
    courseTitle: String!
    studentId: ID!
    studentName: String
    studentEmail: String
    issuedAt: Date!
    verificationCode: String!
    certificateExpiresAt: Date
  }

  extend type Query {
    learnerCertificates(studentId: ID): [Certificate!]!
    """Tenant-scoped issued certificates (completed enrollments) for admin Learning IA."""
    issuedCertificates(tenantId: String!, search: String): [Certificate!]!
  }

  extend type Mutation {
    issueCertificate(courseId: ID!, studentId: ID): Certificate!
  }
`;
