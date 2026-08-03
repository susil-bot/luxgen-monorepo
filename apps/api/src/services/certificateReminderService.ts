import { Enrollment } from '@luxgen/db';
import { emitCertificateExpiringSoonEvent } from '@luxgen/agent';
import { logger } from '../utils/logger';

const DAY_MS = 24 * 60 * 60 * 1000;

function reminderThresholdDays(): number {
  const val = process.env.CERTIFICATE_REMINDER_DAYS;
  return val ? Number(val) : 30;
}

function reminderCooldownDays(): number {
  const val = process.env.CERTIFICATE_REMINDER_COOLDOWN_DAYS;
  return val ? Number(val) : 14;
}

/**
 * Daily sweep job backing the `learner.certificate.expiring_soon` trigger.
 * Unlike enrollment/order events, recertification has no live user action to hang a trigger
 * off — it's purely time-based, so a cron-style scan is required (same pattern as
 * `listingReminderService` for business listing renewals).
 */
export class CertificateReminderService {
  async processReminders(tenantId?: string): Promise<{ sent: number }> {
    const thresholdDays = reminderThresholdDays();
    const cooldownDays = reminderCooldownDays();
    const now = new Date();
    const windowEnd = new Date(now.getTime() + thresholdDays * DAY_MS);
    const cooldownCutoff = new Date(now.getTime() - cooldownDays * DAY_MS);

    const filter: Record<string, unknown> = {
      certificateExpiresAt: { $ne: null, $gt: now, $lte: windowEnd },
      $or: [{ certificateReminderSentAt: null }, { certificateReminderSentAt: { $lte: cooldownCutoff } }],
    };
    if (tenantId) filter.tenant = tenantId;

    const enrollments = await Enrollment.find(filter).populate('course').populate('student');

    let sent = 0;
    for (const enrollment of enrollments) {
      const course = enrollment.course as unknown as { title?: string } | undefined;
      const student = enrollment.student as unknown as { email?: string } | undefined;
      const email = student?.email;
      if (!email || !enrollment.certificateExpiresAt) continue;

      const daysBefore = Math.max(
        0,
        Math.ceil((enrollment.certificateExpiresAt.getTime() - now.getTime()) / DAY_MS),
      );

      try {
        await emitCertificateExpiringSoonEvent(String(enrollment.tenant), {
          enrollmentId: String(enrollment._id),
          courseId: String(enrollment.course),
          studentId: String(enrollment.student),
          userId: String(enrollment.student),
          customerEmail: email,
          courseTitle: course?.title,
          daysBefore,
          certificateExpiresAt: enrollment.certificateExpiresAt,
        });

        enrollment.certificateReminderSentAt = now;
        await enrollment.save();
        sent += 1;
      } catch (e: unknown) {
        logger.error(
          `Certificate reminder failed for enrollment ${String(enrollment._id)}:`,
          e instanceof Error ? e.message : String(e),
        );
      }
    }

    return { sent };
  }
}

export const certificateReminderService = new CertificateReminderService();
