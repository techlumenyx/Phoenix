import type { EmailDeliveryJob, EmailDeliveryResult } from '@christian-listings/email';
import type { EmailProvider } from './email-provider.interface';

const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';

function emailEnabled() {
  return process.env['EMAIL_ENABLED'] === 'true' && (process.env['EMAIL_PROVIDER'] ?? 'sendgrid') === 'brevo';
}

export const brevoProvider: EmailProvider = {
  configure() {
    if (process.env['EMAIL_ENABLED'] !== 'true') return;
    if (!process.env['BREVO_API_KEY']) throw new Error('BREVO_API_KEY is required when email delivery is enabled');
    if (!process.env['BREVO_FROM_EMAIL']) throw new Error('BREVO_FROM_EMAIL is required when email delivery is enabled');
  },

  async deliver(job: EmailDeliveryJob): Promise<EmailDeliveryResult> {
    if (!emailEnabled()) return { status: 'SUPPRESSED' };

    const fromName = process.env['BREVO_FROM_NAME'] ?? 'Christian Listings';
    const fromEmail = process.env['BREVO_FROM_EMAIL']!;
    const replyTo = job.replyTo || process.env['BREVO_REPLY_TO'] || undefined;

    const response = await fetch(BREVO_SEND_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env['BREVO_API_KEY']!,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: job.to }],
        replyTo: replyTo ? { email: replyTo } : undefined,
        subject: job.subject,
        htmlContent: job.html,
        textContent: job.text,
        tags: [`cl_delivery_id:${job.deliveryId}`],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Brevo send failed (HTTP ${response.status}): ${body.slice(0, 500)}`);
    }

    const data = await response.json() as { messageId?: string };
    return { status: 'ACCEPTED', providerMessageId: data.messageId ?? null };
  },
};
