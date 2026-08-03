import { Course, Enrollment, User, enrollmentSubjectId } from '@luxgen/db';

export type OrderStatusTab = 'all' | 'unpaid' | 'unfulfilled' | 'open' | 'archived';

export interface ApiOrderRow {
  id: string;
  subjectId: string;
  courseId: string;
  studentId: string;
  orderNumber: string;
  date: Date;
  customerId: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  learningStatus: string;
  total: string;
  itemCount: number;
  courseTitle: string;
  archived: boolean;
}

export interface ListOrderRowsOptions {
  statusTab?: OrderStatusTab | null;
}

function orderNumberFromId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

function userDisplayName(user: { firstName?: string; lastName?: string; email: string }): string {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email;
}

export function mapPayment(status?: string, courseStatus?: string): string {
  if (status === 'PAID') return 'paid';
  if (status === 'REFUNDED') return 'refunded';
  if (status === 'VOIDED') return 'voided';
  if (courseStatus === 'DRAFT') return 'pending';
  if (status === 'PENDING' || !status) return 'pending';
  return 'pending';
}

/** Align with UI OrderFulfillmentStatus: fulfilled | unfulfilled | partial | restocked */
export function mapFulfillment(params: {
  courseStatus?: string;
  paymentStatus?: string;
  learningStatus?: string;
  progressPercent?: number;
}): string {
  const { courseStatus, paymentStatus, learningStatus, progressPercent } = params;
  if (paymentStatus === 'VOIDED' || paymentStatus === 'REFUNDED') return 'restocked';
  if (courseStatus === 'ARCHIVED' || courseStatus === 'CANCELLED') return 'restocked';
  if (learningStatus === 'COMPLETED' || (progressPercent ?? 0) >= 100) return 'fulfilled';
  if (learningStatus === 'ACTIVE' || courseStatus === 'PUBLISHED') return 'partial';
  return 'unfulfilled';
}

function formatTotalCents(cents: number | null | undefined, currency = 'usd'): string {
  if (cents == null || !Number.isFinite(cents)) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function matchesStatusTab(row: ApiOrderRow, tab: OrderStatusTab): boolean {
  switch (tab) {
    case 'unpaid':
      return row.paymentStatus === 'pending';
    case 'unfulfilled':
      return row.fulfillmentStatus === 'unfulfilled' || row.fulfillmentStatus === 'partial';
    case 'open':
      return !row.archived && row.fulfillmentStatus !== 'fulfilled';
    case 'archived':
      return row.archived;
    default:
      return true;
  }
}

/** Pre-joined order rows for orders page (UI-147). */
export async function listOrderRows(
  tenantId: string,
  options: ListOrderRowsOptions = {},
): Promise<ApiOrderRow[]> {
  const [courses, users, enrollments] = await Promise.all([
    Course.find({ tenant: tenantId }).populate('students'),
    User.find({ tenant: tenantId }),
    Enrollment.find({ tenant: tenantId }),
  ]);

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));
  const enrollmentByPair = new Map(
    enrollments.map((e) => [
      `${typeof e.course === 'string' ? e.course : e.course.toString()}:${typeof e.student === 'string' ? e.student : e.student.toString()}`,
      e,
    ]),
  );

  const rows: ApiOrderRow[] = [];

  for (const course of courses) {
    const courseId = course._id.toString();
    const students = (course.students ?? []) as Array<{
      _id: { toString(): string };
      firstName?: string;
      lastName?: string;
      email: string;
    }>;
    for (const student of students) {
      const studentId = student._id.toString();
      const user = userMap.get(studentId) ?? student;
      const pairKey = `${courseId}:${studentId}`;
      const enrollment = enrollmentByPair.get(pairKey);
      const subjectId = enrollmentSubjectId(courseId, studentId);
      const orderId = enrollment?._id?.toString() ?? subjectId;
      const date = enrollment?.enrolledAt ?? course.updatedAt ?? course.createdAt ?? new Date();
      const paymentStatus = mapPayment(enrollment?.paymentStatus, course.status);
      const fulfillmentStatus = mapFulfillment({
        courseStatus: course.status,
        paymentStatus: enrollment?.paymentStatus,
        learningStatus: enrollment?.learningStatus,
        progressPercent: enrollment?.progressPercent,
      });
      const commerce = course.commerce as { priceCents?: number; currency?: string } | undefined;

      rows.push({
        id: orderId,
        subjectId,
        courseId,
        studentId,
        orderNumber: orderNumberFromId(orderId),
        date,
        customerId: studentId,
        customerName: userDisplayName(user as { firstName?: string; lastName?: string; email: string }),
        customerEmail: (user as { email: string }).email,
        paymentStatus,
        fulfillmentStatus,
        learningStatus: enrollment?.learningStatus ?? 'ACTIVE',
        total: formatTotalCents(commerce?.priceCents, commerce?.currency ?? 'usd'),
        itemCount: 1,
        courseTitle: course.title,
        archived: course.status === 'ARCHIVED' || course.status === 'CANCELLED',
      });
    }
  }

  const sorted = rows.sort((a, b) => b.date.getTime() - a.date.getTime());
  const tab = options.statusTab && options.statusTab !== 'all' ? options.statusTab : null;
  if (!tab) return sorted;
  return sorted.filter((row) => matchesStatusTab(row, tab));
}
