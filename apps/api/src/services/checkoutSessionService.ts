import { CheckoutSession, CheckoutSessionStatus, type ICheckoutSession } from '@luxgen/db';

/** Open Stripe sessions older than this are treated as abandoned. */
const ABANDONED_AFTER_MS = 60 * 60 * 1000;

export class CheckoutSessionService {
  async recordOpenSession(params: {
    tenantId: string;
    courseId: string;
    studentId: string;
    stripeSessionId: string;
    amountCents: number;
    currency?: string;
    customerEmail?: string;
    checkoutUrl?: string;
    courseTitle?: string;
    expiresAt?: Date;
  }): Promise<ICheckoutSession> {
    const doc = await CheckoutSession.findOneAndUpdate(
      { stripeSessionId: params.stripeSessionId },
      {
        tenant: params.tenantId,
        course: params.courseId,
        student: params.studentId,
        stripeSessionId: params.stripeSessionId,
        amountCents: params.amountCents,
        currency: params.currency ?? 'usd',
        customerEmail: params.customerEmail,
        checkoutUrl: params.checkoutUrl,
        courseTitle: params.courseTitle,
        expiresAt: params.expiresAt,
        status: CheckoutSessionStatus.OPEN,
        completedAt: undefined,
        abandonedAt: undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return doc!;
  }

  async markCompleted(stripeSessionId: string): Promise<void> {
    await CheckoutSession.findOneAndUpdate(
      { stripeSessionId },
      { status: CheckoutSessionStatus.COMPLETED, completedAt: new Date() },
    );
  }

  async refreshStaleSessions(tenantId: string): Promise<void> {
    const cutoff = new Date(Date.now() - ABANDONED_AFTER_MS);
    await CheckoutSession.updateMany(
      {
        tenant: tenantId,
        status: CheckoutSessionStatus.OPEN,
        createdAt: { $lt: cutoff },
      },
      { status: CheckoutSessionStatus.ABANDONED, abandonedAt: new Date() },
    );
  }

  async listAbandoned(tenantId: string): Promise<ICheckoutSession[]> {
    await this.refreshStaleSessions(tenantId);
    return CheckoutSession.find({
      tenant: tenantId,
      status: { $in: [CheckoutSessionStatus.ABANDONED, CheckoutSessionStatus.EXPIRED] },
    }).sort({ createdAt: -1 });
  }
}

export const checkoutSessionService = new CheckoutSessionService();
