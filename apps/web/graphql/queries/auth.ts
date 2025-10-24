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

export const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
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

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
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

export const GET_USERS_BY_TENANT = gql`
  query GetUsersByTenant($tenantId: ID!) {
    users(tenantId: $tenantId) {
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
