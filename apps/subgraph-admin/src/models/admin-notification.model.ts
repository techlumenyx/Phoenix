import mongoose, { Schema, type HydratedDocument } from 'mongoose';
export interface IAdminNotification { _id: mongoose.Types.ObjectId; recipientFirebaseUid: string; type: 'ASSIGNMENT' | 'SLA_WARNING' | 'ESCALATION' | 'ACTION_FAILED' | 'MENTION'; title: string; message: string; href: string | null; dedupeKey: string; readAt: Date | null; createdAt: Date; updatedAt: Date }
export type AdminNotificationDocument = HydratedDocument<IAdminNotification>;
export const AdminNotificationSchema = new Schema<IAdminNotification>({
  recipientFirebaseUid: { type: String, required: true, index: true },
  type: { type: String, enum: ['ASSIGNMENT', 'SLA_WARNING', 'ESCALATION', 'ACTION_FAILED', 'MENTION'], required: true },
  title: { type: String, required: true, maxlength: 140 },
  message: { type: String, required: true, maxlength: 500 },
  href: { type: String, default: null },
  dedupeKey: { type: String, required: true, unique: true },
  readAt: { type: Date, default: null },
}, { timestamps: true });
AdminNotificationSchema.index({ recipientFirebaseUid: 1, readAt: 1, createdAt: -1 });
