import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '../context';

/** True when the requested tenant matches the authenticated request context. */
export function tenantScopeMatches(ctx: GraphQLContext, tenantId: string): boolean {
  if (!ctx.tenantId && !ctx.tenant) return true;
  return ctx.tenantId === tenantId || ctx.tenant === tenantId || ctx.tenantDoc?.subdomain === tenantId;
}

export function assertTenantScope(ctx: GraphQLContext, tenantId: string): void {
  if (!tenantScopeMatches(ctx, tenantId)) {
    throw new GraphQLError('Token is not valid for this tenant', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

/** Resolve subdomain args to Mongo tenant id when the request context is scoped. */
export function resolveTenantIdForScope(ctx: GraphQLContext, tenantId: string): string {
  assertTenantScope(ctx, tenantId);
  if (ctx.tenantId && (tenantId === ctx.tenant || tenantId === ctx.tenantDoc?.subdomain)) {
    return ctx.tenantId;
  }
  return tenantId;
}
