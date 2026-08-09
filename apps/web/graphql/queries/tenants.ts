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
        overridden
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

// Effective, override-aware domain list for the CURRENT tenant's own sidebar — not super-admin
// gated, unlike GET_TENANT_CAPABILITY_MAP above (which pulls the full admin picture).
export const GET_TENANT_DOMAIN_ACCESS = gql`
  query GetTenantDomainAccess($tenantId: String!) {
    tenantDomainAccess(tenantId: $tenantId) {
      domain
      enabled
      reason
      overridden
    }
  }
`;

// Super-admin only — flips a sidebar domain on/off for a tenant, overriding their plan.
// enabled: null clears the override so the domain falls back to the plan-derived flag.
export const UPDATE_TENANT_DOMAIN_ACCESS = gql`
  mutation UpdateTenantDomainAccess($tenantId: ID!, $domain: String!, $enabled: Boolean) {
    updateTenantDomainAccess(tenantId: $tenantId, domain: $domain, enabled: $enabled) {
      domain
      enabled
      reason
      overridden
    }
  }
`;
