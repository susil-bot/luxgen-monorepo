import { describe, expect, it } from 'vitest';
import { PlanGateError, assertFeature } from '../gates';

describe('43', () => {
  it('PlanGateError', () => {
    expect(() => assertFeature('starter', 'agentStudio')).toThrow(PlanGateError);
  });
});
