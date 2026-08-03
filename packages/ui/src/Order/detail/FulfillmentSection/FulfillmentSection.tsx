import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';
import { fulfillmentDisplayLabel, learningDisplayLabel } from '../../fetcher';

export interface FulfillmentSectionProps {
  order: OrderDetail;
}

export function FulfillmentSection({ order }: FulfillmentSectionProps) {
  return (
    <OrderDetailSection
      title="Order items"
      hint={`Fulfillment: ${fulfillmentDisplayLabel(order.fulfillmentStatus)} · Learning: ${learningDisplayLabel(order.learningStatus)}`}
    >
      <div className="space-y-3">
        {order.lineItems.length === 0 ? (
          <p className="text-sm text-secondary">No line items</p>
        ) : (
          order.lineItems.map((item) => (
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
                {item.learningStatus ? (
                  <p className="text-xs text-secondary mt-1">
                    Status: {learningDisplayLabel(item.learningStatus)}
                  </p>
                ) : null}
              </div>
              <div className="text-right text-sm flex-shrink-0">
                <p className="text-secondary">× {item.quantity}</p>
                <p className="font-medium text-primary">{item.total === '0.00' ? '—' : item.total}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </OrderDetailSection>
  );
}
