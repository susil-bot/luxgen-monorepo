import { logger } from './logger';

export interface TransactionalEmailParams {
  to: string;
  subject: string;
  body: string;
}

export async function sendTransactionalEmail(params: TransactionalEmailParams): Promise<void> {
  const { to, subject, body } = params;
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

  logger.info(`[email:${provider}] To: ${to} | Subject: ${subject}\n${body}`);
}
