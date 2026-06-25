import {
  Course,
  Enrollment,
  EnrollmentLearningStatus,
  EnrollmentPaymentStatus,
  User,
  UserRole,
  type IEnrollment,
  type IUser,
} from '@luxgen/db';
import { resolveProductPriceCents } from '../utils/productMeta';
import { enrollmentService } from './enrollmentService';
import { storefrontService } from './storefrontService';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ACTIVE_WINDOW_DAYS = 30;
const AT_RISK_WINDOW_DAYS = 30;

export type CustomerSegmentId = 'ALL' | 'ACTIVE_LEARNERS' | 'AT_RISK' | 'HIGH_VALUE' | 'INACTIVE';

export interface LearnerCourseProgress {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  progressPercent: number;
  learningStatus: string;
  lastAccessedAt?: Date;
  completedAt?: Date;
  enrolledAt: Date;
  paymentStatus: string;
}

export interface LearnerDashboardStats {
  enrolledCount: number;
  inProgressCount: number;
  completedCount: number;
  certificateCount: number;
}

export interface LearnerDashboard {
  studentId: string;
  courses: LearnerCourseProgress[];
  subscriptions: Awaited<ReturnType<typeof storefrontService.listLearnerSubscriptions>>;
  stats: LearnerDashboardStats;
}

export interface CustomerSegmentSummary {
  segment: CustomerSegmentId;
  label: string;
  customerCount: number;
  orderCount: number;
  avgProgressPercent: number;
}

export interface CustomerSegmentMember {
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderCount: number;
  lastOrderAt?: Date;
  totalPaidCents: number;
  avgProgressPercent: number;
  segment: CustomerSegmentId;
}

interface CustomerAggregate {
  customer: IUser;
  enrollments: IEnrollment[];
  orderCount: number;
  paidCount: number;
  totalPaidCents: number;
  avgProgressPercent: number;
  lastOrderAt?: Date;
  lastAccessedAt?: Date;
  hasActiveEnrollment: boolean;
}

function userDisplayName(user: IUser): string {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email;
}

function instructorName(course: {
  instructor?: IUser | { firstName?: string; lastName?: string; email?: string } | null;
}): string {
  const instructor = course.instructor as IUser | undefined;
  if (!instructor || typeof instructor === 'string') return 'Instructor';
  if (!('email' in instructor)) return 'Instructor';
  return userDisplayName(instructor);
}

function classifyCustomer(aggregate: CustomerAggregate): CustomerSegmentId {
  if (!aggregate.hasActiveEnrollment || aggregate.orderCount === 0) {
    return 'INACTIVE';
  }
  if (aggregate.paidCount >= 2) {
    return 'HIGH_VALUE';
  }

  const now = Date.now();
  const lastAccess = aggregate.lastAccessedAt?.getTime();
  if (lastAccess != null && now - lastAccess <= ACTIVE_WINDOW_DAYS * MS_PER_DAY) {
    return 'ACTIVE_LEARNERS';
  }

  const stale = lastAccess == null || now - lastAccess > AT_RISK_WINDOW_DAYS * MS_PER_DAY;
  if (stale) {
    return 'AT_RISK';
  }

  return 'ACTIVE_LEARNERS';
}

const SEGMENT_LABELS: Record<CustomerSegmentId, string> = {
  ALL: 'All customers',
  ACTIVE_LEARNERS: 'Active learners',
  AT_RISK: 'At risk',
  HIGH_VALUE: 'High value',
  INACTIVE: 'Inactive',
};

export class LearnerService {
  async getLearnerDashboard(tenantId: string, studentId: string): Promise<LearnerDashboard> {
    const enrollments = await enrollmentService.listByStudent(tenantId, studentId);
    const courseIds = enrollments.map((e) => e.course.toString());
    const courses = courseIds.length ? await Course.find({ _id: { $in: courseIds } }).populate('instructor') : [];

    const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

    const courseRows: LearnerCourseProgress[] = enrollments
      .filter((e) => !e.cancelledAt)
      .map((enrollment) => {
        const courseId = enrollment.course.toString();
        const course = courseMap.get(courseId);
        return {
          enrollmentId: enrollment._id.toString(),
          courseId,
          courseTitle: course?.title ?? 'Course',
          instructorName: course ? instructorName({ instructor: course.instructor as unknown as IUser }) : 'Instructor',
          progressPercent: enrollment.progressPercent ?? 0,
          learningStatus: enrollment.learningStatus ?? EnrollmentLearningStatus.ACTIVE,
          lastAccessedAt: enrollment.lastAccessedAt,
          completedAt: enrollment.completedAt,
          enrolledAt: enrollment.enrolledAt,
          paymentStatus: enrollment.paymentStatus,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastAccessedAt?.getTime() ?? a.enrolledAt.getTime();
        const bTime = b.lastAccessedAt?.getTime() ?? b.enrolledAt.getTime();
        return bTime - aTime;
      });

    const subscriptions = await storefrontService.listLearnerSubscriptions(studentId, tenantId);

    const active = courseRows.filter((c) => c.learningStatus !== EnrollmentLearningStatus.COMPLETED);
    const completed = courseRows.filter((c) => c.learningStatus === EnrollmentLearningStatus.COMPLETED);

    return {
      studentId,
      courses: courseRows,
      subscriptions,
      stats: {
        enrolledCount: courseRows.length,
        inProgressCount: active.length,
        completedCount: completed.length,
        certificateCount: completed.length,
      },
    };
  }

  private async buildCustomerAggregates(tenantId: string): Promise<CustomerAggregate[]> {
    const customers = await User.find({
      tenant: tenantId,
      role: { $in: [UserRole.STUDENT, UserRole.USER] },
    }).sort({ createdAt: -1 });

    const enrollments = await Enrollment.find({ tenant: tenantId });
    const courseIds = [...new Set(enrollments.map((e) => e.course.toString()))];
    const courses = courseIds.length ? await Course.find({ _id: { $in: courseIds } }) : [];
    const priceByCourseId = new Map(
      courses.map((course) => [course._id.toString(), resolveProductPriceCents(course.description, 0)]),
    );

    const byStudent = new Map<string, IEnrollment[]>();
    for (const enrollment of enrollments) {
      const studentId = enrollment.student.toString();
      const list = byStudent.get(studentId) ?? [];
      list.push(enrollment);
      byStudent.set(studentId, list);
    }

    return customers.map((customer) => {
      const customerId = customer._id.toString();
      const studentEnrollments = byStudent.get(customerId) ?? [];
      const activeEnrollments = studentEnrollments.filter((e) => !e.cancelledAt);
      const paidEnrollments = activeEnrollments.filter((e) => e.paymentStatus === EnrollmentPaymentStatus.PAID);

      const lastOrderAt = activeEnrollments.reduce<Date | undefined>((latest, e) => {
        const candidate = e.paidAt ?? e.enrolledAt;
        if (!candidate) return latest;
        if (!latest || candidate > latest) return candidate;
        return latest;
      }, undefined);

      const lastAccessedAt = activeEnrollments.reduce<Date | undefined>((latest, e) => {
        const candidate = e.lastAccessedAt;
        if (!candidate) return latest;
        if (!latest || candidate > latest) return candidate;
        return latest;
      }, undefined);

      const avgProgressPercent =
        activeEnrollments.length === 0
          ? 0
          : Math.round(
              activeEnrollments.reduce((sum, e) => sum + (e.progressPercent ?? 0), 0) / activeEnrollments.length,
            );

      return {
        customer,
        enrollments: studentEnrollments,
        orderCount: activeEnrollments.length,
        paidCount: paidEnrollments.length,
        totalPaidCents: paidEnrollments.reduce(
          (sum, enrollment) => sum + (priceByCourseId.get(enrollment.course.toString()) ?? 0),
          0,
        ),
        avgProgressPercent,
        lastOrderAt,
        lastAccessedAt,
        hasActiveEnrollment: activeEnrollments.length > 0,
      };
    });
  }

  async getCustomerSegments(tenantId: string): Promise<CustomerSegmentSummary[]> {
    const aggregates = await this.buildCustomerAggregates(tenantId);
    const classified = aggregates.map((row) => ({
      ...row,
      segment: classifyCustomer(row),
    }));

    const segmentIds: CustomerSegmentId[] = ['ALL', 'ACTIVE_LEARNERS', 'AT_RISK', 'HIGH_VALUE', 'INACTIVE'];

    return segmentIds.map((segment) => {
      const members = segment === 'ALL' ? classified : classified.filter((row) => row.segment === segment);
      const orderCount = members.reduce((sum, row) => sum + row.orderCount, 0);
      const avgProgressPercent =
        members.length === 0
          ? 0
          : Math.round(members.reduce((sum, row) => sum + row.avgProgressPercent, 0) / members.length);

      return {
        segment,
        label: SEGMENT_LABELS[segment],
        customerCount: members.length,
        orderCount,
        avgProgressPercent,
      };
    });
  }

  async getCustomersInSegment(tenantId: string, segment: CustomerSegmentId): Promise<CustomerSegmentMember[]> {
    const aggregates = await this.buildCustomerAggregates(tenantId);

    return aggregates
      .map((row) => {
        const resolvedSegment = classifyCustomer(row);
        return {
          customerId: row.customer._id.toString(),
          customerName: userDisplayName(row.customer),
          customerEmail: row.customer.email,
          orderCount: row.orderCount,
          lastOrderAt: row.lastOrderAt,
          totalPaidCents: row.totalPaidCents,
          avgProgressPercent: row.avgProgressPercent,
          segment: resolvedSegment,
        };
      })
      .filter((row) => segment === 'ALL' || row.segment === segment)
      .sort((a, b) => a.customerName.localeCompare(b.customerName));
  }
}

export const learnerService = new LearnerService();
