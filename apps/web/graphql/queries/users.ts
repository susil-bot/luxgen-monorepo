import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      firstName
      lastName
      role
      staffNotes
      phone
      marketingEmail
      marketingSms
      marketingWhatsapp
      tenant {
        id
        name
        subdomain
      }
      createdAt
    }
  }
`;

export const GET_CUSTOMERS = gql`
  query GetCustomers($tenantId: ID!, $search: String) {
    customers(tenantId: $tenantId, search: $search) {
      id
      email
      firstName
      lastName
      role
      status
      isActive
      phone
      marketingEmail
      staffNotes
      createdAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($tenantId: ID!) {
    users(tenantId: $tenantId) {
      id
      email
      firstName
      lastName
      role
      status
      isActive
      createdAt
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

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      firstName
      lastName
      role
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      firstName
      lastName
      role
      phone
      marketingEmail
      marketingSms
      marketingWhatsapp
      staffNotes
    }
  }
`;

export const UPDATE_CUSTOMER_NOTES = gql`
  mutation UpdateCustomerNotes($input: UpdateCustomerNotesInput!) {
    updateCustomerNotes(input: $input) {
      id
      staffNotes
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
