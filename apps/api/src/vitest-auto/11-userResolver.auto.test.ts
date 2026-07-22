import { describe, expect, it } from 'vitest';
import { userResolvers } from '../schema/user/resolvers';

describe('11 user resolver auto', () => {
  it('exports Query resolver map', () => {
    expect(typeof userResolvers.Query.user).toBe('function');
  });
});
