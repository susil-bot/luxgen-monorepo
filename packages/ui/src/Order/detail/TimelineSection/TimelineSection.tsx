import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';
import { formatOrderDate } from '../../fetcher';

export interface TimelineSectionProps {
  order: OrderDetail;
}

export function TimelineSection({ order }: TimelineSectionProps) {
  return (
    <OrderDetailSection title="Timeline" hint="Shopify: order events · LuxGen: enrollment activity">
      <ul className="space-y-4">
        {order.timeline.map((event) => (
          <li key={event.id} className="flex gap-3">
            <div
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              style={{ background: 'var(--color-blue)' }}
            />
            <div>
              <p className="text-sm text-primary">{event.message}</p>
              <p className="text-xs text-tertiary">
                {formatOrderDate(event.at)}
                {event.actor ? ` · ${event.actor}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </OrderDetailSection>
  );
}
