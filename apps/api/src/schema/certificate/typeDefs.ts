export const certificateTypeDefs = `
  type Certificate { id: ID! courseId: ID! courseTitle: String! studentId: ID! issuedAt: Date! verificationCode: String! }
  extend type Query { learnerCertificates(studentId: ID): [Certificate!]! }
  extend type Mutation { issueCertificate(courseId: ID!, studentId: ID): Certificate! }
`;
