import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import type { EmailDeliveryJob, EmailDeliveryResult } from '@christian-listings/email';
import type { EmailProvider } from './email-provider.interface';

let client: SESv2Client | null = null;

function emailEnabled() {
  return process.env['EMAIL_ENABLED'] === 'true' && (process.env['EMAIL_PROVIDER'] ?? 'sendgrid') === 'ses';
}

export const sesProvider: EmailProvider = {
  configure() {
    if (process.env['EMAIL_ENABLED'] !== 'true') return;
    const region = process.env['AWS_REGION'];
    if (!region) throw new Error('AWS_REGION is required when email delivery is enabled');
    if (!process.env['AWS_ACCESS_KEY_ID'] || !process.env['AWS_SECRET_ACCESS_KEY']) {
      throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required when email delivery is enabled');
    }
    if (!process.env['SES_FROM_EMAIL']) throw new Error('SES_FROM_EMAIL is required when email delivery is enabled');
    client = new SESv2Client({ region });
  },

  async deliver(job: EmailDeliveryJob): Promise<EmailDeliveryResult> {
    if (!emailEnabled()) return { status: 'SUPPRESSED' };
    if (!client) throw new Error('SES provider used before configure()');

    const fromName = process.env['SES_FROM_NAME'] ?? 'Christian Listings';
    const fromEmail = process.env['SES_FROM_EMAIL']!;
    const replyTo = job.replyTo || process.env['SES_REPLY_TO'] || undefined;

    const response = await client.send(new SendEmailCommand({
      FromEmailAddress: `${fromName} <${fromEmail}>`,
      Destination: { ToAddresses: [job.to] },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: job.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: job.html, Charset: 'UTF-8' },
            Text: { Data: job.text, Charset: 'UTF-8' },
          },
        },
      },
      ConfigurationSetName: process.env['SES_CONFIGURATION_SET'],
      EmailTags: [{ Name: 'cl_delivery_id', Value: job.deliveryId }],
    }));

    return { status: 'ACCEPTED', providerMessageId: response.MessageId ?? null };
  },
};
