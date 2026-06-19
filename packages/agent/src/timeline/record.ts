import {
  ActivityEvent,
  ActivityActorType,
  ActivityEventKind,
  ActivitySubjectType,
  type IActivityEvent,
} from '@luxgen/db';
import { getRedisClient } from '../queue/redis-queue';

export const TIMELINE_EVENTS_CHANNEL = 'luxgen:timeline:events';

export interface TimelineRecordInput {
  tenantId: string;
  subjectType: ActivitySubjectType;
  subjectId: string;
  kind: ActivityEventKind;
  eventType: string;
  message: string;
  actorType?: ActivityActorType;
  actorName?: string;
  metadata?: Record<string, unknown>;
  criticalAlert?: boolean;
}

export async function recordTimelineEvent(input: TimelineRecordInput): Promise<IActivityEvent | null> {
  const event = await ActivityEvent.create({
    tenant: input.tenantId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    kind: input.kind,
    eventType: input.eventType,
    message: input.message,
    actorType: input.actorType ?? ActivityActorType.APP,
    actorName: input.actorName,
    metadata: input.metadata ?? {},
    criticalAlert: input.criticalAlert ?? false,
  });

  await publishTimelineEvent({
    id: String(event._id),
    tenantId: input.tenantId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    kind: input.kind,
    eventType: input.eventType,
    message: input.message,
    createdAt: event.createdAt,
    actorType: input.actorType ?? ActivityActorType.APP,
    actorName: input.actorName,
    metadata: input.metadata,
    criticalAlert: input.criticalAlert,
  });

  return event;
}

export async function publishTimelineEvent(payload: {
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
  metadata?: Record<string, unknown>;
  criticalAlert?: boolean;
}): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    if (client.status !== 'ready') await client.connect();
    await client.publish(TIMELINE_EVENTS_CHANNEL, JSON.stringify(payload));
  } catch {
    // Optional cross-process fan-out
  }
}

export function orderSubjectId(courseId: string, studentId: string): string {
  return `${courseId}:${studentId}`;
}

export function subjectsFromAutomationPayload(payload: Record<string, unknown>): Array<{
  subjectType: ActivitySubjectType;
  subjectId: string;
}> {
  const subjects: Array<{ subjectType: ActivitySubjectType; subjectId: string }> = [];
  const courseId = payload.courseId as string | undefined;
  const studentId = (payload.studentId ?? payload.userId) as string | undefined;
  const orderId = payload.orderId as string | undefined;

  if (orderId) {
    subjects.push({ subjectType: ActivitySubjectType.ORDER, subjectId: orderId });
    const [, sid] = orderId.split(':');
    if (sid) subjects.push({ subjectType: ActivitySubjectType.CUSTOMER, subjectId: sid });
  } else if (courseId && studentId) {
    subjects.push({ subjectType: ActivitySubjectType.ORDER, subjectId: orderSubjectId(courseId, studentId) });
    subjects.push({ subjectType: ActivitySubjectType.CUSTOMER, subjectId: studentId });
  } else if (courseId) {
    subjects.push({ subjectType: ActivitySubjectType.PRODUCT, subjectId: courseId });
  } else if (studentId) {
    subjects.push({ subjectType: ActivitySubjectType.CUSTOMER, subjectId: studentId });
  }

  return subjects;
}
