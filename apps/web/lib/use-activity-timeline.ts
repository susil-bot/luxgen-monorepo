import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import type {
  TimelineActivityProps,
  TimelineCommentAttachment,
  TimelineEvent,
  TimelineSubjectType,
} from '@luxgen/ui';
import {
  ACTIVITY_EVENT_ADDED,
  ADD_ACTIVITY_COMMENT,
  GET_ACTIVITY_EVENTS,
} from '../graphql/queries/activity-events';

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
  criticalAlert?: boolean;
}

const PAGE_SIZE = 50;

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
    criticalAlert: e.criticalAlert,
    mentions: Array.isArray(e.metadata?.mentions) ? (e.metadata.mentions as string[]) : undefined,
    attachments: Array.isArray(e.metadata?.attachments)
      ? (e.metadata.attachments as TimelineCommentAttachment[])
      : undefined,
  }));
}

export function useActivityTimeline(
  tenantId: string | undefined,
  subjectType: TimelineSubjectType,
  subjectId: string | undefined,
  staffInitials = 'ST',
  mentionOptions: string[] = [],
): TimelineActivityProps | undefined {
  const [commentDraft, setCommentDraft] = useState('');
  const [commentMentions, setCommentMentions] = useState<string[]>([]);
  const [commentAttachments, setCommentAttachments] = useState<TimelineCommentAttachment[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [liveEvents, setLiveEvents] = useState<TimelineEvent[]>([]);

  const { data, refetch, fetchMore } = useQuery(GET_ACTIVITY_EVENTS, {
    variables: { tenantId, subjectType, subjectId, first: PAGE_SIZE },
    skip: !tenantId || !subjectId,
    fetchPolicy: 'cache-and-network',
  });

  useSubscription(ACTIVITY_EVENT_ADDED, {
    variables: { tenantId, subjectType, subjectId },
    skip: !tenantId || !subjectId,
    onData: ({ data: subData }) => {
      const node = subData.data?.activityEventAdded as GraphQLActivityEvent | undefined;
      if (!node) return;
      const mapped = mapActivityEvents([node])[0];
      setLiveEvents((prev) => {
        if (prev.some((e) => e.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
    },
  });

  const [addComment, { loading: posting }] = useMutation(ADD_ACTIVITY_COMMENT);

  const baseEvents = useMemo(
    () => mapActivityEvents(data?.activityEvents?.edges?.map((e: { node: GraphQLActivityEvent }) => e.node)),
    [data?.activityEvents?.edges],
  );

  useEffect(() => {
    setEndCursor(data?.activityEvents?.pageInfo?.endCursor ?? null);
    setHasMore(Boolean(data?.activityEvents?.pageInfo?.hasNextPage));
  }, [data?.activityEvents?.pageInfo]);

  const events = useMemo(() => {
    const merged = [...liveEvents, ...baseEvents];
    const seen = new Set<string>();
    return merged.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [baseEvents, liveEvents]);

  const onLoadMore = useCallback(async () => {
    if (!tenantId || !subjectId || !endCursor || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { tenantId, subjectType, subjectId, first: PAGE_SIZE, after: endCursor },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            activityEvents: {
              ...fetchMoreResult.activityEvents,
              edges: [...prev.activityEvents.edges, ...fetchMoreResult.activityEvents.edges],
            },
          };
        },
      });
    } finally {
      setLoadingMore(false);
    }
  }, [endCursor, fetchMore, hasMore, loadingMore, subjectId, subjectType, tenantId]);

  const onPostComment = useCallback(async () => {
    if (!tenantId || !subjectId || !commentDraft.trim()) return;
    await addComment({
      variables: {
        input: {
          tenantId,
          subjectType,
          subjectId,
          message: commentDraft.trim(),
          mentions: commentMentions.length ? commentMentions : undefined,
          attachments: commentAttachments.length ? commentAttachments : undefined,
        },
      },
    });
    setCommentDraft('');
    setCommentMentions([]);
    setCommentAttachments([]);
    await refetch();
  }, [addComment, commentAttachments, commentDraft, commentMentions, refetch, subjectId, subjectType, tenantId]);

  const onAddAttachment = useCallback((attachment: TimelineCommentAttachment) => {
    setCommentAttachments((prev) => [...prev, attachment]);
  }, []);

  const onRemoveAttachment = useCallback((url: string) => {
    setCommentAttachments((prev) => prev.filter((a) => a.url !== url));
  }, []);

  if (!tenantId || !subjectId) return undefined;

  return {
    events,
    allowComments: true,
    commentDraft,
    onCommentDraftChange: setCommentDraft,
    onPostComment: () => void onPostComment(),
    posting,
    staffInitials,
    mentionOptions,
    commentMentions,
    onMentionsChange: setCommentMentions,
    commentAttachments,
    onAddAttachment,
    onRemoveAttachment,
    hasMore,
    loadingMore,
    onLoadMore,
  };
}
