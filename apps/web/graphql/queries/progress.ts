import { gql } from '@apollo/client';
export const GET_ENROLLMENT_PROGRESS = gql`
  query GetEnrollmentProgress($courseId: ID!, $studentId: ID!) {
    enrollmentProgress(courseId: $courseId, studentId: $studentId) {
      courseId
      studentId
      progressPercent
      completedLessons
      totalLessons
      resumeLessonIndex
    }
  }
`;
