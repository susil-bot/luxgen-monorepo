import { describe, expect, it } from 'vitest';
import { percentUsed } from '../usage-limits';

describe('49', () => {
  it('percentUsed', () => {
    expect(percentUsed(50, 100)).toBe(50);
    expect(percentUsed(150, 100)).toBe(100);
  });
});
