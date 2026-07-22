import { ProductEditSection } from '../../ProductEditSection';
import { TimelineView, type TimelineEvent } from '../../../Timeline';

export interface ProductTimelineSectionProps {
  events: TimelineEvent[];
  allowComments?: boolean;
  commentDraft?: string;
  onCommentDraftChange?: (value: string) => void;
  onPostComment?: () => void;
  posting?: boolean;
  staffInitials?: string;
}

export function ProductTimelineSection({
  events,
  allowComments,
  commentDraft,
  onCommentDraftChange,
  onPostComment,
  posting,
  staffInitials,
}: ProductTimelineSectionProps) {
  return (
    <ProductEditSection title="Timeline" hint="Shopify: product events · LuxGen: course activity">
      <TimelineView
        embedded
        events={events}
        allowComments={allowComments}
        commentDraft={commentDraft}
        onCommentDraftChange={onCommentDraftChange}
        onPostComment={onPostComment}
        posting={posting}
        staffInitials={staffInitials}
      />
    </ProductEditSection>
  );
}
