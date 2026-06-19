import { PubSub } from 'graphql-subscriptions';
import type { ActivitySubjectType } from '@luxgen/db';

export const ACTIVITY_EVENT_ADDED = 'ACTIVITY_EVENT_ADDED';

export interface ActivityEventPayload {
  id: string;
  tenantId: string;
  subjectType: ActivitySubjectType;
  subjectId: string;
  kind: string;
  eventType: string;
  message: string;
  createdAt: Date;
  actorType: string;
  actorName?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
  criticalAlert?: boolean;
}

export const activityPubSub = new PubSub();

export function timelineTopic(tenantId: string, subjectType: ActivitySubjectType, subjectId: string): string {
  return `timeline:${tenantId}:${subjectType}:${subjectId}`;
}

export async function publishActivityEvent(event: ActivityEventPayload): Promise<void> {
  const topic = timelineTopic(event.tenantId, event.subjectType as ActivitySubjectType, event.subjectId);
  await activityPubSub.publish(ACTIVITY_EVENT_ADDED, { activityEventAdded: event, topic });
}
