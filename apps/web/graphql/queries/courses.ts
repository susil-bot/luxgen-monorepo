import { gql } from '@apollo/client';

export const GET_COURSE = gql`
  query GetCourse($id: ID!) {
    course(id: $id) {
      id
      title
      description
      instructor {
        id
        firstName
        lastName
        email
      }
      students {
        id
        firstName
        lastName
        email
      }
      startDate
      endDate
      status
      createdAt
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses($tenantId: ID!) {
    courses(tenantId: $tenantId) {
      id
      title
      description
      instructor {
        id
        firstName
        lastName
      }
      studentCount
      startDate
      endDate
      status
    }
  }
`;

export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id
      title
      description
      instructor {
        id
        firstName
        lastName
      }
    }
  }
`;

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      title
      description
      status
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

export const ENROLL_STUDENT = gql`
  mutation EnrollStudent($courseId: ID!, $studentId: ID!) {
    enrollStudent(courseId: $courseId, studentId: $studentId) {
      id
      students {
        id
        firstName
        lastName
      }
    }
  }
`;
