/** Order data layer — Shopify order model mapped to LuxGen enrollments. */

export type OrderPaymentStatus = 'paid' | 'pending' | 'refunded' | 'voided';
export type OrderFulfillmentStatus = 'fulfilled' | 'unfulfilled' | 'partial' | 'restocked';
export type OrderFilterTab = 'all' | 'unpaid' | 'unfulfilled' | 'open' | 'archived';

export interface OrderLineItem {
  id: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  total: string;
  courseId: string;
}

export interface OrderTimelineEvent {
  id: string;
  at: string;
  message: string;
  actor?: string;
}

export interface OrderRow {
  /** 24-char enrollment ObjectId — used in URLs */
  id: string;
  /** Legacy composite key for activity timeline (`courseId:studentId`) */
  subjectId: string;
  courseId: string;
  studentId: string;
  orderNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  total: string;
  itemCount: number;
  courseTitle: string;
  archived: boolean;
}

export interface OrderDetail extends OrderRow {
  lineItems: OrderLineItem[];
  subtotal: string;
  discount: string;
  tax: string;
  notes: string;
  tags: string[];
  timeline: OrderTimelineEvent[];
  contactEmail: string;
  accessMethod: string;
  billingName: string;
  conversionSource: string;
}

export interface EnrollmentCourseSource {
  id: string;
  title: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  students?: { id: string }[] | null;
}

export interface EnrollmentUserSource {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: string;
  phone?: string | null;
  language?: string | null;
  marketingEmail?: boolean | null;
  marketingSms?: boolean | null;
  marketingWhatsapp?: boolean | null;
  staffNotes?: string | null;
  isArchived?: boolean | null;
  collectTax?: boolean | null;
  defaultAddress?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
  } | null;
}

function userDisplayName(user: EnrollmentUserSource): string {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email;
}

function formatOrderDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function orderNumberFromId(orderId: string): string {
  const hash = orderId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `#${1000 + (hash % 9000)}`;
}

function derivePaymentStatus(courseStatus?: string): OrderPaymentStatus {
  if (courseStatus === 'CANCELLED') return 'voided';
  if (courseStatus === 'DRAFT') return 'pending';
  return 'paid';
}

export function mapEnrollmentPaymentStatus(status?: string | null): OrderPaymentStatus {
  switch (status) {
    case 'PAID':
      return 'paid';
    case 'REFUNDED':
      return 'refunded';
    case 'VOIDED':
      return 'voided';
    default:
      return 'pending';
  }
}

function deriveFulfillmentStatus(
  courseStatus?: string,
  enrollment?: OrderEnrollmentSource | null,
): OrderFulfillmentStatus {
  if (enrollment?.paymentStatus === 'VOIDED' || enrollment?.paymentStatus === 'REFUNDED') {
    return 'restocked';
  }
  if (courseStatus === 'COMPLETED') return 'fulfilled';
  if (courseStatus === 'CANCELLED') return 'restocked';
  if (courseStatus === 'PUBLISHED') return 'partial';
  return 'unfulfilled';
}

export function paymentBadgeClass(status: OrderPaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'badge-green';
    case 'pending':
      return 'badge-orange';
    case 'refunded':
      return 'badge-gray';
    case 'voided':
      return 'badge-gray';
    default:
      return 'badge-gray';
  }
}

export function fulfillmentBadgeClass(status: OrderFulfillmentStatus): string {
  switch (status) {
    case 'fulfilled':
      return 'badge-green';
    case 'partial':
      return 'badge-blue';
    case 'unfulfilled':
      return 'badge-orange';
    case 'restocked':
      return 'badge-gray';
    default:
      return 'badge-gray';
  }
}

export function paymentDisplayLabel(status: OrderPaymentStatus): string {
  const labels: Record<OrderPaymentStatus, string> = {
    paid: 'Paid',
    pending: 'Pending',
    refunded: 'Refunded',
    voided: 'Voided',
  };
  return labels[status];
}

export function fulfillmentDisplayLabel(status: OrderFulfillmentStatus): string {
  const labels: Record<OrderFulfillmentStatus, string> = {
    fulfilled: 'Fulfilled',
    unfulfilled: 'Unfulfilled',
    partial: 'In progress',
    restocked: 'Restocked',
  };
  return labels[status];
}

export {
  buildOrderId,
  buildOrderSubjectId,
  enrollmentPairKey,
  isLegacyOrderId,
  isStandardOrderId,
  parseLegacyOrderId,
} from './orderId';
export type { OrderEnrollmentSource } from './orderId';

import { buildOrderSubjectId, enrollmentPairKey, isLegacyOrderId } from './orderId';
import type { OrderEnrollmentSource } from './orderId';

export function buildOrdersFromEnrollments(
  courses: EnrollmentCourseSource[] | null | undefined,
  users: EnrollmentUserSource[] | null | undefined,
  enrollments?: OrderEnrollmentSource[] | null,
): OrderRow[] {
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));
  const enrollmentByPair = new Map((enrollments ?? []).map((e) => [enrollmentPairKey(e.courseId, e.studentId), e]));
  const orders: OrderRow[] = [];

  for (const course of courses ?? []) {
    for (const student of course.students ?? []) {
      const user = userMap.get(student.id);
      if (!user) continue;

      const pairKey = enrollmentPairKey(course.id, student.id);
      const enrollment = enrollmentByPair.get(pairKey);
      const subjectId = buildOrderSubjectId(course.id, student.id);
      const orderId = enrollment?.id ?? subjectId;

      const date = enrollment?.enrolledAt ?? course.updatedAt ?? course.createdAt ?? new Date().toISOString();
      const archived = course.status === 'ARCHIVED' || course.status === 'CANCELLED';

      orders.push({
        id: orderId,
        subjectId,
        courseId: course.id,
        studentId: student.id,
        orderNumber: orderNumberFromId(orderId),
        date,
        customerId: user.id,
        customerName: userDisplayName(user),
        customerEmail: user.email,
        paymentStatus: enrollment?.paymentStatus
          ? mapEnrollmentPaymentStatus(enrollment.paymentStatus)
          : derivePaymentStatus(course.status),
        fulfillmentStatus: deriveFulfillmentStatus(course.status, enrollment),
        total: '—',
        itemCount: 1,
        courseTitle: course.title,
        archived,
      });
    }
  }

  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Build order rows from a pre-filtered enrollment list (e.g. draft orders). */
export function buildOrdersFromEnrollmentList(
  enrollments: OrderEnrollmentSource[],
  courses: EnrollmentCourseSource[] | null | undefined,
  users: EnrollmentUserSource[] | null | undefined,
): OrderRow[] {
  const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));
  const orders: OrderRow[] = [];

  for (const enrollment of enrollments) {
    const course = courseMap.get(enrollment.courseId);
    const user = userMap.get(enrollment.studentId);
    if (!course || !user) continue;

    const subjectId = buildOrderSubjectId(enrollment.courseId, enrollment.studentId);
    const orderId = enrollment.id ?? subjectId;
    const date = enrollment.enrolledAt ?? course.updatedAt ?? course.createdAt ?? new Date().toISOString();
    const archived = course.status === 'ARCHIVED' || course.status === 'CANCELLED';

    orders.push({
      id: orderId,
      subjectId,
      courseId: enrollment.courseId,
      studentId: enrollment.studentId,
      orderNumber: orderNumberFromId(orderId),
      date,
      customerId: user.id,
      customerName: userDisplayName(user),
      customerEmail: user.email,
      paymentStatus: enrollment.paymentStatus
        ? mapEnrollmentPaymentStatus(enrollment.paymentStatus)
        : derivePaymentStatus(course.status),
      fulfillmentStatus: deriveFulfillmentStatus(course.status, enrollment),
      total: '—',
      itemCount: 1,
      courseTitle: course.title,
      archived,
    });
  }

  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export interface AbandonedCheckoutSource {
  id: string;
  courseId: string;
  studentId: string;
  stripeSessionId: string;
  amountCents: number;
  currency: string;
  status: string;
  customerEmail?: string | null;
  checkoutUrl?: string | null;
  courseTitle?: string | null;
  createdAt: string;
  abandonedAt?: string | null;
}

export interface AbandonedCheckoutRow {
  id: string;
  date: string;
  customerEmail: string;
  customerName: string;
  courseTitle: string;
  amount: string;
  status: string;
  checkoutUrl?: string;
}

function formatCents(amountCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`;
  }
}

export function buildAbandonedCheckoutRows(
  sessions: AbandonedCheckoutSource[] | null | undefined,
  users?: EnrollmentUserSource[] | null,
): AbandonedCheckoutRow[] {
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  return (sessions ?? []).map((session) => {
    const user = userMap.get(session.studentId);
    const customerName = user ? userDisplayName(user) : (session.customerEmail ?? 'Guest');
    const customerEmail = session.customerEmail ?? user?.email ?? '—';

    return {
      id: session.id,
      date: session.abandonedAt ?? session.createdAt,
      customerEmail,
      customerName,
      courseTitle: session.courseTitle ?? 'Course',
      amount: formatCents(session.amountCents, session.currency),
      status: session.status.toLowerCase(),
      checkoutUrl: session.checkoutUrl ?? undefined,
    };
  });
}

export function filterOrdersByTab(orders: OrderRow[], tab: OrderFilterTab): OrderRow[] {
  switch (tab) {
    case 'unpaid':
      return orders.filter((o) => o.paymentStatus === 'pending');
    case 'unfulfilled':
      return orders.filter((o) => o.fulfillmentStatus === 'unfulfilled');
    case 'open':
      return orders.filter((o) => !o.archived && o.fulfillmentStatus !== 'fulfilled');
    case 'archived':
      return orders.filter((o) => o.archived);
    default:
      return orders;
  }
}

export function buildOrderDetail(order: OrderRow, course?: EnrollmentCourseSource | null): OrderDetail {
  const sku = `CRS-${course?.id.slice(-6).toUpperCase() ?? 'UNKNOWN'}`;
  const lineItem: OrderLineItem = {
    id: `${order.id}:line-1`,
    title: order.courseTitle,
    sku,
    quantity: 1,
    unitPrice: order.total === '—' ? '0.00' : order.total,
    total: order.total === '—' ? '0.00' : order.total,
    courseId: course?.id ?? order.courseId,
  };

  return {
    ...order,
    lineItems: [lineItem],
    subtotal: lineItem.total,
    discount: '0.00',
    tax: '0.00',
    notes: '',
    tags: [],
    contactEmail: order.customerEmail,
    accessMethod: 'Digital — LuxGen learner portal',
    billingName: order.customerName,
    conversionSource: 'Online Store',
    timeline: [
      {
        id: '1',
        at: order.date,
        message: 'Enrollment confirmed',
        actor: 'System',
      },
      {
        id: '2',
        at: order.date,
        message: `Access granted for ${order.courseTitle}`,
        actor: 'LuxGen',
      },
    ],
  };
}

export function findOrderDetail(
  orders: OrderRow[],
  orderId: string,
  courses: EnrollmentCourseSource[] | null | undefined,
): OrderDetail | null {
  const order =
    orders.find(
      (o) => o.id === orderId || o.subjectId === orderId || (isLegacyOrderId(orderId) && o.subjectId === orderId),
    ) ?? null;
  if (!order) return null;
  const course = courses?.find((c) => c.id === order.courseId);
  return buildOrderDetail(order, course);
}

export function formatOrderListDate(iso: string): string {
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

export { formatOrderDate };
