import { assertWithinLimit, UsageLimitError, getPlanLimits } from '@luxgen/billing';

describe('assertWithinLimit boundary', () => {
  it('throws when usage equals the plan limit', () => {
    const { maxAutomations } = getPlanLimits('pro');
    expect(() => assertWithinLimit('pro', 'automations', maxAutomations)).toThrow(UsageLimitError);
  });

  it('allows usage one below the plan limit', () => {
    const { maxAutomations } = getPlanLimits('pro');
    expect(() => assertWithinLimit('pro', 'automations', maxAutomations - 1)).not.toThrow();
  });
});
