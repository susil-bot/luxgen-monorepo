import { activityEventService, actorFromContext } from '../../services/activityEventService';
import type { GraphQLContext } from '../../context';
import type { ActivitySubjectType } from '@luxgen/db';

function mapEvent(event: {
  _id?: { toString(): string };
  id?: string;
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
}) {
  return {
    id: event._id?.toString?.() ?? event.id,
    subjectType: event.subjectType,
    subjectId: event.subjectId,
    kind: event.kind,
    eventType: event.eventType,
    message: event.message,
    createdAt: event.createdAt,
    actorType: event.actorType,
    actorName: event.actorName,
    field: event.field,
    oldValue: event.oldValue,
    newValue: event.newValue,
    metadata: event.metadata ?? {},
  };
}

export const activityEventResolvers = {
  Query: {
    activityEvents: async (
      _: unknown,
      {
        tenantId,
        subjectType,
        subjectId,
        first,
      }: { tenantId: string; subjectType: ActivitySubjectType; subjectId: string; first?: number },
    ) => {
      const events = await activityEventService.list(tenantId, subjectType, subjectId, first ?? 50);
      return events.map(mapEvent);
    },
  },
  Mutation: {
    addActivityComment: async (
      _: unknown,
      { input }: { input: { tenantId: string; subjectType: ActivitySubjectType; subjectId: string; message: string } },
      context: GraphQLContext,
    ) => {
      const actor = actorFromContext(context.user);
      if (!actor) throw new Error('Authentication required');
      const event = await activityEventService.addComment({
        tenantId: input.tenantId,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        message: input.message.trim(),
        actorId: actor.id,
        actorName: actor.name,
      });
      return mapEvent(event);
    },
  },
};
