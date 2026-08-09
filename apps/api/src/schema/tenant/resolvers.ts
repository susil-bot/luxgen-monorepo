import { GraphQLError } from 'graphql';
import { UserRole, resolveVocabulary, type ITenant } from '@luxgen/db';
import { tenantService } from '../../services/tenantService';
import type { GraphQLContext } from '../../context';

function assertSuperAdmin(ctx: GraphQLContext): void {
  if (!ctx.user) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  if (ctx.user.role !== UserRole.SUPER_ADMIN) {
    throw new GraphQLError('Super admin access required', { extensions: { code: 'FORBIDDEN' } });
  }
}

/** Platform ops or tenant admin updating their own tenant only. */
function assertCanMutateTenant(ctx: GraphQLContext, tenantId: string): void {
  if (!ctx.user) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  if (ctx.user.role === UserRole.SUPER_ADMIN) return;
  if (ctx.user.role === UserRole.ADMIN && ctx.tenantId && ctx.tenantId === tenantId) return;
  throw new GraphQLError('Not allowed to modify this tenant', { extensions: { code: 'FORBIDDEN' } });
}

export const tenantResolvers = {
  Tenant: {
    vocabulary: (parent: ITenant) => resolveVocabulary(parent),
  },
  Query: {
    tenant: async (_: unknown, { id }: { id: string }) => {
      return tenantService.getTenantById(id);
    },
    tenantBySubdomain: async (_: unknown, { subdomain }: { subdomain: string }) => {
      return tenantService.getTenantBySubdomain(subdomain);
    },
    tenants: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      assertSuperAdmin(ctx);
      return tenantService.getAllTenants();
    },
  },
  Mutation: {
    createTenant: async (_: unknown, { input }: { input: unknown }, ctx: GraphQLContext) => {
      assertSuperAdmin(ctx);
      return tenantService.createTenant(input as Parameters<typeof tenantService.createTenant>[0]);
    },
    updateTenant: async (_: unknown, { id, input }: { id: string; input: unknown }, ctx: GraphQLContext) => {
      assertCanMutateTenant(ctx, id);
      return tenantService.updateTenant(id, input as Parameters<typeof tenantService.updateTenant>[1]);
    },
    deleteTenant: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      assertSuperAdmin(ctx);
      return tenantService.deleteTenant(id);
    },
    updateTenantVocabulary: async (
      _: unknown,
      { tenantId, vocabulary }: { tenantId: string; vocabulary: Record<string, string | null | undefined> },
      ctx: GraphQLContext,
    ) => {
      assertCanMutateTenant(ctx, tenantId);
      return tenantService.updateVocabulary(tenantId, vocabulary);
    },
  },
};
