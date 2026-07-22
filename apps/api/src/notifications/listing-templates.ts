export type ListingEmailTemplate =
  | 'additional_information_requested'
  | 'application_approved'
  | 'application_rejected'
  | 'payment_confirmation'
  | 'subscription_expiration'
  | 'reminder_draft'
  | 'reminder_need_more_information'
  | 'reminder_awaiting_payment'
  | 'reminder_expired_renewal';

export interface ListingEmailContext {
  applicantName: string;
  businessName: string;
  listingId: string;
  tenantId: string;
  reviewerNotes?: string;
  paymentUrl?: string;
  renewalUrl?: string;
  applicationUrl?: string;
}

export interface EmailTemplateDefinition {
  id: ListingEmailTemplate;
  subject: (ctx: ListingEmailContext) => string;
  body: (ctx: ListingEmailContext) => string;
}

export const LISTING_EMAIL_TEMPLATES: Record<ListingEmailTemplate, EmailTemplateDefinition> = {
  additional_information_requested: {
    id: 'additional_information_requested',
    subject: (ctx) => `Action needed: update your ${ctx.businessName} listing application`,
    body: (ctx) =>
      `Hi ${ctx.applicantName},\n\nOur editorial team needs more information before we can review your listing "${ctx.businessName}".\n\n${ctx.reviewerNotes ? `Notes from reviewer:\n${ctx.reviewerNotes}\n\n` : ''}Please sign in and provide the requested updates:\n${ctx.applicationUrl ?? ''}\n\nThank you,\nLuxGen Listings Team`,
  },
  application_approved: {
    id: 'application_approved',
    subject: (ctx) => `Approved: ${ctx.businessName} is ready for payment`,
    body: (ctx) =>
      `Hi ${ctx.applicantName},\n\nGreat news — your listing "${ctx.businessName}" has been approved and is ready for publication.\n\nComplete payment to publish your business profile:\n${ctx.paymentUrl ?? ''}\n\nThank you,\nLuxGen Listings Team`,
  },
  application_rejected: {
    id: 'application_rejected',
    subject: (ctx) => `Update on your ${ctx.businessName} listing application`,
    body: (ctx) =>
      `Hi ${ctx.applicantName},\n\nThank you for submitting "${ctx.businessName}". After review, we are unable to approve this listing for publication at this time.\n\n${ctx.reviewerNotes ? `Reviewer notes:\n${ctx.reviewerNotes}\n\n` : ''}You may revise and resubmit if requirements change.\n\nLuxGen Listings Team`,
  },
  payment_confirmation: {
    id: 'payment_confirmation',
    subject: (ctx) => `Published: ${ctx.businessName} is now live`,
    body: (ctx) =>
      `Hi ${ctx.applicantName},\n\nPayment received. Your business profile "${ctx.businessName}" is now published and visible to the public.\n\nNo further editorial action is required while your subscription remains active.\n\nLuxGen Listings Team`,
  },
  subscription_expiration: {
    id: 'subscription_expiration',
    subject: (ctx) => `Your ${ctx.businessName} listing has expired`,
    body: (ctx) =>
      `Hi ${ctx.applicantName},\n\nYour subscription for "${ctx.businessName}" has been canceled or expired. Your profile has been removed from public view.\n\nAll listing data is retained — renew anytime to republish:\n${ctx.renewalUrl ?? ''}\n\nLuxGen Listings Team`,
  },
  reminder_draft: {
    id: 'reminder_draft',
    subject: (ctx) => `Reminder: finish your ${ctx.businessName} application`,
    body: (ctx) =>
      `Hi ${ctx.applicantName},\n\nYou started a listing application for "${ctx.businessName}" but have not submitted it yet.\n\nComplete and submit your application:\n${ctx.applicationUrl ?? ''}\n\nLuxGen Listings Team`,
  },
  reminder_need_more_information: {
    id: 'reminder_need_more_information',
    subject: (ctx) => `Reminder: information needed for ${ctx.businessName}`,
    body: (ctx) =>
      `Hi ${ctx.applicantName},\n\nWe are still waiting for the updates requested for "${ctx.businessName}".\n\n${ctx.reviewerNotes ? `Requested information:\n${ctx.reviewerNotes}\n\n` : ''}Provide updates here:\n${ctx.applicationUrl ?? ''}\n\nLuxGen Listings Team`,
  },
  reminder_awaiting_payment: {
    id: 'reminder_awaiting_payment',
    subject: (ctx) => `Reminder: complete payment for ${ctx.businessName}`,
    body: (ctx) =>
      `Hi ${ctx.applicantName},\n\nYour listing "${ctx.businessName}" is approved and waiting for payment.\n\nComplete payment to publish:\n${ctx.paymentUrl ?? ''}\n\nLuxGen Listings Team`,
  },
  reminder_expired_renewal: {
    id: 'reminder_expired_renewal',
    subject: (ctx) => `Reactivate your ${ctx.businessName} listing`,
    body: (ctx) =>
      `Hi ${ctx.applicantName},\n\nYour listing "${ctx.businessName}" expired when the subscription ended. Your business information is saved and ready to republish.\n\nRenew your subscription:\n${ctx.renewalUrl ?? ''}\n\nLuxGen Listings Team`,
  },
};
