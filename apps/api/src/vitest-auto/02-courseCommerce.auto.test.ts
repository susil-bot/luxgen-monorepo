import { describe, expect, it } from 'vitest';
import { courseResolvers } from '../schema/course/resolvers';

describe('02 course commerce auto', () => {
  it('uses usd default when commerce missing', () => {
    const result = courseResolvers.Course.commerce({});
    expect(result).toEqual({ currency: 'usd' });
  });
});
