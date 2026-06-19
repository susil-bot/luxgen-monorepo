import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';
import { TimelineView, type TimelineEvent } from '../../../Timeline';

function customerEventsToTimeline(customer: CustomerDetail): TimelineEvent[] {
  return customer.timeline.map((e) => ({
    id: e.id,
    message: e.message,
    createdAt: e.at,
    kind: e.field ? ('FIELD_CHANGE' as const) : ('SYSTEM' as const),
    field: e.field,
    oldValue: e.oldValue,
    newValue: e.newValue,
  }));
}

export function CustomerHistorySection({
  customer,
  events,
  allowComments,
  commentDraft,
  onCommentDraftChange,
  onPostComment,
  posting,
  staffInitials,
}: {
  customer: CustomerDetail;
  events?: TimelineEvent[];
  allowComments?: boolean;
  commentDraft?: string;
  onCommentDraftChange?: (value: string) => void;
  onPostComment?: () => void;
  posting?: boolean;
  staffInitials?: string;
}) {
  return (
    <CustomerDetailSection title="Customer history" hint="Shopify timeline · LuxGen activity log">
      <TimelineView
        embedded
        events={events ?? customerEventsToTimeline(customer)}
        allowComments={allowComments}
        commentDraft={commentDraft}
        onCommentDraftChange={onCommentDraftChange}
        onPostComment={onPostComment}
        posting={posting}
        staffInitials={staffInitials}
      />
    </CustomerDetailSection>
  );
}
