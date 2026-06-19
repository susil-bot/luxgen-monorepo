/** Customer data layer — Shopify customers mapped to LuxGen learners (STUDENT users). */

import type { OrderRow } from '../Order/fetcher';
import { buildOrdersFromEnrollments, type EnrollmentCourseSource, type EnrollmentUserSource, type OrderEnrollmentSource } from '../Order/fetcher';

export type CustomerFilterTab = 'all' | 'subscribed' | 'active' | 'archived';

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  location: string;
  orderCount: number;
  amountSpent: string;
  customerSince: string;
  rfmGroup: string;
  tags: string[];
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  date: string;
  courseTitle: string;
  total: string;
  paymentStatus: string;
  fulfillmentStatus: string;
}

export interface CustomerTimelineEvent {
  id: string;
  at: string;
  message: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface CustomerDetail extends CustomerRow {
  phone: string;
  marketingEmail: boolean;
  marketingSms: boolean;
  marketingWhatsapp: boolean;
  storeCredit: string;
  notes: string;
  orders: CustomerOrderSummary[];
  lastOrder: CustomerOrderSummary | null;
  timeline: CustomerTimelineEvent[];
  metafields: { id: string; label: string; value: string }[];
}

function displayName(user: EnrollmentUserSource): string {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email;
}

function formatCustomerSince(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function deriveRfmGroup(orderCount: number): string {
  if (orderCount >= 5) return 'Champions';
  if (orderCount >= 2) return 'Loyal';
  if (orderCount === 1) return 'New customers';
  return 'Prospects';
}

export function buildCustomersFromUsers(
  users: EnrollmentUserSource[] | null | undefined,
  courses: EnrollmentCourseSource[] | null | undefined,
  enrollments?: OrderEnrollmentSource[] | null,
): CustomerRow[] {
  const orders = buildOrdersFromEnrollments(courses, users, enrollments);
  const orderCountByUser = new Map<string, number>();

  for (const order of orders) {
    orderCountByUser.set(order.customerId, (orderCountByUser.get(order.customerId) ?? 0) + 1);
  }

  const customers: CustomerRow[] = (users ?? [])
    .filter((u) => u.email)
    .map((user) => {
      const orderCount = orderCountByUser.get(user.id) ?? 0;
      return {
        id: user.id,
        name: displayName(user),
        email: user.email,
        location: '—',
        orderCount,
        amountSpent: orderCount > 0 ? '—' : '₹0.00',
        customerSince: formatCustomerSince(user.createdAt ?? new Date().toISOString()),
        rfmGroup: deriveRfmGroup(orderCount),
        tags: orderCount > 0 ? ['Active learner'] : [],
      };
    });

  return customers.sort((a, b) => b.orderCount - a.orderCount);
}

export function filterCustomersByTab(customers: CustomerRow[], tab: CustomerFilterTab): CustomerRow[] {
  switch (tab) {
    case 'subscribed':
      return customers.filter((c) => c.tags.includes('Active learner'));
    case 'active':
      return customers.filter((c) => c.orderCount > 0);
    case 'archived':
      return customers.filter((c) => c.orderCount === 0);
    default:
      return customers;
  }
}

function orderToSummary(order: OrderRow): CustomerOrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    date: order.date,
    courseTitle: order.courseTitle,
    total: order.total,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
  };
}

export function buildCustomerDetail(
  customer: CustomerRow,
  orders: OrderRow[],
): CustomerDetail {
  const customerOrders = orders
    .filter((o) => o.customerId === customer.id)
    .map(orderToSummary)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastOrder = customerOrders[0] ?? null;

  return {
    ...customer,
    phone: '—',
    marketingEmail: true,
    marketingSms: false,
    marketingWhatsapp: false,
    storeCredit: 'None',
    notes: '',
    orders: customerOrders,
    lastOrder,
    timeline: lastOrder
      ? [
          {
            id: '1',
            at: lastOrder.date,
            message: `Enrolled in ${lastOrder.courseTitle}`,
          },
          {
            id: '2',
            at: customer.customerSince,
            message: 'Customer account created',
            field: 'account',
            newValue: 'Active',
          },
        ]
      : [
          {
            id: '1',
            at: customer.customerSince,
            message: 'Customer account created',
          },
        ],
    metafields: [
      { id: 'newsletter', label: 'Newsletter sign up', value: 'False' },
      { id: 'learner_type', label: 'Learner type', value: customer.orderCount > 0 ? 'Enrolled' : 'Prospect' },
    ],
  };
}

export function findCustomerDetail(
  customers: CustomerRow[],
  customerId: string,
  courses: EnrollmentCourseSource[] | null | undefined,
  users: EnrollmentUserSource[] | null | undefined,
  enrollments?: OrderEnrollmentSource[] | null,
): CustomerDetail | null {
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return null;
  const orders = buildOrdersFromEnrollments(courses, users, enrollments);
  return buildCustomerDetail(customer, orders);
}

/** Build customer detail from a single user record (detail page direct lookup). */
export function buildCustomerDetailFromUser(
  user: EnrollmentUserSource,
  courses: EnrollmentCourseSource[] | null | undefined,
  users: EnrollmentUserSource[] | null | undefined,
  staffNotes?: string,
  enrollments?: OrderEnrollmentSource[] | null,
): CustomerDetail {
  const orders = buildOrdersFromEnrollments(courses, users, enrollments);
  const orderCount = orders.filter((o) => o.customerId === user.id).length;
  const row: CustomerRow = {
    id: user.id,
    name: displayName(user),
    email: user.email,
    location: '—',
    orderCount,
    amountSpent: orderCount > 0 ? '—' : '₹0.00',
    customerSince: formatCustomerSince(user.createdAt ?? new Date().toISOString()),
    rfmGroup: deriveRfmGroup(orderCount),
    tags: orderCount > 0 ? ['Active learner'] : [],
  };
  const detail = buildCustomerDetail(row, orders);
  detail.phone = user.phone?.trim() || '—';
  detail.marketingEmail = user.marketingEmail ?? true;
  detail.marketingSms = user.marketingSms ?? false;
  detail.marketingWhatsapp = user.marketingWhatsapp ?? false;
  if (staffNotes !== undefined) {
    detail.notes = staffNotes;
  }
  return detail;
}

export function formatCustomerListDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}
