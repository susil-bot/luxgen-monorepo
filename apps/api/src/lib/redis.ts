import Redis from 'ioredis';

let _client: Redis | null = null;

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL || process.env.AGENT_REDIS_URL;
}

export function isRedisAvailable(): boolean {
  return Boolean(getRedisUrl());
}

export function getRedisClient(): Redis | null {
  if (!isRedisAvailable()) return null;
  if (!_client) {
    _client = new Redis(getRedisUrl()!, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });
    _client.on('error', () => {
      // Non-fatal: callers fall back to in-memory
    });
  }
  return _client;
}

export async function disconnectRedis(): Promise<void> {
  if (_client) {
    await _client.quit().catch(() => {});
    _client = null;
  }
}
