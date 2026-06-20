import Stripe from 'stripe';
import {
  type PlanTier,
  normalizePlan,
  getPlanDefinition,
  listPublicPlans,
  getPlanFeatures,
  getPlanLimits,
  hasFeature,
} from '@luxgen/billing';
import { Tenant, TenantSubscription, type ITenantSubscription } from '@luxgen/db';
import { listingSubscriptionService } from './listingSubscriptionService';
import { enrollmentService } from './enrollmentService';
import { logger } from '../utils/logger';
import { getRedisClient } from '../lib/redis';

const STRIPE_PRICE_ENV: Record<Exclude<PlanTier, 'free' | 'enterprise'>, string> = {
  starter: 'STRIPE_PRICE_STARTER',
  pro: 'STRIPE_PRICE_PRO',
  business: 'STRIPE_PRICE_BUSINESS',
};

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith('sk_'));
}

// Explicit opt-in only — never piggyback on NODE_ENV to bypass billing
export function isBillingDevMode(): boolean {
  return process.env.BILLING_DEV_MODE === 'true';
}

// Singleton Stripe client — avoid re-instantiating on every call
let _stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!isStripeEnabled()) return null;
  return (_stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!));
}

function getPriceIdForPlan(plan: PlanTier): string | null {
  if (plan === 'free' || plan === 'enterprise') return null;
  const envKey = STRIPE_PRICE_ENV[plan];
  return process.env[envKey] || null;
}

function planFromPriceId(priceId: string): PlanTier | null {
  for (const plan of ['starter', 'pro', 'business'] as const) {
    const envKey = STRIPE_PRICE_ENV[plan];
    if (process.env[envKey] === priceId) return plan;
  }
  return null;
}

export class BillingService {
  async getEffectivePlan(tenantId: string): Promise<PlanTier> {
    const sub = await TenantSubscription.findOne({ tenantId });
    if (sub && ['active', 'trialing'].includes(sub.status)) {
      return normalizePlan(sub.plan);
    }

    // tenantId may be a MongoDB ObjectId string or a subdomain — support both
    const tenant = (await Tenant.findById(tenantId).lean()) ?? (await Tenant.findOne({ subdomain: tenantId }).lean());
    if (tenant?.metadata?.plan) {
      return normalizePlan(tenant.metadata.plan);
    }

    return 'free';
  }

  async getOrCreateSubscription(tenantId: string): Promise<ITenantSubscription> {
    let sub = await TenantSubscription.findOne({ tenantId });
    if (sub) return sub;

    const tenant = (await Tenant.findById(tenantId).lean()) ?? (await Tenant.findOne({ subdomain: tenantId }).lean());
    const plan = normalizePlan(tenant?.metadata?.plan);

    sub = await TenantSubscription.create({ tenantId, plan, status: 'active' });
    return sub;
  }

  async syncTenantPlan(tenantId: string, plan: PlanTier): Promise<void> {
    await Tenant.updateOne(
      { subdomain: tenantId },
      { $set: { 'metadata.plan': plan, 'metadata.lastActive': new Date() } },
    );
    await TenantSubscription.findOneAndUpdate({ tenantId }, { $set: { plan } }, { upsert: true, new: true });
  }

  async getTenantBilling(tenantId: string) {
    const sub = await this.getOrCreateSubscription(tenantId);
    const plan = await this.getEffectivePlan(tenantId);
    const definition = getPlanDefinition(plan);

    return {
      tenantId,
      plan,
      planName: definition.name,
      priceMonthly: definition.priceMonthly,
      subscriptionStatus: sub.status,
      stripeConfigured: isStripeEnabled(),
      stripeCustomerId: sub.stripeCustomerId ?? null,
      currentPeriodEnd: sub.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
      limits: getPlanLimits(plan),
      features: definition.features,
      enabledFeatures: getPlanFeatures(plan),
      featureFlags: {
        automations: hasFeature(plan, 'automations'),
        analytics: hasFeature(plan, 'analytics'),
        project: hasFeature(plan, 'project'),
        webhooks: hasFeature(plan, 'webhooks'),
        customDomain: hasFeature(plan, 'customDomain'),
        agentStudio: hasFeature(plan, 'agentStudio'),
        mobileApp: hasFeature(plan, 'mobileApp'),
        apiAccess: hasFeature(plan, 'apiAccess'),
      },
    };
  }

  getPricingPlans() {
    return listPublicPlans().map((p) => ({
      id: p.id,
      name: p.name,
      priceMonthly: p.priceMonthly,
      description: p.description,
      features: p.features,
      limits: p.limits,
    }));
  }

  async createCheckoutSession(options: {
    tenantId: string;
    plan: PlanTier;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }> {
    const { tenantId, plan, customerEmail, successUrl, cancelUrl } = options;

    if (plan === 'free' || plan === 'enterprise') {
      throw new Error(`Plan "${plan}" cannot be purchased via checkout. Contact sales for Enterprise.`);
    }

    const stripe = getStripe();
    const priceId = getPriceIdForPlan(plan);

    if (!stripe || !priceId) {
      if (isBillingDevMode()) {
        await this.syncTenantPlan(tenantId, plan);
        logger.info(`[billing-dev] Simulated upgrade ${tenantId} → ${plan}`);
        return { url: successUrl, sessionId: `dev_sim_${Date.now()}` };
      }
      throw new Error(
        'Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_* env vars, or enable BILLING_DEV_MODE.',
      );
    }

    const sub = await this.getOrCreateSubscription(tenantId);
    let customerId = sub.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: customerEmail, metadata: { tenantId } });
      customerId = customer.id;
      await TenantSubscription.updateOne({ tenantId }, { $set: { stripeCustomerId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { tenantId, plan },
      subscription_data: { metadata: { tenantId, plan } },
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { url: session.url, sessionId: session.id };
  }

  async createBillingPortalSession(tenantId: string, returnUrl: string): Promise<{ url: string }> {
    const stripe = getStripe();
    if (!stripe) {
      if (isBillingDevMode()) return { url: returnUrl };
      throw new Error('Stripe is not configured.');
    }

    const sub = await this.getOrCreateSubscription(tenantId);
    if (!sub.stripeCustomerId) {
      throw new Error('No Stripe customer for this tenant. Subscribe to a plan first.');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  async setPlanDev(tenantId: string, plan: PlanTier): Promise<void> {
    if (!isBillingDevMode()) {
      throw new Error('Dev plan override is disabled. Set BILLING_DEV_MODE=true.');
    }
    await this.syncTenantPlan(tenantId, plan);
    logger.info(`[billing-dev] Manual plan set ${tenantId} → ${plan}`);
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripe || !webhookSecret) throw new Error('Stripe webhook not configured');

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    // Idempotency guard: skip if this event was already processed (Stripe delivers at-least-once)
    const redis = getRedisClient();
    if (redis && redis.status === 'ready') {
      try {
        const idempotencyKey = `luxgen:stripe:processed:${event.id}`;
        const set = await redis.set(idempotencyKey, '1', 'EX', 7 * 24 * 3600, 'NX'); // 7-day TTL
        if (!set) {
          logger.debug(`Stripe event ${event.id} already processed, skipping`);
          return;
        }
      } catch {
        // Redis unavailable — proceed without dedup (acceptable: handlers are idempotent)
      }
    }

    const handledListing = await listingSubscriptionService.handleStripeEvent(event);
    if (handledListing) return;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const handledEnrollment = await enrollmentService.handleEnrollmentCheckoutCompleted(session);
        if (handledEnrollment) break;

        const tenantId = session.metadata?.tenantId;
        const plan = normalizePlan(session.metadata?.plan);
        if (tenantId && plan) {
          await TenantSubscription.findOneAndUpdate(
            { tenantId },
            {
              $set: {
                plan,
                status: 'active',
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
              },
            },
            { upsert: true },
          );
          await this.syncTenantPlan(tenantId, plan);
          logger.info(`Checkout completed: ${tenantId} → ${plan}`);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId;
        if (!tenantId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const plan = planFromPriceId(priceId) ?? normalizePlan(subscription.metadata?.plan);

        await TenantSubscription.findOneAndUpdate(
          { tenantId },
          {
            $set: {
              plan,
              status: subscription.status as ITenantSubscription['status'],
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          },
          { upsert: true },
        );

        if (['active', 'trialing'].includes(subscription.status)) {
          await this.syncTenantPlan(tenantId, plan);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId;
        if (!tenantId) break;

        await TenantSubscription.findOneAndUpdate(
          { tenantId },
          { $set: { status: 'canceled', plan: 'free', cancelAtPeriodEnd: false } },
        );
        await this.syncTenantPlan(tenantId, 'free');
        logger.info(`Subscription canceled: ${tenantId} → free`);
        break;
      }
      default:
        logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }
}

export const billingService = new BillingService();
