import { gql } from '@apollo/client';

export const GET_TENANT = gql`
  query GetTenant($subdomain: String!) {
    tenant(subdomain: $subdomain) {
      id
      name
      subdomain
      settings
      createdAt
    }
  }
`;

export const GET_TENANTS = gql`
  query GetTenants {
    tenants {
      id
      name
      subdomain
      settings
      createdAt
    }
  }
`;

export const CREATE_TENANT = gql`
  mutation CreateTenant($input: CreateTenantInput!) {
    createTenant(input: $input) {
      id
      name
      subdomain
      settings
    }
  }
`;

export const UPDATE_TENANT = gql`
  mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
    updateTenant(id: $id, input: $input) {
      id
      name
      subdomain
      settings
    }
  }
`;
