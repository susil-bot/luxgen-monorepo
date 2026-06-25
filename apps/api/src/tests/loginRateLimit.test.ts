import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../lib/redis', () => ({
  getRedisClient: jest.fn(),
}));

type LoginRateLimitModule = typeof import('../middleware/loginRateLimit');
type RedisModule = typeof import('../lib/redis');

async function loadLoginRateLimit(): Promise<{
  checkLoginRateLimit: LoginRateLimitModule['checkLoginRateLimit'];
  resetLoginRateLimitStore: LoginRateLimitModule['resetLoginRateLimitStore'];
  getRedisClient: jest.MockedFunction<RedisModule['getRedisClient']>;
}> {
  jest.resetModules();
  const redis = await import('../lib/redis');
  const rateLimit = await import('../middleware/loginRateLimit');
  return {
    checkLoginRateLimit: rateLimit.checkLoginRateLimit,
    resetLoginRateLimitStore: rateLimit.resetLoginRateLimitStore,
    getRedisClient: redis.getRedisClient as jest.MockedFunction<RedisModule['getRedisClient']>,
  };
}

describe('loginRateLimit Redis path', () => {
  const req = { ip: '10.0.0.1', socket: {} } as Parameters<LoginRateLimitModule['checkLoginRateLimit']>[0];

  it('increments Redis key and sets expiry on first attempt', async () => {
    const { checkLoginRateLimit, resetLoginRateLimitStore, getRedisClient } = await loadLoginRateLimit();
    resetLoginRateLimitStore();

    const incr = jest.fn().mockResolvedValue(1);
    const pexpire = jest.fn().mockResolvedValue(1);
    getRedisClient.mockReturnValue({
      status: 'ready',
      incr,
      pexpire,
    } as unknown as ReturnType<RedisModule['getRedisClient']>);

    await checkLoginRateLimit(req, 'redis-user@example.com');

    expect(incr).toHaveBeenCalledWith('luxgen:login:10.0.0.1:redis-user@example.com');
    expect(pexpire).toHaveBeenCalledWith('luxgen:login:10.0.0.1:redis-user@example.com', 15 * 60 * 1000);
  });

  it('blocks after max attempts via Redis increment', async () => {
    const { checkLoginRateLimit, resetLoginRateLimitStore, getRedisClient } = await loadLoginRateLimit();
    resetLoginRateLimitStore();

    const incr = jest.fn();
    const pexpire = jest.fn().mockResolvedValue(1);
    getRedisClient.mockReturnValue({
      status: 'ready',
      incr,
      pexpire,
    } as unknown as ReturnType<RedisModule['getRedisClient']>);

    for (let count = 1; count <= 10; count++) {
      incr.mockResolvedValueOnce(count);
      await checkLoginRateLimit(req, 'redis-user@example.com');
    }

    incr.mockResolvedValueOnce(11);
    await expect(checkLoginRateLimit(req, 'redis-user@example.com')).rejects.toThrow('Too many login attempts');
    expect(pexpire).toHaveBeenCalledTimes(1);
  });

  it('falls back to in-memory store when Redis incr throws', async () => {
    const { checkLoginRateLimit, resetLoginRateLimitStore, getRedisClient } = await loadLoginRateLimit();
    resetLoginRateLimitStore();

    const incr = jest.fn().mockRejectedValue(new Error('Redis unavailable'));
    getRedisClient.mockReturnValue({
      status: 'ready',
      incr,
      pexpire: jest.fn(),
    } as unknown as ReturnType<RedisModule['getRedisClient']>);

    for (let i = 0; i < 10; i++) {
      await checkLoginRateLimit(req, 'fallback@example.com');
    }
    await expect(checkLoginRateLimit(req, 'fallback@example.com')).rejects.toThrow('Too many login attempts');
  });
});
