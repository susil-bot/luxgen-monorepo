import { describe, expect, it } from 'vitest';
import { getTenantFromHost } from '../tenant';

describe('32', () => {
  it('getTenantFromHost', () => {
    expect(getTenantFromHost('demo.localhost:3000')).toBe('demo');
    expect(getTenantFromHost('localhost:3000')).toBe('default');
  });
});
