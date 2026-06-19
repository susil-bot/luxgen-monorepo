# Skill: Business Listings & Directory

**Domain:** Application workflow, editorial review, Stripe listing subscriptions, lifecycle emails, reminders.  
**Doc:** [LISTING_SUBSCRIPTION_LIFECYCLE.md](../../docs/LISTING_SUBSCRIPTION_LIFECYCLE.md)

---

## Key paths

| Layer | Path |
|-------|------|
| Model | `packages/db/src/business-listing.ts`, `email-notification-log.ts` |
| Services | `listingService.ts`, `listingNotificationService.ts`, `listingSubscriptionService.ts`, `listingReminderService.ts` |
| GraphQL | `apps/api/src/schema/listing/` |
| Templates | `apps/api/src/notifications/listing-templates.ts` |
| Jobs | `POST /api/jobs/listing-reminders` |
| Web | `pages/listings/`, `pages/admin/listings/` |
| Queries | `apps/web/graphql/queries/listings.ts` |

---

## Business goal

**Directory monetization** — paid business profiles with editorial quality control and automated comms.

---

## Status flow

```
draft → submitted → under_review → approved → awaiting_payment → published
                                              ↓ cancel/expiry
                                           unpublished (data retained)
```

Implementation: `listingService.ts` — `publishListing`, `expireListing`, `republishListing`

---

## Emails

| Type | When |
|------|------|
| Status (5) | Application submitted, approved, rejected, published, expired |
| Reminders (4) | Cron via `listingReminderService` |

Always log sends in `EmailNotificationLog` to prevent duplicates.

---

## Stripe

- Checkout: `createListingCheckoutSession` mutation
- Webhook: `metadata.type === 'listing_subscription'` in `billingService`
- Cancel at period end → `expireListing`; renew → `republishListing`

---

## Env

```
EMAIL_PROVIDER=...
WEB_APP_URL=http://localhost:3000
STRIPE_PRICE_LISTING=price_...
LISTING_REMINDER_*_DAYS=...
JOBS_API_KEY=...
```

---

## Sidebar

Listings section in `DefaultNavigation.tsx`: Directory, My applications, Review queue.

---

## Do not

- Publish without active subscription
- Send reminder emails without checking `EmailNotificationLog`
