import { getRedisUrl } from '@luxgen/config';
import Redis from 'ioredis';
import { publishActivityEvent } from './activityPubSub';
import type { ActivitySubjectType } from '@luxgen/db';

const TIMELINE_EVENTS_CHANNEL = 'luxgen:timeline:events';

let subscriber: Redis | null = null;

export function startTimelineRedisBridge(): void {
  if (subscriber) return;

  const url = getRedisUrl();
  if (!url || process.env.TIMELINE_REDIS_BRIDGE === 'false') return;

  try {
    subscriber = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
    subscriber.on('error', () => undefined);
    subscriber.connect().then(() => {
      void subscriber?.subscribe(TIMELINE_EVENTS_CHANNEL);
    });

    subscriber.on('message', (_channel, raw) => {
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
  } catch {
    subscriber = null;
  }
}
