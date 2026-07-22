import { Course, Enrollment, User, enrollmentSubjectId } from '@luxgen/db';

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
  total: string;
  itemCount: number;
  courseTitle: string;
  archived: boolean;
}

function orderNumberFromId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

function userDisplayName(user: { firstName?: string; lastName?: string; email: string }): string {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email;
}

function mapPayment(status?: string, courseStatus?: string): string {
  if (status === 'PAID') return 'paid';
  if (status === 'REFUNDED') return 'refunded';
  if (status === 'VOIDED') return 'voided';
  if (courseStatus === 'DRAFT') return 'pending';
  return 'pending';
}

function mapFulfillment(courseStatus?: string, progress?: number): string {
  if (courseStatus === 'ARCHIVED' || courseStatus === 'CANCELLED') return 'unfulfilled';
  if ((progress ?? 0) >= 100) return 'fulfilled';
  return 'unfulfilled';
}

/** Pre-joined order rows for orders page (UI-147). */
export async function listOrderRows(tenantId: string): Promise<ApiOrderRow[]> {
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
        paymentStatus: mapPayment(enrollment?.paymentStatus, course.status),
        fulfillmentStatus: mapFulfillment(course.status, enrollment?.progressPercent),
        total: '—',
        itemCount: 1,
        courseTitle: course.title,
        archived: course.status === 'ARCHIVED' || course.status === 'CANCELLED',
      });
    }
  }

  return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
}
