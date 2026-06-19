import {
  formatOrderListDate,
  fulfillmentBadgeClass,
  fulfillmentDisplayLabel,
  paymentBadgeClass,
  paymentDisplayLabel,
  type OrderRow,
} from '../../fetcher';
import { OrderTranslations } from '../../translations';

export interface OrderListTableProps {
  orders: OrderRow[];
  orderHref?: (orderId: string) => string;
}

export function OrderListTable({ orders, orderHref = (id) => `/orders/${encodeURIComponent(id)}` }: OrderListTableProps) {
  const t = OrderTranslations.en;

  if (orders.length === 0) {
    return (
      <div className="ios-card p-8 text-center">
        <p className="text-primary font-medium">{t.noOrders}</p>
        <p className="text-sm text-secondary mt-1">{t.noOrdersHint}</p>
      </div>
    );
  }

  return (
    <div className="ios-card overflow-hidden">
      <div className="ios-table-wrap">
        <table className="ios-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Course</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <a href={orderHref(order.id)} className="font-medium" style={{ color: 'var(--color-blue)' }}>
                    {order.orderNumber}
                  </a>
                </td>
                <td className="text-secondary">{formatOrderListDate(order.date)}</td>
                <td>
                  <div className="text-sm text-primary">{order.customerName}</div>
                  <div className="text-xs text-tertiary">{order.customerEmail}</div>
                </td>
                <td className="text-secondary max-w-[180px] truncate">{order.courseTitle}</td>
                <td>
                  <span className={`badge ${paymentBadgeClass(order.paymentStatus)}`}>
                    {paymentDisplayLabel(order.paymentStatus)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${fulfillmentBadgeClass(order.fulfillmentStatus)}`}>
                    {fulfillmentDisplayLabel(order.fulfillmentStatus)}
                  </span>
                </td>
                <td className="text-right font-medium">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
