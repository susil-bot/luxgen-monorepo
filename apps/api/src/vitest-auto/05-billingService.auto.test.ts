import { describe, expect, it } from 'vitest';
import { isStripeEnabled, isBillingDevMode } from '../services/billingService';

describe('05 billing service auto', () => {
  it('returns booleans for billing flags', () => {
    expect(typeof isStripeEnabled()).toBe('boolean');
    expect(typeof isBillingDevMode()).toBe('boolean');
  });
});
