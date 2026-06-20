import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
        role
        tenant {
          id
          name
          subdomain
        }
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      email
      firstName
      lastName
      role
      tenant {
        id
        name
        subdomain
      }
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses($tenantId: ID!) {
    courses(tenantId: $tenantId) {
      id
      title
      description
      status
      instructor {
        id
        firstName
        lastName
      }
      startDate
      endDate
    }
  }
`;

export const GET_COURSE = gql`
  query GetCourse($id: ID!) {
    course(id: $id) {
      id
      title
      description
      status
      startDate
      endDate
      instructor {
        id
        firstName
        lastName
      }
      tenant {
        id
      }
    }
  }
`;

export const ENROLL_STUDENT = gql`
  mutation EnrollStudent($courseId: ID!, $studentId: ID!) {
    enrollStudent(courseId: $courseId, studentId: $studentId) {
      id
    }
  }
`;

export const GET_ENROLLMENT = gql`
  query GetEnrollment($courseId: ID!, $studentId: ID!) {
    enrollment(courseId: $courseId, studentId: $studentId) {
      id
      courseId
      studentId
      paymentStatus
      enrolledAt
    }
  }
`;

export const GET_ENROLLMENTS = gql`
  query GetEnrollments($tenantId: ID!) {
    enrollments(tenantId: $tenantId) {
      id
      courseId
      studentId
      paymentStatus
      enrolledAt
    }
  }
`;

export const GET_TENANT_BILLING = gql`
  query GetTenantBilling($tenantId: String!) {
    tenantBilling(tenantId: $tenantId) {
      tenantId
      plan
      planName
      featureFlags {
        mobileApp
      }
    }
  }
`;

export const REGISTER_PUSH_TOKEN = gql`
  mutation RegisterPushToken($token: String!) {
    registerPushToken(token: $token)
  }
`;
