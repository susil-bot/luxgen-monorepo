import { describe, expect, it } from 'vitest';
import { learnerResolvers } from '../schema/learner/resolvers';

describe('17 learner resolver auto', () => {
  it('exports learnerDashboard query', () => {
    expect(typeof learnerResolvers.Query.learnerDashboard).toBe('function');
  });
});
