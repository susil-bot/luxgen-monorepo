import {
  formatOrderDate,
  fulfillmentBadgeClass,
  fulfillmentDisplayLabel,
  paymentBadgeClass,
  paymentDisplayLabel,
  type OrderDetail,
} from './fetcher';
import { OrderTranslations } from './translations';

export interface OrderDetailHeaderProps {
  order: OrderDetail;
  backHref?: string;
}

export function OrderDetailHeader({ order, backHref = '/orders' }: OrderDetailHeaderProps) {
  const t = OrderTranslations.en;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-wrap">
        <a href={backHref} className="ios-btn-plain text-sm flex-shrink-0">
          {t.backToOrders}
        </a>
        <div className="min-w-0 flex items-center gap-2 flex-wrap">
          <h1 className="text-lg sm:text-xl font-semibold text-primary">{order.orderNumber}</h1>
          <span className="text-sm text-secondary">{formatOrderDate(order.date)}</span>
          <span className={`badge ${paymentBadgeClass(order.paymentStatus)}`}>
            {paymentDisplayLabel(order.paymentStatus)}
          </span>
          <span className={`badge ${fulfillmentBadgeClass(order.fulfillmentStatus)}`}>
            {fulfillmentDisplayLabel(order.fulfillmentStatus)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button type="button" className="ios-btn-secondary text-sm" disabled>
          {t.refund}
        </button>
        <button type="button" className="ios-btn-secondary text-sm" disabled>
          {t.edit}
        </button>
        <button type="button" className="ios-btn-secondary text-sm" disabled>
          {t.moreActions}
        </button>
      </div>
    </div>
  );
}
