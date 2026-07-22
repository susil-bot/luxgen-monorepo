import type { GraphQLContext } from '../context';
import { scopedTenantId, tenantScopeMatches } from '../graphql/tenantScope';

function mockCtx(partial: Partial<GraphQLContext>): GraphQLContext {
  return partial as GraphQLContext;
}

describe('tenantScope', () => {
  const mongoId = '507f1f77bcf86cd799439011';

  it('tenantScopeMatches accepts subdomain or mongo id', () => {
    const ctx = mockCtx({ tenantId: mongoId, tenant: 'demo' });
    expect(tenantScopeMatches(ctx, 'demo')).toBe(true);
    expect(tenantScopeMatches(ctx, mongoId)).toBe(true);
    expect(tenantScopeMatches(ctx, 'other')).toBe(false);
  });

  it('scopedTenantId maps subdomain to mongo id when authenticated', () => {
    const ctx = mockCtx({
      user: { id: 'u1' } as GraphQLContext['user'],
      tenantId: mongoId,
      tenant: 'demo',
    });
    expect(scopedTenantId(ctx, 'demo')).toBe(mongoId);
    expect(scopedTenantId(ctx, mongoId)).toBe(mongoId);
  });

  it('scopedTenantId rejects cross-tenant when authenticated', () => {
    const ctx = mockCtx({
      user: { id: 'u1' } as GraphQLContext['user'],
      tenantId: mongoId,
      tenant: 'demo',
    });
    expect(() => scopedTenantId(ctx, 'idea-vibes')).toThrow(/not valid for this tenant/i);
  });
});
