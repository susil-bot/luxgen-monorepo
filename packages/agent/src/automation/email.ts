/**
 * Self-contained email dispatch for the automation bridge.
 *
 * Deliberately does NOT import from `apps/api` (packages must not depend on apps) — this
 * mirrors `apps/api/src/utils/email.ts`'s provider logic (SendGrid via fetch, log fallback)
 * so the bridge can actually send mail instead of only logging a SEND_EMAIL action.
 */

export interface AutomationEmailTemplateContext {
  payload: Record<string, unknown>;
  subjectOverride?: string;
}

interface EmailTemplateDef {
  subject: (ctx: AutomationEmailTemplateContext) => string;
  body: (ctx: AutomationEmailTemplateContext) => string;
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

/**
 * Template registry — keyed to match the `template` select options on the
 * `core.notification.send_email` compound (`packages/automation-flow/src/catalog/compounds.ts`).
 * Add a new template here whenever a new option is added to that select.
 */
export const AUTOMATION_EMAIL_TEMPLATES: Record<string, EmailTemplateDef> = {
  order_confirmation: {
    subject: () => 'Your order is confirmed',
    body: (ctx) =>
      `Hi,\n\nYour order for "${str(ctx.payload.courseTitle, 'your course')}" is confirmed. Thanks for your purchase!`,
  },

  abandoned_cart: {
    subject: () => 'Still interested? Your cart is waiting',
    body: (ctx) =>
      `Hi,\n\nYou started checking out for "${str(
        ctx.payload.courseTitle,
        'a course',
      )}" but didn't finish. Complete your order whenever you're ready — your spot is saved.`,
  },
  certificate_recert_reminder: {
    subject: () => 'Your certification is expiring soon',
    body: (ctx) => {
      const days = ctx.payload.daysBefore ?? ctx.payload.daysUntilExpiry ?? 'a few';
      return `Hi,\n\nYour certification for "${str(
        ctx.payload.courseTitle,
        'your course',
      )}" expires in ${days} days. Renew your training now to stay compliant.`;
    },
  },
  custom: {
    subject: (ctx) => str(ctx.subjectOverride, 'Update from your account'),
    body: (ctx) => str(ctx.payload.body as string | undefined, ''),
  },
};

export interface SendAutomationEmailParams {
  to: string;
  template: string;
  subject?: string;
  payload: Record<string, unknown>;
}

export async function sendAutomationEmail(params: SendAutomationEmailParams): Promise<void> {
  const def = AUTOMATION_EMAIL_TEMPLATES[params.template] ?? AUTOMATION_EMAIL_TEMPLATES.custom;
  const ctx: AutomationEmailTemplateContext = { payload: params.payload, subjectOverride: params.subject };
  const subject = params.subject && params.template === 'custom' ? params.subject : def.subject(ctx);
  const body = def.body(ctx);
  const provider = process.env.EMAIL_PROVIDER || 'log';

  if (provider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: {
          email: process.env.EMAIL_FROM || 'noreply@luxgen.com',
          name: process.env.EMAIL_FROM_NAME || 'LuxGen',
        },
        subject,
        content: [{ type: 'text/plain', value: body }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SendGrid error ${res.status}: ${text}`);
    }
    return;
  }

  console.log(`[automation-email:${provider}] To: ${params.to} | Subject: ${subject}\n${body}`);
}

/** Best-effort recipient resolution from a trigger payload — checks the common field names in use across the codebase. */
export function resolveRecipientEmail(payload: Record<string, unknown>): string | undefined {
  const candidate = payload.customerEmail ?? payload.email ?? payload.studentEmail ?? payload.recipientEmail;
  return typeof candidate === 'string' && candidate.includes('@') ? candidate : undefined;
}
