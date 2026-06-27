import { describe, expect, it } from 'vitest';
import { automationResolvers } from '../schema/automation/resolvers';

describe('04 automation resolver auto', () => {
  it('exposes Query.automations function', () => {
    expect(typeof automationResolvers.Query.automations).toBe('function');
  });
});
