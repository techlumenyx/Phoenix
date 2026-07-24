import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IScheduledEmail {
  templateKey: string; to: string; variables: Record<string, string | number | boolean | null>; replyTo: string | null;
  idempotencyKey: string; scheduledFor: Date; status: 'SCHEDULED' | 'CLAIMED' | 'CANCELLED';
  sourceService: string | null; sourceEntityType: string | null; sourceEntityId: string | null; deliveryId: mongoose.Types.ObjectId | null;
  claimedAt: Date | null; createdAt: Date; updatedAt: Date;
}
export type ScheduledEmailDocument = HydratedDocument<IScheduledEmail>;
export const ScheduledEmailSchema = new Schema<IScheduledEmail>({
  templateKey: { type: String, required: true }, to: { type: String, required: true }, variables: { type: Schema.Types.Mixed, required: true }, replyTo: { type: String, default: null },
  idempotencyKey: { type: String, required: true, unique: true }, scheduledFor: { type: Date, required: true }, status: { type: String, enum: ['SCHEDULED', 'CLAIMED', 'CANCELLED'], default: 'SCHEDULED' },
  sourceService: { type: String, default: null }, sourceEntityType: { type: String, default: null }, sourceEntityId: { type: String, default: null }, deliveryId: { type: Schema.Types.ObjectId, default: null }, claimedAt: { type: Date, default: null },
}, { timestamps: true });
ScheduledEmailSchema.index({ status: 1, scheduledFor: 1 });
