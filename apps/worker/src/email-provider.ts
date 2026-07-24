import sendgrid from '@sendgrid/mail';
import type { EmailDeliveryJob, EmailDeliveryResult } from '@christian-listings/email';

export function configureEmailProvider() {
  if (process.env['EMAIL_ENABLED'] !== 'true') return;
  if ((process.env['EMAIL_PROVIDER'] ?? 'sendgrid') !== 'sendgrid') throw new Error('EMAIL_PROVIDER must be sendgrid');
  const apiKey = process.env['SENDGRID_API_KEY'];
  if (!apiKey) throw new Error('SENDGRID_API_KEY is required when email delivery is enabled');
  if (!process.env['SENDGRID_FROM_EMAIL']) throw new Error('SENDGRID_FROM_EMAIL is required when email delivery is enabled');
  sendgrid.setApiKey(apiKey);
}

export async function deliverEmail(job: EmailDeliveryJob): Promise<EmailDeliveryResult> {
  if (!emailEnabled()) return { status: 'SUPPRESSED' };
  const [response] = await sendgrid.send({
    to: job.to,
    from: { email: process.env['SENDGRID_FROM_EMAIL']!, name: process.env['SENDGRID_FROM_NAME'] ?? 'Christian Listings' },
    replyTo: job.replyTo || process.env['SENDGRID_REPLY_TO'] || undefined,
    subject: job.subject,
    html: job.html,
    text: job.text,
    customArgs: { cl_delivery_id: job.deliveryId },
  });
  const messageId = response.headers['x-message-id'];
  return { status: 'ACCEPTED', providerMessageId: Array.isArray(messageId) ? messageId[0] : messageId ?? null };
}

function emailEnabled() {
  return process.env['EMAIL_ENABLED'] === 'true' && (process.env['EMAIL_PROVIDER'] ?? 'sendgrid') === 'sendgrid';
}
