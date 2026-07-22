import { describe, expect, it } from 'vitest';
import * as authRoutes from '../auth-routes';

describe('35', () => {
  it('authRoutes', () => {
    expect(authRoutes.isPublicRoute('/')).toBe(true);
    expect(authRoutes.requiresAuth('/dashboard')).toBe(true);
  });
});
