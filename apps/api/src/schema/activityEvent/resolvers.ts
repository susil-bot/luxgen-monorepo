import { withFilter } from 'graphql-subscriptions';
import { activityEventService, actorFromContext } from '../../services/activityEventService';
import { ACTIVITY_EVENT_ADDED, activityPubSub, timelineTopic } from '../../lib/activityPubSub';
import type { GraphQLContext } from '../../context';
import type { ActivitySubjectType } from '@luxgen/db';
import { scopedTenantId } from '../../graphql/tenantScope';

function eventId(event: {
  _id?: { toString(): string };
  id?: string;
  subjectType: string;
  subjectId: string;
  eventType: string;
  createdAt: Date;
}): string {
  const fromDb = event._id?.toString?.() ?? event.id;
  if (fromDb) return fromDb;
  return `synth-${event.subjectType}-${event.subjectId}-${event.eventType}-${new Date(event.createdAt).getTime()}`;
}

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
  criticalAlert?: boolean;
}) {
  return {
    id: eventId(event),
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
    criticalAlert: event.criticalAlert ?? false,
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
        after,
      }: {
        tenantId: string;
        subjectType: ActivitySubjectType;
        subjectId: string;
        first?: number;
        after?: string;
      },
      ctx: GraphQLContext,
    ) => {
      const scoped = scopedTenantId(ctx, tenantId);
      const connection = await activityEventService.listConnection(scoped, subjectType, subjectId, first ?? 50, after);
      return {
        edges: connection.edges.map((edge) => ({
          cursor: edge.cursor,
          node: mapEvent(edge.node),
        })),
        pageInfo: connection.pageInfo,
        totalCount: connection.totalCount,
      };
    },
  },
  Mutation: {
    addActivityComment: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          tenantId: string;
          subjectType: ActivitySubjectType;
          subjectId: string;
          message: string;
          mentions?: string[];
          attachments?: Array<{ url: string; name: string; mimeType?: string }>;
        };
      },
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
        mentions: input.mentions,
        attachments: input.attachments,
      });
      return mapEvent(event);
    },
  },
  Subscription: {
    activityEventAdded: {
      subscribe: (withFilter as any)(
        () => (activityPubSub as any).asyncIterator(ACTIVITY_EVENT_ADDED),
        (
          payload:
            | { activityEventAdded: { tenantId: string; subjectType: string; subjectId: string }; topic: string }
            | undefined,
          variables: { tenantId: string; subjectType: string; subjectId: string },
        ) => {
          if (!payload) return false;
          const expected = timelineTopic(
            variables.tenantId,
            variables.subjectType as ActivitySubjectType,
            variables.subjectId,
          );
          return payload.topic === expected;
        },
      ),
      resolve: (payload: { activityEventAdded: ReturnType<typeof mapEvent> }) => mapEvent(payload.activityEventAdded),
    },
  },
};
