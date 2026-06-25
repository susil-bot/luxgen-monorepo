import { gql } from '@apollo/client';
export const GET_CUSTOM_ROLES = gql`query GetCustomRoles($tenantId: ID!) { customRoles(tenantId: $tenantId) { id name description } }`;
export const CREATE_CUSTOM_ROLE = gql`mutation CreateCustomRole($input: CreateCustomRoleInput!) { createCustomRole(input: $input) { id name } }`;
