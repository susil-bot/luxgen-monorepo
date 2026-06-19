import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import type { TimelineActivityProps, TimelineEvent, TimelineSubjectType } from '@luxgen/ui';
import { ADD_ACTIVITY_COMMENT, GET_ACTIVITY_EVENTS } from '../graphql/queries/activity-events';

interface GraphQLActivityEvent {
  id: string;
  kind: string;
  eventType: string;
  message: string;
  createdAt: string;
  actorType?: string;
  actorName?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}

export function mapActivityEvents(rows: GraphQLActivityEvent[] | undefined): TimelineEvent[] {
  return (rows ?? []).map((e) => ({
    id: e.id,
    message: e.message,
    createdAt: e.createdAt,
    kind: e.kind as TimelineEvent['kind'],
    eventType: e.eventType,
    actorType: e.actorType as TimelineEvent['actorType'],
    actorName: e.actorName,
    field: e.field,
    oldValue: e.oldValue,
    newValue: e.newValue,
    metadata: e.metadata,
  }));
}

export function useActivityTimeline(
  tenantId: string | undefined,
  subjectType: TimelineSubjectType,
  subjectId: string | undefined,
  staffInitials = 'ST',
): TimelineActivityProps | undefined {
  const [commentDraft, setCommentDraft] = useState('');

  const { data, refetch } = useQuery(GET_ACTIVITY_EVENTS, {
    variables: { tenantId, subjectType, subjectId, first: 50 },
    skip: !tenantId || !subjectId,
    fetchPolicy: 'cache-and-network',
  });

  const [addComment, { loading: posting }] = useMutation(ADD_ACTIVITY_COMMENT);

  const events = useMemo(
    () => mapActivityEvents(data?.activityEvents),
    [data?.activityEvents],
  );

  const onPostComment = useCallback(async () => {
    if (!tenantId || !subjectId || !commentDraft.trim()) return;
    await addComment({
      variables: {
        input: {
          tenantId,
          subjectType,
          subjectId,
          message: commentDraft.trim(),
        },
      },
    });
    setCommentDraft('');
    await refetch();
  }, [addComment, commentDraft, refetch, subjectId, subjectType, tenantId]);

  if (!tenantId || !subjectId) return undefined;

  return {
    events,
    allowComments: true,
    commentDraft,
    onCommentDraftChange: setCommentDraft,
    onPostComment: () => void onPostComment(),
    posting,
    staffInitials,
  };
}
