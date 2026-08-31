import type { EmailProvider } from './email-provider.interface';
import { sendgridProvider } from './sendgrid-provider';
import { sesProvider } from './ses-provider';
import { brevoProvider } from './brevo-provider';

export type { EmailProvider } from './email-provider.interface';

export function getEmailProvider(): EmailProvider {
  const provider = process.env['EMAIL_PROVIDER'] ?? 'sendgrid';
  if (provider === 'sendgrid') return sendgridProvider;
  if (provider === 'ses') return sesProvider;
  if (provider === 'brevo') return brevoProvider;
  throw new Error(`Unrecognised EMAIL_PROVIDER: ${provider}`);
}
