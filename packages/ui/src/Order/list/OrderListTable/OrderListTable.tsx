import React, { memo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  formatOrderListDate,
  fulfillmentBadgeClass,
  fulfillmentDisplayLabel,
  paymentBadgeClass,
  paymentDisplayLabel,
  type OrderRow,
} from '../../fetcher';

export interface OrderListTableProps {
  orders: OrderRow[];
  orderHref?: (orderId: string) => string;
}

const VIRTUAL_THRESHOLD = 50;

const OrderListRow = memo(function OrderListRow({
  order,
  orderHref,
}: {
  order: OrderRow;
  orderHref: (orderId: string) => string;
}) {
  return (
    <tr>
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
  );
});

function OrderTableHead() {
  return (
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
  );
}

export function OrderListTable({ orders, orderHref = (id) => `/orders/${id}` }: OrderListTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });

  if (orders.length === 0) return null;

  if (orders.length <= VIRTUAL_THRESHOLD) {
    return (
      <div className="ios-table-wrap">
        <table className="ios-table">
          <OrderTableHead />
          <tbody>
            {orders.map((order) => (
              <OrderListRow key={order.id} order={order} orderHref={orderHref} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0 ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end : 0;

  return (
    <div ref={parentRef} className="ios-table-wrap max-h-[70vh] overflow-auto">
      <table className="ios-table">
        <OrderTableHead />
        <tbody>
          {paddingTop > 0 ? (
            <tr aria-hidden>
              <td colSpan={7} style={{ height: paddingTop, padding: 0, border: 0 }} />
            </tr>
          ) : null}
          {virtualItems.map((virtualRow) => (
            <OrderListRow key={orders[virtualRow.index].id} order={orders[virtualRow.index]} orderHref={orderHref} />
          ))}
          {paddingBottom > 0 ? (
            <tr aria-hidden>
              <td colSpan={7} style={{ height: paddingBottom, padding: 0, border: 0 }} />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
