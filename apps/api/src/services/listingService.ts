import { BusinessListing, type IBusinessListing, type ApplicationStatus, type IStatusHistoryEntry } from '@luxgen/db';
import { listingNotificationService } from './listingNotificationService';
import { logger } from '../utils/logger';

export interface CreateListingInput {
  tenantId: string;
  applicantEmail: string;
  applicantName?: string;
  applicantUserId?: string;
  businessName: string;
  description?: string;
  category?: string;
  website?: string;
  phone?: string;
  address?: string;
}

export interface UpdateListingInput {
  businessName?: string;
  description?: string;
  category?: string;
  website?: string;
  phone?: string;
  address?: string;
  applicantName?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

async function uniqueSlug(tenantId: string, base: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (await BusinessListing.findOne({ tenantId, slug })) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

function emailContext(listing: IBusinessListing) {
  return {
    applicantName: listing.applicantName || listing.applicantEmail.split('@')[0],
    businessName: listing.businessName,
    listingId: String(listing._id),
    tenantId: listing.tenantId,
    reviewerNotes: listing.reviewerNotes,
  };
}

export class ListingService {
  private async transition(
    listing: IBusinessListing,
    status: ApplicationStatus,
    options: { by?: string; note?: string; publicationStatus?: IBusinessListing['publicationStatus'] } = {},
  ): Promise<IBusinessListing> {
    const entry: IStatusHistoryEntry = {
      status,
      at: new Date(),
      by: options.by,
      note: options.note,
    };

    listing.applicationStatus = status;
    listing.statusHistory.push(entry);
    if (options.publicationStatus) {
      listing.publicationStatus = options.publicationStatus;
    }

    await listing.save();
    return listing;
  }

  async createDraft(input: CreateListingInput): Promise<IBusinessListing> {
    const baseSlug = slugify(input.businessName) || 'listing';
    const slug = await uniqueSlug(input.tenantId, baseSlug);

    const listing = await BusinessListing.create({
      ...input,
      slug,
      applicationStatus: 'draft',
      publicationStatus: 'unpublished',
      statusHistory: [{ status: 'draft', at: new Date() }],
    });

    logger.info(`Listing draft created: ${listing.businessName} (${listing.tenantId})`);
    return listing;
  }

  async updateDraft(id: string, input: UpdateListingInput): Promise<IBusinessListing | null> {
    const listing = await BusinessListing.findById(id);
    if (!listing || listing.applicationStatus !== 'draft') return null;
    Object.assign(listing, input);
    await listing.save();
    return listing;
  }

  async submitApplication(id: string, tenantId: string, userId?: string): Promise<IBusinessListing | null> {
    const listing = await BusinessListing.findOne({ _id: id, tenantId });
    if (!listing || !['draft', 'need_more_information'].includes(listing.applicationStatus)) {
      return null;
    }

    listing.submittedAt = new Date();
    if (userId) listing.applicantUserId = userId;
    return this.transition(listing, 'submitted', { note: 'Application submitted by applicant' });
  }

  async requestMoreInformation(id: string, reviewerId: string, notes: string): Promise<IBusinessListing | null> {
    const listing = await BusinessListing.findById(id);
    if (!listing || listing.applicationStatus !== 'submitted') return null;

    listing.reviewerNotes = notes;
    const updated = await this.transition(listing, 'need_more_information', {
      by: reviewerId,
      note: notes,
    });

    await listingNotificationService.send('additional_information_requested', {
      tenantId: updated.tenantId,
      listingId: String(updated._id),
      recipientEmail: updated.applicantEmail,
      context: emailContext(updated),
    });

    return updated;
  }

  async approveApplication(id: string, reviewerId: string): Promise<IBusinessListing | null> {
    const listing = await BusinessListing.findById(id);
    if (!listing || !['submitted', 'need_more_information'].includes(listing.applicationStatus)) {
      return null;
    }

    listing.approvedAt = new Date();
    const updated = await this.transition(listing, 'awaiting_payment', {
      by: reviewerId,
      note: 'Approved — awaiting payment',
    });

    await listingNotificationService.send('application_approved', {
      tenantId: updated.tenantId,
      listingId: String(updated._id),
      recipientEmail: updated.applicantEmail,
      context: emailContext(updated),
    });

    return updated;
  }

  async rejectApplication(id: string, reviewerId: string, notes: string): Promise<IBusinessListing | null> {
    const listing = await BusinessListing.findById(id);
    if (!listing || !['submitted', 'need_more_information'].includes(listing.applicationStatus)) {
      return null;
    }

    listing.reviewerNotes = notes;
    const updated = await this.transition(listing, 'rejected', {
      by: reviewerId,
      note: notes,
      publicationStatus: 'unpublished',
    });

    await listingNotificationService.send('application_rejected', {
      tenantId: updated.tenantId,
      listingId: String(updated._id),
      recipientEmail: updated.applicantEmail,
      context: emailContext(updated),
    });

    return updated;
  }

  /** Active subscription + payment → publish (no editorial intervention). */
  async publishListing(id: string): Promise<IBusinessListing | null> {
    const listing = await BusinessListing.findById(id);
    if (!listing) return null;

    listing.subscriptionActive = true;
    listing.paymentCompletedAt = new Date();
    listing.publishedAt = new Date();
    listing.expiredAt = undefined;

    const updated = await this.transition(listing, 'published', {
      note: 'Payment confirmed — auto-published',
      publicationStatus: 'published',
    });

    await listingNotificationService.send('payment_confirmation', {
      tenantId: updated.tenantId,
      listingId: String(updated._id),
      recipientEmail: updated.applicantEmail,
      context: emailContext(updated),
    });

    return updated;
  }

  /** Subscription canceled → unpublish, retain data, mark expired. */
  async expireListing(id: string): Promise<IBusinessListing | null> {
    const listing = await BusinessListing.findById(id);
    if (!listing) return null;

    listing.subscriptionActive = false;
    listing.expiredAt = new Date();

    const updated = await this.transition(listing, 'expired', {
      note: 'Subscription canceled — profile unpublished',
      publicationStatus: 'expired',
    });

    await listingNotificationService.send('subscription_expiration', {
      tenantId: updated.tenantId,
      listingId: String(updated._id),
      recipientEmail: updated.applicantEmail,
      context: emailContext(updated),
    });

    return updated;
  }

  /** Subscription renewed → republish with retained data. */
  async republishListing(id: string): Promise<IBusinessListing | null> {
    const listing = await BusinessListing.findById(id);
    if (!listing || listing.applicationStatus !== 'expired') return null;

    listing.subscriptionActive = true;
    listing.publishedAt = new Date();
    listing.expiredAt = undefined;

    return this.transition(listing, 'published', {
      note: 'Subscription renewed — auto-republished',
      publicationStatus: 'published',
    });
  }

  async getPublishedListings(tenantId: string) {
    return BusinessListing.find({ tenantId, publicationStatus: 'published' }).sort({ publishedAt: -1 });
  }

  async getListingBySlug(tenantId: string, slug: string) {
    return BusinessListing.findOne({ tenantId, slug, publicationStatus: 'published' });
  }

  async getListingById(id: string) {
    return BusinessListing.findById(id);
  }

  async getApplicationsForReview(tenantId: string, status?: ApplicationStatus) {
    const filter: Record<string, unknown> = { tenantId };
    if (status) {
      filter.applicationStatus = status;
    } else {
      filter.applicationStatus = { $in: ['submitted', 'need_more_information', 'awaiting_payment'] };
    }
    return BusinessListing.find(filter).sort({ submittedAt: -1, updatedAt: -1 });
  }

  async getApplicantListings(tenantId: string, email: string) {
    return BusinessListing.find({ tenantId, applicantEmail: email.toLowerCase() }).sort({ updatedAt: -1 });
  }

  toGraphQL(listing: IBusinessListing) {
    return {
      id: String(listing._id),
      tenantId: listing.tenantId,
      applicantEmail: listing.applicantEmail,
      applicantName: listing.applicantName ?? null,
      businessName: listing.businessName,
      slug: listing.slug,
      description: listing.description ?? null,
      category: listing.category ?? null,
      website: listing.website ?? null,
      phone: listing.phone ?? null,
      address: listing.address ?? null,
      applicationStatus: listing.applicationStatus.toUpperCase(),
      publicationStatus: listing.publicationStatus.toUpperCase(),
      reviewerNotes: listing.reviewerNotes ?? null,
      subscriptionActive: listing.subscriptionActive,
      publishedAt: listing.publishedAt ?? null,
      expiredAt: listing.expiredAt ?? null,
      submittedAt: listing.submittedAt ?? null,
      approvedAt: listing.approvedAt ?? null,
      paymentCompletedAt: listing.paymentCompletedAt ?? null,
      statusHistory: listing.statusHistory.map((h) => ({
        status: h.status.toUpperCase(),
        at: h.at,
        by: h.by ?? null,
        note: h.note ?? null,
      })),
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }
}

export const listingService = new ListingService();
