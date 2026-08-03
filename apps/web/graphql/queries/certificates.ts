import { gql } from '@apollo/client';

export const CERTIFICATE_FIELDS = gql`
  fragment CertificateFields on Certificate {
    id
    courseId
    courseTitle
    studentId
    studentName
    studentEmail
    issuedAt
    verificationCode
    certificateExpiresAt
  }
`;

export const GET_LEARNER_CERTIFICATES = gql`
  query GetLearnerCertificates($studentId: ID) {
    learnerCertificates(studentId: $studentId) {
      ...CertificateFields
    }
  }
  ${CERTIFICATE_FIELDS}
`;

export const GET_ISSUED_CERTIFICATES = gql`
  query GetIssuedCertificates($tenantId: String!, $search: String) {
    issuedCertificates(tenantId: $tenantId, search: $search) {
      ...CertificateFields
    }
  }
  ${CERTIFICATE_FIELDS}
`;
