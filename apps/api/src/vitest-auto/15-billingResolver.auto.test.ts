import { describe, expect, it } from 'vitest';
import { billingResolvers } from '../schema/billing/resolvers';

describe('15 billing resolver auto', () => {
  it('exports pricingPlans query', () => {
    expect(typeof billingResolvers.Query.pricingPlans).toBe('function');
  });
});
