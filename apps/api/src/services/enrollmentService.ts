import Stripe from 'stripe';
import { Enrollment, EnrollmentPaymentStatus, Course, User, enrollmentSubjectId, type IEnrollment } from '@luxgen/db';
import { activityEventService } from './activityEventService';
import { isBillingDevMode, isStripeEnabled } from './billingService';
import { logger } from '../utils/logger';

function getStripe(): Stripe | null {
  if (!isStripeEnabled()) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export class EnrollmentService {
  async getById(id: string): Promise<IEnrollment | null> {
    return Enrollment.findById(id);
  }

  async listByTenant(tenantId: string): Promise<IEnrollment[]> {
    return Enrollment.find({ tenant: tenantId }).sort({ enrolledAt: -1 });
  }

  async getByCourseAndStudent(courseId: string, studentId: string): Promise<IEnrollment | null> {
    return Enrollment.findOne({ course: courseId, student: studentId });
  }

  async ensureEnrollment(tenantId: string, courseId: string, studentId: string): Promise<IEnrollment> {
    let enrollment = await this.getByCourseAndStudent(courseId, studentId);
    if (enrollment) {
      if (enrollment.cancelledAt) {
        enrollment.cancelledAt = undefined;
        enrollment.enrolledAt = new Date();
        enrollment.paymentStatus = EnrollmentPaymentStatus.PENDING;
        await enrollment.save();
      }
      return enrollment;
    }

    enrollment = await Enrollment.create({
      tenant: tenantId,
      course: courseId,
      student: studentId,
      notes: '',
      paymentStatus: EnrollmentPaymentStatus.PENDING,
      enrolledAt: new Date(),
    });
    return enrollment;
  }

  async updateOrderNotes(
    courseId: string,
    studentId: string,
    notes: string,
    actor?: { id: string; name: string },
  ): Promise<IEnrollment> {
    let enrollment = (await Enrollment.findOne({ course: courseId, student: studentId })) as IEnrollment | null;
    if (!enrollment) {
      const course = await Course.findById(courseId);
      if (!course) throw new Error('Course not found');
      const tenantId = course.tenant.toString();
      enrollment = await this.ensureEnrollment(tenantId, courseId, studentId);
    }

    const previous = enrollment.notes;
    enrollment.notes = notes;
    await enrollment.save();

    if (notes.trim() && notes !== previous) {
      const tenantId = enrollment.tenant.toString();
      const subjectId = enrollmentSubjectId(courseId, studentId);
      await activityEventService.recordOrderNoteAdded(tenantId, subjectId, notes, actor);
    }

    return enrollment;
  }

  async updateCustomerNotes(
    customerId: string,
    notes: string,
    actor?: { id: string; name: string },
  ): Promise<{ id: string; staffNotes: string; tenantId: string }> {
    const user = await User.findById(customerId);
    if (!user) throw new Error('Customer not found');

    const previous = user.staffNotes ?? '';
    user.staffNotes = notes;
    await user.save();

    if (notes.trim() && notes !== previous) {
      await activityEventService.recordCustomerNoteAdded(user.tenant.toString(), customerId, notes, actor);
    }

    return {
      id: user.id,
      staffNotes: user.staffNotes ?? '',
      tenantId: user.tenant.toString(),
    };
  }

  async refundEnrollment(
    courseId: string,
    studentId: string,
    actor?: { id: string; name: string },
  ): Promise<IEnrollment> {
    const enrollment = await Enrollment.findOne({ course: courseId, student: studentId });
    if (!enrollment) throw new Error('Order not found');

    if (enrollment.paymentStatus !== EnrollmentPaymentStatus.PAID) {
      throw new Error('Only paid orders can be refunded');
    }

    enrollment.paymentStatus = EnrollmentPaymentStatus.REFUNDED;
    await enrollment.save();

    const course = await Course.findById(courseId);
    const tenantId = enrollment.tenant.toString();
    const subjectId = enrollmentSubjectId(courseId, studentId);
    await activityEventService.recordOrderRefunded(tenantId, subjectId, course?.title ?? 'course', actor);

    return enrollment;
  }

  async updateOrder(
    courseId: string,
    studentId: string,
    updates: { notes?: string; paymentStatus?: EnrollmentPaymentStatus },
    actor?: { id: string; name: string },
  ): Promise<IEnrollment> {
    let enrollment = (await Enrollment.findOne({ course: courseId, student: studentId })) as IEnrollment | null;
    if (!enrollment) {
      const course = await Course.findById(courseId);
      if (!course) throw new Error('Course not found');
      enrollment = await this.ensureEnrollment(course.tenant.toString(), courseId, studentId);
    }

    const tenantId = enrollment.tenant.toString();
    const subjectId = enrollmentSubjectId(courseId, studentId);
    const changes: string[] = [];

    if (updates.notes !== undefined && updates.notes !== enrollment.notes) {
      const previous = enrollment.notes;
      enrollment.notes = updates.notes;
      if (updates.notes.trim() && updates.notes !== previous) {
        await activityEventService.recordOrderNoteAdded(tenantId, subjectId, updates.notes, actor);
      }
      changes.push('notes');
    }

    if (updates.paymentStatus !== undefined && updates.paymentStatus !== enrollment.paymentStatus) {
      const oldStatus = enrollment.paymentStatus;
      enrollment.paymentStatus = updates.paymentStatus;
      if (updates.paymentStatus === EnrollmentPaymentStatus.PAID && !enrollment.paidAt) {
        enrollment.paidAt = new Date();
      }
      if (updates.paymentStatus === EnrollmentPaymentStatus.VOIDED && !enrollment.cancelledAt) {
        enrollment.cancelledAt = new Date();
      }
      await activityEventService.recordOrderUpdated(
        tenantId,
        subjectId,
        `Payment status changed to ${updates.paymentStatus.toLowerCase()}`,
        actor,
        'paymentStatus',
        oldStatus,
        updates.paymentStatus,
      );
      changes.push('paymentStatus');
    }

    if (changes.length === 0) return enrollment;

    await enrollment.save();
    return enrollment;
  }

  async cancelEnrollment(
    courseId: string,
    studentId: string,
    actor?: { id: string; name: string },
  ): Promise<IEnrollment | null> {
    const enrollment = await Enrollment.findOne({ course: courseId, student: studentId });
    if (!enrollment) return null;

    enrollment.cancelledAt = new Date();
    enrollment.paymentStatus = EnrollmentPaymentStatus.VOIDED;
    await enrollment.save();

    const course = await Course.findById(courseId);
    const student = await User.findById(studentId);
    const tenantId = enrollment.tenant.toString();
    const subjectId = enrollmentSubjectId(courseId, studentId);

    await activityEventService.recordOrderCancelled(
      tenantId,
      subjectId,
      course?.title ?? 'course',
      student?.email ?? 'customer',
      actor,
    );

    return enrollment;
  }

  async markPaymentConfirmed(
    tenantId: string,
    courseId: string,
    studentId: string,
    stripeSessionId?: string,
  ): Promise<IEnrollment> {
    const enrollment = await Enrollment.findOneAndUpdate(
      { course: courseId, student: studentId, tenant: tenantId },
      {
        $set: {
          paymentStatus: EnrollmentPaymentStatus.PAID,
          paidAt: new Date(),
          ...(stripeSessionId ? { stripeCheckoutSessionId: stripeSessionId } : {}),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    if (!enrollment) throw new Error('Failed to update enrollment payment');

    const course = await Course.findById(courseId);
    const subjectId = enrollmentSubjectId(courseId, studentId);
    await activityEventService.recordOrderPaymentConfirmed(
      tenantId,
      subjectId,
      course?.title ?? 'course',
      stripeSessionId,
    );

    return enrollment;
  }

  async createOrderCheckoutSession(options: {
    tenantId: string;
    courseId: string;
    studentId: string;
    amountCents: number;
    courseTitle: string;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }> {
    const { tenantId, courseId, studentId, amountCents, courseTitle, customerEmail, successUrl, cancelUrl } = options;

    await this.ensureEnrollment(tenantId, courseId, studentId);

    const stripe = getStripe();
    if (!stripe) {
      if (isBillingDevMode()) {
        await this.markPaymentConfirmed(tenantId, courseId, studentId, `dev_sim_${Date.now()}`);
        logger.info(`[billing-dev] Simulated order payment ${courseId}:${studentId}`);
        return { url: successUrl, sessionId: `dev_sim_${Date.now()}` };
      }
      throw new Error('Stripe is not configured for order checkout.');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: { name: courseTitle },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'enrollment',
        tenantId,
        courseId,
        studentId,
      },
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { url: session.url, sessionId: session.id };
  }

  async handleEnrollmentCheckoutCompleted(session: Stripe.Checkout.Session): Promise<boolean> {
    if (session.metadata?.type !== 'enrollment') return false;

    const { tenantId, courseId, studentId } = session.metadata;
    if (!tenantId || !courseId || !studentId) return false;

    await this.markPaymentConfirmed(tenantId, courseId, studentId, session.id);
    logger.info(`Enrollment payment confirmed: ${courseId}:${studentId}`);
    return true;
  }
}

export const enrollmentService = new EnrollmentService();
