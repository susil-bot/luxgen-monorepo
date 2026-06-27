import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from '../safe-redirect';

describe('34', () => {
  it('safeRedirect', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath('https://x')).toBe('/dashboard');
  });
});
