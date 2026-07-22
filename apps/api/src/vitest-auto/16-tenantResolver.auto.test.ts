import { describe, expect, it } from 'vitest';
import { tenantResolvers } from '../schema/tenant/resolvers';

describe('16 tenant resolver auto', () => {
  it('exports tenantBySubdomain query', () => {
    expect(typeof tenantResolvers.Query.tenantBySubdomain).toBe('function');
  });
});
