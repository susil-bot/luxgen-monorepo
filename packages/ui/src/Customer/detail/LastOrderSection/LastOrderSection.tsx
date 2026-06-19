import type { CustomerDetail } from '../../fetcher';
import { CustomerDetailSection } from '../../CustomerDetailSection';
import { CustomerTranslations } from '../../translations';
import { formatCustomerListDate } from '../../fetcher';

export function LastOrderSection({
  customer,
  onCreateOrder,
}: {
  customer: CustomerDetail;
  onCreateOrder?: () => void;
}) {
  const t = CustomerTranslations.en;
  const order = customer.lastOrder;

  return (
    <CustomerDetailSection title="Last order placed">
      {!order ? (
        <div className="space-y-3">
          <p className="text-sm text-secondary">No orders yet</p>
          <button type="button" className="ios-btn-primary text-sm" onClick={onCreateOrder} disabled={!onCreateOrder}>
            {t.createOrder}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <a href={`/orders/${order.id}`} className="font-medium" style={{ color: 'var(--color-blue)' }}>
              {order.orderNumber}
            </a>
            <span className="badge badge-green">{order.paymentStatus}</span>
            <span className="badge badge-orange">{order.fulfillmentStatus}</span>
            <span className="text-sm text-secondary ml-auto">{order.total}</span>
          </div>
          <p className="text-xs text-tertiary mb-3">{formatCustomerListDate(order.date)}</p>
          <div className="flex items-start gap-3 pb-3" style={{ borderBottom: '1px solid var(--color-separator)' }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'var(--color-fill-quaternary)' }}>
              📘
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">{order.courseTitle}</p>
            </div>
            <span className="text-sm text-secondary">× 1</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <a href="/orders" className="ios-btn-secondary text-sm">
              {t.viewAllOrders}
            </a>
            <button type="button" className="ios-btn-primary text-sm" onClick={onCreateOrder} disabled={!onCreateOrder}>
              {t.createOrder}
            </button>
          </div>
        </>
      )}
    </CustomerDetailSection>
  );
}
