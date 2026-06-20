import { gql } from '@apollo/client';

export const GET_STUDENT_CERTIFICATES = gql`
  query GetStudentCertificates($tenantId: ID!, $studentId: ID!) {
    studentCertificates(tenantId: $tenantId, studentId: $studentId) {
      id
      courseId
      studentId
      courseTitle
      studentName
      certificateNumber
      issuedAt
    }
  }
`;

export const GET_CERTIFICATE = gql`
  query GetCertificate($id: ID!) {
    certificate(id: $id) {
      id
      courseId
      studentId
      courseTitle
      studentName
      certificateNumber
      issuedAt
    }
  }
`;
