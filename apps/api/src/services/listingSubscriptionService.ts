import Stripe from 'stripe';
import { BusinessListing } from '@luxgen/db';
import { listingService } from './listingService';
import { isBillingDevMode } from './billingService';
import { logger } from '../utils/logger';

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getListingPriceId(): string | null {
  return process.env.STRIPE_PRICE_LISTING ?? null;
}

export class ListingSubscriptionService {
  async createListingCheckoutSession(options: {
    listingId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }> {
    const listing = await BusinessListing.findById(options.listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.applicationStatus !== 'awaiting_payment' && listing.applicationStatus !== 'expired') {
      throw new Error('Listing is not eligible for payment');
    }

    const stripe = getStripe();
    const priceId = getListingPriceId();

    if (!stripe || !priceId) {
      if (isBillingDevMode()) {
        if (listing.applicationStatus === 'expired') {
          await listingService.republishListing(options.listingId);
        } else {
          await listingService.publishListing(options.listingId);
        }
        return { url: options.successUrl, sessionId: `dev_listing_${Date.now()}` };
      }
      throw new Error('Stripe listing price not configured. Set STRIPE_PRICE_LISTING or BILLING_DEV_MODE=true.');
    }

    let customerId = listing.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: listing.applicantEmail,
        name: listing.applicantName || listing.businessName,
        metadata: { listingId: String(listing._id), tenantId: listing.tenantId },
      });
      customerId = customer.id;
      listing.stripeCustomerId = customerId;
      await listing.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: {
        type: 'listing_subscription',
        listingId: String(listing._id),
        tenantId: listing.tenantId,
      },
      subscription_data: {
        metadata: {
          type: 'listing_subscription',
          listingId: String(listing._id),
          tenantId: listing.tenantId,
        },
      },
    });

    if (!session.url) throw new Error('Stripe did not return checkout URL');
    return { url: session.url, sessionId: session.id };
  }

  async handleStripeEvent(event: Stripe.Event): Promise<boolean> {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type !== 'listing_subscription') return false;

      const listingId = session.metadata.listingId;
      if (!listingId) return false;

      await BusinessListing.findByIdAndUpdate(listingId, {
        $set: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });

      const listing = await BusinessListing.findById(listingId);
      if (listing?.applicationStatus === 'expired') {
        await listingService.republishListing(listingId);
      } else {
        await listingService.publishListing(listingId);
      }

      logger.info(`Listing subscription checkout completed: ${listingId}`);
      return true;
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.metadata?.type !== 'listing_subscription') return false;

      const listingId = subscription.metadata.listingId;
      if (!listingId) return false;

      await listingService.expireListing(listingId);
      logger.info(`Listing subscription canceled: ${listingId}`);
      return true;
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.metadata?.type !== 'listing_subscription') return false;

      const listingId = subscription.metadata.listingId;
      if (!listingId) return false;

      if (['active', 'trialing'].includes(subscription.status)) {
        const listing = await BusinessListing.findById(listingId);
        if (listing?.applicationStatus === 'expired') {
          await listingService.republishListing(listingId);
        }
      }

      if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
        await listingService.expireListing(listingId);
      }

      return true;
    }

    return false;
  }
}

export const listingSubscriptionService = new ListingSubscriptionService();
