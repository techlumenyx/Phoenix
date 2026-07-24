import { Schema, type HydratedDocument } from 'mongoose';

export type EmailDeliveryStatus = 'QUEUED' | 'ACCEPTED' | 'SENT' | 'FAILED' | 'SUPPRESSED';
export interface IEmailDelivery {
  templateKey: string; to: string; subject: string; html: string; text: string; replyTo: string | null;
  idempotencyKey: string; status: EmailDeliveryStatus; provider: string; providerMessageId: string | null;
  error: string | null; attemptCount: number; sourceService: string | null; sourceEntityType: string | null;
  sourceEntityId: string | null; queuedAt: Date | null; sentAt: Date | null; createdAt: Date; updatedAt: Date;
  events: Array<{ eventId: string | null; event: string; occurredAt: Date; response: string | null }>;
}
export type EmailDeliveryDocument = HydratedDocument<IEmailDelivery>;
export const EmailDeliverySchema = new Schema<IEmailDelivery>({
  templateKey: { type: String, required: true, index: true }, to: { type: String, required: true, index: true },
  subject: { type: String, required: true }, html: { type: String, required: true }, text: { type: String, required: true }, replyTo: { type: String, default: null },
  idempotencyKey: { type: String, required: true, unique: true }, status: { type: String, enum: ['QUEUED', 'ACCEPTED', 'SENT', 'FAILED', 'SUPPRESSED'], required: true, index: true },
  provider: { type: String, default: 'sendgrid' }, providerMessageId: { type: String, default: null, index: true }, error: { type: String, default: null },
  attemptCount: { type: Number, default: 0 }, sourceService: { type: String, default: null }, sourceEntityType: { type: String, default: null }, sourceEntityId: { type: String, default: null },
  queuedAt: { type: Date, default: null }, sentAt: { type: Date, default: null },
  events: [{ eventId: { type: String, default: null }, event: { type: String, required: true }, occurredAt: { type: Date, required: true }, response: { type: String, default: null }, _id: false }],
}, { timestamps: true });
EmailDeliverySchema.index({ createdAt: -1 });
EmailDeliverySchema.index({ sourceService: 1, sourceEntityType: 1, sourceEntityId: 1 });
