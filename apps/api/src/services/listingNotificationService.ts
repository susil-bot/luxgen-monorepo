import { EmailNotificationLog, type ListingEmailTemplate, type IEmailNotificationLog } from '@luxgen/db';
import { LISTING_EMAIL_TEMPLATES, type ListingEmailContext } from '../notifications/listing-templates';
import { getWebUrl } from '@luxgen/config';
import { logger } from '../utils/logger';

export class ListingNotificationService {
  private buildUrls(ctx: Pick<ListingEmailContext, 'tenantId' | 'listingId'>) {
    const appUrl = getWebUrl();
    const base = `${appUrl}/listings/my?tenant=${encodeURIComponent(ctx.tenantId)}&id=${ctx.listingId}`;
    return {
      applicationUrl: base,
      paymentUrl: `${base}&action=pay`,
      renewalUrl: `${base}&action=renew`,
    };
  }

  async send(
    template: ListingEmailTemplate,
    params: {
      tenantId: string;
      listingId: string;
      recipientEmail: string;
      context: Omit<ListingEmailContext, 'applicationUrl' | 'paymentUrl' | 'renewalUrl'>;
    },
  ): Promise<IEmailNotificationLog> {
    const urls = this.buildUrls(params);
    const ctx: ListingEmailContext = {
      ...params.context,
      ...urls,
      listingId: params.listingId,
      tenantId: params.tenantId,
    };
    const def = LISTING_EMAIL_TEMPLATES[template];
    const subject = def.subject(ctx);
    const body = def.body(ctx);

    let status: 'sent' | 'failed' | 'skipped' = 'sent';
    let error: string | undefined;

    try {
      await this.dispatchEmail(params.recipientEmail, subject, body);
    } catch (e: unknown) {
      status = 'failed';
      error = e instanceof Error ? e.message : String(e);
      logger.error(`Email failed (${template}) to ${params.recipientEmail}:`, error);
    }

    return EmailNotificationLog.create({
      tenantId: params.tenantId,
      listingId: params.listingId,
      recipientEmail: params.recipientEmail,
      template,
      subject,
      status,
      error,
      metadata: { bodyPreview: body.slice(0, 200) },
      sentAt: new Date(),
    });
  }

  private async dispatchEmail(to: string, subject: string, body: string): Promise<void> {
    const provider = process.env.EMAIL_PROVIDER || 'log';

    if (provider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: {
            email: process.env.EMAIL_FROM || 'noreply@luxgen.com',
            name: process.env.EMAIL_FROM_NAME || 'LuxGen Listings',
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

    logger.info(`[email:${provider}] To: ${to} | Subject: ${subject}\n${body}`);
  }

  async getNotificationHistory(listingId: string, limit = 20) {
    return EmailNotificationLog.find({ listingId }).sort({ sentAt: -1 }).limit(limit);
  }
}

export const listingNotificationService = new ListingNotificationService();
