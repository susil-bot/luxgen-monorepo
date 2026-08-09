import { gql } from '@apollo/client';

export const GET_TENANT = gql`
  query GetTenant($subdomain: String!) {
    tenantBySubdomain(subdomain: $subdomain) {
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

// T-VERT-11 — super-admin only, see apps/api/src/schema/tenantCapabilityMap.
export const GET_TENANT_CAPABILITY_MAP = gql`
  query GetTenantCapabilityMap($tenantId: ID!) {
    tenantCapabilityMap(tenantId: $tenantId) {
      tenantId
      tenantName
      subdomain
      plan
      vocabulary {
        course
        enrollment
        student
        instructor
        certificate
        group
        order
        product
      }
      domains {
        domain
        enabled
        reason
      }
      installedAutomationCount
      likelyFunnelTemplate {
        slug
        name
      }
      tenantFeatureFlags
    }
  }
`;
