import { describe, expect, it } from 'vitest';
import { automationResolvers } from '../schema/automation/resolvers';

describe('14 automation resolver export auto', () => {
  it('exports automationSchema query', () => {
    expect(typeof automationResolvers.Query.automationSchema).toBe('function');
  });
});
