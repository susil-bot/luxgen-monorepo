import { listingService } from '../../services/listingService';
import { listingSubscriptionService } from '../../services/listingSubscriptionService';
import { listingReminderService } from '../../services/listingReminderService';
import { listingNotificationService } from '../../services/listingNotificationService';
import type { GraphQLContext } from '../../context';
import type { ApplicationStatus } from '@luxgen/db';

function fromGqlStatus(status: string): ApplicationStatus {
  return status.toLowerCase() as ApplicationStatus;
}

function requireReviewer(ctx: GraphQLContext): string {
  const userId = ctx.user?._id?.toString() || ctx.user?.id;
  if (!userId) throw new Error('Reviewer authentication required');
  return userId;
}

export const listingResolvers = {
  Query: {
    publishedListings: async (_: unknown, { tenantId }: { tenantId: string }) => {
      const items = await listingService.getPublishedListings(tenantId);
      return items.map((l) => listingService.toGraphQL(l));
    },
    publishedListing: async (_: unknown, { tenantId, slug }: { tenantId: string; slug: string }) => {
      const item = await listingService.getListingBySlug(tenantId, slug);
      return item ? listingService.toGraphQL(item) : null;
    },
    listing: async (_: unknown, { id }: { id: string }) => {
      const item = await listingService.getListingById(id);
      return item ? listingService.toGraphQL(item) : null;
    },
    myListings: async (_: unknown, { tenantId, email }: { tenantId: string; email: string }) => {
      const items = await listingService.getApplicantListings(tenantId, email);
      return items.map((l) => listingService.toGraphQL(l));
    },
    listingsForReview: async (_: unknown, { tenantId, status }: { tenantId: string; status?: string }) => {
      const items = await listingService.getApplicationsForReview(tenantId, status ? fromGqlStatus(status) : undefined);
      return items.map((l) => listingService.toGraphQL(l));
    },
    listingNotifications: async (_: unknown, { listingId, limit }: { listingId: string; limit?: number }) => {
      const logs = await listingNotificationService.getNotificationHistory(listingId, limit ?? 20);
      return logs.map((log) => ({
        id: String(log._id),
        template: log.template,
        subject: log.subject,
        status: log.status,
        sentAt: log.sentAt,
      }));
    },
  },
  Mutation: {
    createListingDraft: async (_: unknown, { input }: { input: Parameters<typeof listingService.createDraft>[0] }) => {
      const created = await listingService.createDraft(input);
      return listingService.toGraphQL(created);
    },
    updateListingDraft: async (
      _: unknown,
      { id, input }: { id: string; input: Parameters<typeof listingService.updateDraft>[1] },
    ) => {
      const updated = await listingService.updateDraft(id, input);
      return updated ? listingService.toGraphQL(updated) : null;
    },
    submitListingApplication: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const userId = ctx.user?._id?.toString() || ctx.user?.id;
      const updated = await listingService.submitApplication(id, userId);
      return updated ? listingService.toGraphQL(updated) : null;
    },
    requestListingInformation: async (
      _: unknown,
      { id, notes }: { id: string; notes: string },
      ctx: GraphQLContext,
    ) => {
      const reviewerId = requireReviewer(ctx);
      const updated = await listingService.requestMoreInformation(id, reviewerId, notes);
      return updated ? listingService.toGraphQL(updated) : null;
    },
    approveListing: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const reviewerId = requireReviewer(ctx);
      const updated = await listingService.approveApplication(id, reviewerId);
      return updated ? listingService.toGraphQL(updated) : null;
    },
    rejectListing: async (_: unknown, { id, notes }: { id: string; notes: string }, ctx: GraphQLContext) => {
      const reviewerId = requireReviewer(ctx);
      const updated = await listingService.rejectApplication(id, reviewerId, notes);
      return updated ? listingService.toGraphQL(updated) : null;
    },
    createListingCheckoutSession: async (
      _: unknown,
      { listingId, successUrl, cancelUrl }: { listingId: string; successUrl: string; cancelUrl: string },
    ) => {
      return listingSubscriptionService.createListingCheckoutSession({ listingId, successUrl, cancelUrl });
    },
    processListingReminders: async (_: unknown, { tenantId }: { tenantId?: string }) => {
      return listingReminderService.processReminders(tenantId);
    },
  },
};
