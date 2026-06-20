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
