import Redis from 'ioredis';
import { publishActivityEvent } from './activityPubSub';
import type { ActivitySubjectType } from '@luxgen/db';

const TIMELINE_EVENTS_CHANNEL = 'luxgen:timeline:events';

let subscriber: Redis | null = null;
let started = false;

/** Only connect when Redis is explicitly configured (same rule as agent queue). */
function getExplicitRedisUrl(): string | undefined {
  return process.env.REDIS_URL || process.env.AGENT_REDIS_URL;
}

function teardownSubscriber(): void {
  const client = subscriber;
  subscriber = null;
  started = false;
  if (!client) return;
  try {
    client.removeAllListeners();
    if (client.status !== 'end') {
      client.disconnect();
    }
  } catch {
    // Ignore teardown errors
  }
}

export function startTimelineRedisBridge(): void {
  if (started || subscriber) return;

  if (process.env.TIMELINE_REDIS_BRIDGE === 'false') return;

  const url = getExplicitRedisUrl();
  if (!url) return;

  started = true;

  const client = new Redis(url, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: () => null,
  });

  subscriber = client;

  client.on('error', (err: Error) => {
    console.warn('[timeline-redis-bridge] Redis unavailable:', err.message);
    teardownSubscriber();
  });

  client.on('message', (_channel, raw) => {
    try {
      const payload = JSON.parse(raw) as {
        id: string;
        tenantId: string;
        subjectType: ActivitySubjectType;
        subjectId: string;
        kind: string;
        eventType: string;
        message: string;
        createdAt: string;
        actorType: string;
        actorName?: string;
        metadata?: Record<string, unknown>;
        criticalAlert?: boolean;
      };
      void publishActivityEvent({
        ...payload,
        createdAt: new Date(payload.createdAt),
      });
    } catch {
      // Ignore malformed payloads
    }
  });

  void client
    .connect()
    .then(() => {
      if (subscriber !== client || client.status !== 'ready') return;
      return client.subscribe(TIMELINE_EVENTS_CHANNEL);
    })
    .catch((err: Error) => {
      console.warn('[timeline-redis-bridge] Could not connect to Redis:', err.message);
      teardownSubscriber();
    });
}
