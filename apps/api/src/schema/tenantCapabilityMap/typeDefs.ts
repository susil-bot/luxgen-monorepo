export const tenantCapabilityMapTypeDefs = `
  """T-VERT-11 — read-only join across existing tenant state, super-admin only.
  See docs/PLATFORM_VERTICALIZATION_STRATEGY.md §6."""
  type TenantCapabilityDomain {
    domain: String!
    enabled: Boolean!
    reason: String!
    """True if a super admin has explicitly pinned this domain on/off for this tenant
    (settings.config.domainOverrides) rather than it just following the plan-derived flag."""
    overridden: Boolean!
  }

  type TenantCapabilityMap {
    tenantId: ID!
    tenantName: String!
    subdomain: String!
    plan: String!
    vocabulary: TenantVocabulary!
    domains: [TenantCapabilityDomain!]!
    installedAutomationCount: Int!
    """Best-effort match against FunnelTemplate.vocabularyPreset -- no per-tenant install record
    exists yet (see T-VERT-06 notes), so this is inferred from the tenant's current vocabulary,
    not a ground-truth log of what was installed."""
    likelyFunnelTemplate: FunnelTemplate
    """Raw settings.config.features flags -- separate from (and currently not gating) plan-derived
    domain access above; surfaced as-is so a super admin sees the whole picture, not just the
    part that's wired to enforcement today."""
    tenantFeatureFlags: JSON!
  }

  extend type Query {
    """SUPER_ADMIN only -- throws FORBIDDEN otherwise."""
    tenantCapabilityMap(tenantId: ID!): TenantCapabilityMap!
    """Any authenticated (or guest) caller, for their OWN tenant -- the effective, override-aware
    domain list a tenant's sidebar should render. Same merge logic as tenantCapabilityMap.domains,
    just without the super-admin-only extras (vocabulary, automation count, etc)."""
    tenantDomainAccess(tenantId: String!): [TenantCapabilityDomain!]!
  }

  extend type Mutation {
    """SUPER_ADMIN only. Pins a sidebar domain on/off for a tenant, overriding whatever their plan
    would otherwise say. Pass enabled: null to clear the override and fall back to the plan."""
    updateTenantDomainAccess(tenantId: ID!, domain: String!, enabled: Boolean): [TenantCapabilityDomain!]!
  }
`;
