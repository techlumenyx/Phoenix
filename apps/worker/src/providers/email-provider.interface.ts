import type { EmailDeliveryJob, EmailDeliveryResult } from '@christian-listings/email';

export interface EmailProvider {
  configure(): void;
  deliver(job: EmailDeliveryJob): Promise<EmailDeliveryResult>;
}
