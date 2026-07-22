import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';
import { fulfillmentDisplayLabel } from '../../fetcher';

export interface FulfillmentSectionProps {
  order: OrderDetail;
}

export function FulfillmentSection({ order }: FulfillmentSectionProps) {
  return (
    <OrderDetailSection
      title="Fulfillment"
      hint={`Shopify: ship items · LuxGen: ${fulfillmentDisplayLabel(order.fulfillmentStatus)}`}
    >
      <div className="space-y-3">
        {order.lineItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 pb-3"
            style={{ borderBottom: '1px solid var(--color-separator)' }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'var(--color-fill-quaternary)' }}
            >
              📘
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">{item.title}</p>
              <p className="text-xs text-secondary">SKU: {item.sku}</p>
            </div>
            <div className="text-right text-sm flex-shrink-0">
              <p className="text-secondary">× {item.quantity}</p>
              <p className="font-medium text-primary">{item.total === '0.00' ? '—' : item.total}</p>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="ios-btn-secondary text-sm" disabled>
        Mark as fulfilled
      </button>
    </OrderDetailSection>
  );
}
