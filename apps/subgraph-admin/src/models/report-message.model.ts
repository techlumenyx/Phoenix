import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IReportMessage {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  authorType: 'ADMIN' | 'PARTICIPANT' | 'SYSTEM';
  authorFirebaseUid: string | null;
  body: string;
  templateKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportMessageDocument = HydratedDocument<IReportMessage>;
export const ReportMessageSchema = new Schema<IReportMessage>({
  conversationId: { type: Schema.Types.ObjectId, required: true, index: true },
  authorType: { type: String, enum: ['ADMIN', 'PARTICIPANT', 'SYSTEM'], required: true },
  authorFirebaseUid: { type: String, default: null },
  body: { type: String, required: true, maxlength: 2000 },
  templateKey: { type: String, default: null, maxlength: 100 },
}, { timestamps: true });
ReportMessageSchema.index({ conversationId: 1, createdAt: 1 });

