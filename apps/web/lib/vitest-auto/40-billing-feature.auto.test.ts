import { describe, expect, it } from 'vitest';
import { hasFeature } from '@luxgen/billing';

describe('40', () => {
  it('hasFeature', () => {
    expect(hasFeature('pro', 'analytics')).toBe(true);
    expect(hasFeature('starter', 'agentStudio')).toBe(false);
  });
});
