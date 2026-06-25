import { describe, expect, it } from 'vitest';
import { dashboardResolvers } from '../schema/dashboard/resolvers';

describe('19 dashboard resolver auto', () => {
  it('exports getDashboardData query', () => {
    expect(typeof dashboardResolvers.Query.getDashboardData).toBe('function');
  });
});
