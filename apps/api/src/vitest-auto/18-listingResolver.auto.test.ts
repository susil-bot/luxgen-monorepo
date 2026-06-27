import { describe, expect, it } from 'vitest';
import { listingResolvers } from '../schema/listing/resolvers';

describe('18 listing resolver auto', () => {
  it('exports publishedListings query', () => {
    expect(typeof listingResolvers.Query.publishedListings).toBe('function');
  });
});
