import { describe, it, expect, beforeEach } from '@jest/globals';
import { GraphQLError } from 'graphql';
import { assertAuthenticated, secureResolvers } from '../graphql/authPolicy';
import { isAccountActive } from '../utils/accountStatus';
import { checkLoginRateLimit, resetLoginRateLimitStore } from '../middleware/loginRateLimit';

describe('authPolicy', () => {
  it('assertAuthenticated throws UNAUTHENTICATED when no user', () => {
    expect(() => assertAuthenticated({ req: {} as any, res: {} as any })).toThrow(GraphQLError);
    try {
      assertAuthenticated({ req: {} as any, res: {} as any });
    } catch (e) {
      expect((e as GraphQLError).extensions?.code).toBe('UNAUTHENTICATED');
    }
  });

  it('assertAuthenticated throws FORBIDDEN for deactivated accounts', () => {
    try {
      assertAuthenticated({
        req: {} as any,
        res: {} as any,
        authError: 'ACCOUNT_DEACTIVATED',
      });
    } catch (e) {
      expect((e as GraphQLError).extensions?.code).toBe('FORBIDDEN');
    }
  });

  it('secureResolvers allows public login without user', async () => {
    const resolvers = secureResolvers({
      Mutation: {
        login: () => 'ok',
        deleteUser: () => 'secret',
      },
    });

    expect(resolvers.Mutation.login(null, {}, { req: {} as any, res: {} as any })).toBe('ok');
    expect(() => resolvers.Mutation.deleteUser(null, {}, { req: {} as any, res: {} as any })).toThrow(GraphQLError);
  });
});

describe('isAccountActive', () => {
  it('returns false when isActive is false', () => {
    expect(isAccountActive({ isActive: false, status: 'ACTIVE' } as any)).toBe(false);
  });

  it('returns false when status is SUSPENDED', () => {
    expect(isAccountActive({ isActive: true, status: 'SUSPENDED' } as any)).toBe(false);
  });

  it('returns true for active users', () => {
    expect(isAccountActive({ isActive: true, status: 'ACTIVE' } as any)).toBe(true);
  });
});

describe('loginRateLimit', () => {
  beforeEach(() => resetLoginRateLimitStore());

  it('blocks after max attempts', async () => {
    const req = { ip: '127.0.0.1', socket: {} } as any;
    for (let i = 0; i < 10; i++) {
      await checkLoginRateLimit(req, 'test@example.com');
    }
    await expect(checkLoginRateLimit(req, 'test@example.com')).rejects.toThrow('Too many login attempts');
  });
});
