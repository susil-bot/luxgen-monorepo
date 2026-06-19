import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';
import { TimelineView, type TimelineEvent } from '../../../Timeline';

export interface TimelineSectionProps {
  order: OrderDetail;
  events?: TimelineEvent[];
  allowComments?: boolean;
  commentDraft?: string;
  onCommentDraftChange?: (value: string) => void;
  onPostComment?: () => void;
  posting?: boolean;
  staffInitials?: string;
}

function orderEventsToTimeline(order: OrderDetail): TimelineEvent[] {
  return order.timeline.map((e) => ({
    id: e.id,
    message: e.message,
    createdAt: e.at,
    kind: 'SYSTEM' as const,
    actorType: 'SYSTEM' as const,
    actorName: e.actor,
  }));
}

export function TimelineSection({
  order,
  events,
  allowComments,
  commentDraft,
  onCommentDraftChange,
  onPostComment,
  posting,
  staffInitials,
}: TimelineSectionProps) {
  return (
    <OrderDetailSection title="Timeline" hint="Shopify: order events · LuxGen: enrollment activity">
      <TimelineView
        embedded
        events={events ?? orderEventsToTimeline(order)}
        allowComments={allowComments}
        commentDraft={commentDraft}
        onCommentDraftChange={onCommentDraftChange}
        onPostComment={onPostComment}
        posting={posting}
        staffInitials={staffInitials}
      />
    </OrderDetailSection>
  );
}
