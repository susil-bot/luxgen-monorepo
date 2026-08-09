import { GraphQLError } from 'graphql';
import { Automation, UserRole, resolveVocabulary } from '@luxgen/db';
import { tenantService } from '../../services/tenantService';
import { billingService } from '../../services/billingService';
import { funnelTemplateService } from '../../services/funnelTemplateService';
import type { GraphQLContext } from '../../context';

function assertSuperAdmin(ctx: GraphQLContext): void {
  if (!ctx.user) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  if (ctx.user.role !== UserRole.SUPER_ADMIN) {
    throw new GraphQLError('Super admin access required', { extensions: { code: 'FORBIDDEN' } });
  }
}

// The 9-domain sidebar/IA model from docs/PRODUCT_ARCHITECTURE.md, in the same order as that
// doc's table -- this resolver reads that model, it does not invent a new one (see T-VERT-11
// acceptance criteria + PLATFORM_VERTICALIZATION_STRATEGY.md §6).
function buildDomains(featureFlags: Record<string, boolean>) {
  return [
    { domain: 'Home', enabled: true, reason: 'Core — always on' },
    { domain: 'Learning', enabled: true, reason: 'Core LMS — always on' },
    { domain: 'Commerce', enabled: true, reason: 'Core commerce — always on' },
    { domain: 'People', enabled: true, reason: 'Core — always on' },
    {
      domain: 'Automation Hub',
      enabled: Boolean(featureFlags.automations),
      reason: featureFlags.automations ? 'Enabled by current plan' : 'Requires a plan with automations',
    },
    {
      domain: 'Intelligence',
      enabled: Boolean(featureFlags.analytics),
      reason: featureFlags.analytics ? 'Enabled by current plan' : 'Requires a plan with analytics',
    },
    {
      domain: 'Workspace',
      enabled: Boolean(featureFlags.project),
      reason: featureFlags.project ? 'Enabled by current plan' : 'Requires a plan with project tracking',
    },
    { domain: 'Listings', enabled: true, reason: 'Separate paid product — visibility not plan-gated here' },
    { domain: 'Administration', enabled: true, reason: 'Visible to Admin+ roles, not plan-gated' },
    { domain: 'Settings', enabled: true, reason: 'Personal settings — always on' },
  ];
}

export const tenantCapabilityMapResolvers = {
  Query: {
    tenantCapabilityMap: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      // Deliberately NOT using scopedTenantId()/resolveTenantIdForScope() here -- those enforce
      // "token tenant === requested tenant", which is correct for every other resolver but wrong
      // for this one by design: a super admin inspecting a *different* tenant than the one their
      // own JWT was issued for is the entire point of this query. assertSuperAdmin() above is the
      // real gate (mirrors the SUPER_ADMIN bypass in middleware/roleManagement.ts's
      // requireTenantAccess), so the raw tenantId argument is trusted as-is past that point.
      assertSuperAdmin(ctx);
      const scoped = tenantId;

      const tenant = await tenantService.getTenantById(scoped);
      if (!tenant) throw new GraphQLError('Tenant not found', { extensions: { code: 'NOT_FOUND' } });

      const billing = await billingService.getTenantBilling(scoped);
      const vocabulary = resolveVocabulary(tenant);
      const installedAutomationCount = await Automation.countDocuments({ tenantId: scoped });

      // Best-effort: no per-tenant "installed funnel template" record exists yet, so infer from
      // whichever seeded template's vocabulary preset the tenant's current course label matches.
      const funnelTemplates = await funnelTemplateService.listTemplates();
      const matched = funnelTemplates.find((f) => f.vocabularyPreset?.course === vocabulary.course);

      return {
        tenantId: scoped,
        tenantName: tenant.name,
        subdomain: tenant.subdomain,
        plan: billing.plan,
        vocabulary,
        domains: buildDomains(billing.featureFlags as unknown as Record<string, boolean>),
        installedAutomationCount,
        likelyFunnelTemplate: matched ? funnelTemplateService.toGraphQL(matched) : null,
        tenantFeatureFlags: tenant.settings?.config?.features ?? {},
      };
    },
  },
};
