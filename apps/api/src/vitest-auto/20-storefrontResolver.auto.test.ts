import { describe, expect, it } from 'vitest';
import { storefrontResolvers } from '../schema/storefront/resolvers';

describe('20 storefront resolver auto', () => {
  it('exports storefrontProducts query', () => {
    expect(typeof storefrontResolvers.Query.storefrontProducts).toBe('function');
  });
});
