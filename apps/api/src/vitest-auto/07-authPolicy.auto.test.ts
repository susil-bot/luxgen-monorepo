import { describe, expect, it } from 'vitest';
import { PUBLIC_MUTATIONS, PUBLIC_QUERIES } from '../graphql/authPolicy';

describe('07 auth policy auto', () => {
  it('contains known public operations', () => {
    expect(PUBLIC_QUERIES.has('course')).toBe(true);
    expect(PUBLIC_MUTATIONS.has('login')).toBe(true);
  });
});
