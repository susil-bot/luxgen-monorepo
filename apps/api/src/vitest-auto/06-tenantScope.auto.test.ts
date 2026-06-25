import { describe, expect, it } from 'vitest';
import { scopedTenantId, tenantScopeMatches } from '../graphql/tenantScope';

describe('06 tenant scope auto', () => {
  it('matches tenant and scopes correctly', () => {
    const ctx = { tenantId: 'tenant-a', tenant: 'demo', user: { id: 'u1' } } as any;
    expect(tenantScopeMatches(ctx, 'tenant-a')).toBe(true);
    expect(scopedTenantId(ctx, 'tenant-a')).toBe('tenant-a');
  });
});
