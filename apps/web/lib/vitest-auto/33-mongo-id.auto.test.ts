import { describe, expect, it } from 'vitest';
import { isMongoObjectId } from '../mongo-id';

describe('33', () => {
  it('mongo-id', () => {
    expect(isMongoObjectId('64f000000000000000000001')).toBe(true);
    expect(isMongoObjectId('bad')).toBe(false);
  });
});
