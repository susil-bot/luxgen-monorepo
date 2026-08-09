import { GraphQLError } from 'graphql';
import { Automation, UserRole, resolveVocabulary } from '@luxgen/db';
import { tenantService } from '../../services/tenantService';
import { billingService } from '../../services/billingService';
import { funnelTemplateService } from '../../services/funnelTemplateService';
import { scopedTenantId as resolveScopedTenantId } from '../../graphql/tenantScope';
import type { GraphQLContext } from '../../context';

function assertSuperAdmin(ctx: GraphQLContext): void {
  if (!ctx.user) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  if (ctx.user.role !== UserRole.SUPER_ADMIN) {
    throw new GraphQLError('Super admin access required', { extensions: { code: 'FORBIDDEN' } });
  }
}

// The sidebar/IA domain model from docs/PRODUCT_ARCHITECTURE.md, in the same order as that
// doc's table (Listings removed per product decision) -- this resolver reads that model, it
// does not invent a new one (see T-VERT-11 acceptance criteria + PLATFORM_VERTICALIZATION_STRATEGY.md §6).
//
// planEnabled is what the tenant's billing plan would say on its own; `overrides` (from
// Tenant.settings.config.domainOverrides, set via updateTenantDomainAccess) wins when present --
// that's how a super admin can demo/test a domain regardless of the tenant's actual plan.
function buildDomains(featureFlags: Record<string, boolean>, overrides: Record<string, boolean> = {}) {
  const base: { domain: string; planEnabled: boolean; planReason: string }[] = [
    { domain: 'Home', planEnabled: true, planReason: 'Core — always on' },
    { domain: 'Learning', planEnabled: true, planReason: 'Core LMS — always on' },
    { domain: 'Commerce', planEnabled: true, planReason: 'Core commerce — always on' },
    { domain: 'People', planEnabled: true, planReason: 'Core — always on' },
    {
      domain: 'Automation Hub',
      planEnabled: Boolean(featureFlags.automations),
      planReason: featureFlags.automations ? 'Enabled by current plan' : 'Requires a plan with automations',
    },
    {
      domain: 'Intelligence',
      planEnabled: Boolean(featureFlags.analytics),
      planReason: featureFlags.analytics ? 'Enabled by current plan' : 'Requires a plan with analytics',
    },
    {
      domain: 'Workspace',
      planEnabled: Boolean(featureFlags.project),
      planReason: featureFlags.project ? 'Enabled by current plan' : 'Requires a plan with project tracking',
    },
    { domain: 'Administration', planEnabled: true, planReason: 'Visible to Admin+ roles, not plan-gated' },
    { domain: 'Settings', planEnabled: true, planReason: 'Personal settings — always on' },
  ];

  return base.map(({ domain, planEnabled, planReason }) => {
    const overridden = Object.prototype.hasOwnProperty.call(overrides, domain);
    const enabled = overridden ? Boolean(overrides[domain]) : planEnabled;
    const reason = overridden ? `Manually ${enabled ? 'enabled' : 'disabled'} by super admin` : planReason;
    return { domain, enabled, reason, overridden };
  });
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
        domains: buildDomains(
          billing.featureFlags as unknown as Record<string, boolean>,
          tenant.settings?.config?.domainOverrides ?? {},
        ),
        installedAutomationCount,
        likelyFunnelTemplate: matched ? funnelTemplateService.toGraphQL(matched) : null,
        tenantFeatureFlags: tenant.settings?.config?.features ?? {},
      };
    },

    tenantDomainAccess: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      // Unlike tenantCapabilityMap, this one IS scoped normally -- any tenant's own users (or a
      // guest on that tenant) need this to render their own sidebar, not just super admins.
      const scoped = resolveScopedTenantId(ctx, tenantId);
      const tenant = await tenantService.getTenantById(scoped);
      if (!tenant) throw new GraphQLError('Tenant not found', { extensions: { code: 'NOT_FOUND' } });
      const billing = await billingService.getTenantBilling(scoped);
      return buildDomains(
        billing.featureFlags as unknown as Record<string, boolean>,
        tenant.settings?.config?.domainOverrides ?? {},
      );
    },
  },
  Mutation: {
    updateTenantDomainAccess: async (
      _: unknown,
      { tenantId, domain, enabled }: { tenantId: string; domain: string; enabled: boolean | null },
      ctx: GraphQLContext,
    ) => {
      assertSuperAdmin(ctx);
      const tenant = await tenantService.updateDomainOverride(tenantId, domain, enabled ?? null);
      const billing = await billingService.getTenantBilling(tenantId);
      return buildDomains(
        billing.featureFlags as unknown as Record<string, boolean>,
        tenant.settings?.config?.domainOverrides ?? {},
      );
    },
  },
};
