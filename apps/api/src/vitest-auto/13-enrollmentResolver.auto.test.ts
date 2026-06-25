import { describe, expect, it } from 'vitest';
import { enrollmentResolvers } from '../schema/enrollment/resolvers';

describe('13 enrollment resolver auto', () => {
  it('exports updateOrderNotes mutation', () => {
    expect(typeof enrollmentResolvers.Mutation.updateOrderNotes).toBe('function');
  });
});
