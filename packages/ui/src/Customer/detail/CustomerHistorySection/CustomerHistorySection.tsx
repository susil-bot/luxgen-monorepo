import type { CustomerDetail } from '../../fetcher';
import type { TimelineActivityProps } from '../../../Timeline';
import { CustomerBlocksSection } from '../BlocksSection/BlocksSection';
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

export type CustomerHistorySectionProps = {
  customer: CustomerDetail;
} & Partial<TimelineActivityProps>;

export function CustomerHistorySection({ customer, events, ...timeline }: CustomerHistorySectionProps) {
  const resolvedEvents = events ?? customerEventsToTimeline(customer);

  return (
    <CustomerBlocksSection changeCount={resolvedEvents.length}>
      <TimelineView embedded events={resolvedEvents} {...timeline} />
    </CustomerBlocksSection>
  );
}
