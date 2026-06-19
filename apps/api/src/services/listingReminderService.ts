import { BusinessListing } from '@luxgen/db';
import { listingNotificationService } from './listingNotificationService';
import { logger } from '../utils/logger';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(date: Date | undefined): number {
  if (!date) return Infinity;
  return (Date.now() - date.getTime()) / DAY_MS;
}

function reminderIntervalDays(key: string, fallback: number): number {
  const envKey = `LISTING_REMINDER_${key.toUpperCase()}_DAYS`;
  const val = process.env[envKey];
  return val ? Number(val) : fallback;
}

export class ListingReminderService {
  async processReminders(tenantId?: string): Promise<{ sent: number }> {
    const filter: Record<string, unknown> = tenantId ? { tenantId } : {};
    let sent = 0;

    const draftListings = await BusinessListing.find({
      ...filter,
      applicationStatus: 'draft',
    });

    for (const listing of draftListings) {
      const interval = reminderIntervalDays('draft', 3);
      const last = listing.lastReminderAt?.draft ?? listing.createdAt;
      if (daysSince(last) < interval) continue;

      await listingNotificationService.send('reminder_draft', {
        tenantId: listing.tenantId,
        listingId: String(listing._id),
        recipientEmail: listing.applicantEmail,
        context: {
          applicantName: listing.applicantName || listing.applicantEmail.split('@')[0],
          businessName: listing.businessName,
          listingId: String(listing._id),
          tenantId: listing.tenantId,
        },
      });

      listing.lastReminderAt = { ...listing.lastReminderAt, draft: new Date() };
      await listing.save();
      sent += 1;
    }

    const needInfoListings = await BusinessListing.find({
      ...filter,
      applicationStatus: 'need_more_information',
    });

    for (const listing of needInfoListings) {
      const interval = reminderIntervalDays('need_info', 2);
      const last = listing.lastReminderAt?.needMoreInformation ?? listing.updatedAt;
      if (daysSince(last) < interval) continue;

      await listingNotificationService.send('reminder_need_more_information', {
        tenantId: listing.tenantId,
        listingId: String(listing._id),
        recipientEmail: listing.applicantEmail,
        context: {
          applicantName: listing.applicantName || listing.applicantEmail.split('@')[0],
          businessName: listing.businessName,
          listingId: String(listing._id),
          tenantId: listing.tenantId,
          reviewerNotes: listing.reviewerNotes,
        },
      });

      listing.lastReminderAt = { ...listing.lastReminderAt, needMoreInformation: new Date() };
      await listing.save();
      sent += 1;
    }

    const paymentListings = await BusinessListing.find({
      ...filter,
      applicationStatus: 'awaiting_payment',
    });

    for (const listing of paymentListings) {
      const interval = reminderIntervalDays('payment', 1);
      const last = listing.lastReminderAt?.awaitingPayment ?? listing.approvedAt ?? listing.updatedAt;
      if (daysSince(last) < interval) continue;

      await listingNotificationService.send('reminder_awaiting_payment', {
        tenantId: listing.tenantId,
        listingId: String(listing._id),
        recipientEmail: listing.applicantEmail,
        context: {
          applicantName: listing.applicantName || listing.applicantEmail.split('@')[0],
          businessName: listing.businessName,
          listingId: String(listing._id),
          tenantId: listing.tenantId,
        },
      });

      listing.lastReminderAt = { ...listing.lastReminderAt, awaitingPayment: new Date() };
      await listing.save();
      sent += 1;
    }

    const expiredListings = await BusinessListing.find({
      ...filter,
      applicationStatus: 'expired',
    });

    for (const listing of expiredListings) {
      const interval = reminderIntervalDays('expired', 7);
      const last = listing.lastReminderAt?.expiredRenewal ?? listing.expiredAt ?? listing.updatedAt;
      if (daysSince(last) < interval) continue;

      await listingNotificationService.send('reminder_expired_renewal', {
        tenantId: listing.tenantId,
        listingId: String(listing._id),
        recipientEmail: listing.applicantEmail,
        context: {
          applicantName: listing.applicantName || listing.applicantEmail.split('@')[0],
          businessName: listing.businessName,
          listingId: String(listing._id),
          tenantId: listing.tenantId,
        },
      });

      listing.lastReminderAt = { ...listing.lastReminderAt, expiredRenewal: new Date() };
      await listing.save();
      sent += 1;
    }

    logger.info(`Listing reminders processed: ${sent} sent`);
    return { sent };
  }
}

export const listingReminderService = new ListingReminderService();
