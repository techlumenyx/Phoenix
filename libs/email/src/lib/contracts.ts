export const EMAIL_DELIVERY_QUEUE = 'email-delivery';
export const EMAIL_SCHEDULER_QUEUE = 'email-scheduler';

export const EMAIL_TEMPLATE_KEYS = [
  'ORGANISATION_INVITATION',
  'JOB_APPLICATION_SUBMITTED',
  'JOB_APPLICATION_RECEIVED',
  'RSVP_STATUS',
  'VERIFICATION_UPDATE',
  'EVENT_REMINDER',
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export interface EmailIntent {
  templateKey: EmailTemplateKey;
  to: string;
  variables: Record<string, string | number | boolean | null>;
  idempotencyKey: string;
  replyTo?: string | null;
  scheduledFor?: string | null;
  source?: { service: string; entityType: string; entityId: string };
}

export interface EmailDeliveryJob {
  deliveryId: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
}

export interface EmailDeliveryResult {
  status: 'ACCEPTED' | 'SENT' | 'FAILED' | 'SUPPRESSED';
  providerMessageId?: string | null;
  error?: string | null;
}
