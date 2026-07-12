import mongoose, { Schema } from 'mongoose';

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  threadId: mongoose.Types.ObjectId;
  senderFirebaseUid: string;
  type: 'TEXT' | 'SYSTEM' | 'OFFER';
  body: string;
  readAt: Date | null;
  deletedAt: Date | null;
  offerId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = new Schema<IMessage>({
  threadId: { type: Schema.Types.ObjectId, required: true },
  senderFirebaseUid: { type: String, required: true },
  type: { type: String, enum: ['TEXT', 'SYSTEM', 'OFFER'], default: 'TEXT' },
  body: { type: String, required: true, maxlength: 2000 },
  readAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
  offerId: { type: Schema.Types.ObjectId, default: null },
}, { timestamps: true });

MessageSchema.index({ threadId: 1, createdAt: -1 });
