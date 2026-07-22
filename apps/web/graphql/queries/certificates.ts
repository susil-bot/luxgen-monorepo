import { gql } from '@apollo/client';
export const GET_LEARNER_CERTIFICATES = gql`
  query GetLearnerCertificates($studentId: ID) {
    learnerCertificates(studentId: $studentId) {
      id
      courseId
      courseTitle
      issuedAt
      verificationCode
    }
  }
`;
