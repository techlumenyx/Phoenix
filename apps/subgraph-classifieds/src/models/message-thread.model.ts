import mongoose, { Schema } from 'mongoose';

export interface IMessageThread {
  _id: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  buyerFirebaseUid: string;
  sellerFirebaseUid: string;
  organisationId: mongoose.Types.ObjectId | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  lastMessageText: string | null;
  lastMessageAt: Date | null;
  lastMessageSenderUid: string | null;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const MessageThreadSchema = new Schema<IMessageThread>({
  listingId: { type: Schema.Types.ObjectId, required: true },
  buyerFirebaseUid: { type: String, required: true },
  sellerFirebaseUid: { type: String, required: true },
  organisationId: { type: Schema.Types.ObjectId, default: null },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED', 'BLOCKED'], default: 'ACTIVE' },
  lastMessageText: { type: String, default: null },
  lastMessageAt: { type: Date, default: null },
  lastMessageSenderUid: { type: String, default: null },
  buyerUnreadCount: { type: Number, default: 0 },
  sellerUnreadCount: { type: Number, default: 0 },
}, { timestamps: true });

MessageThreadSchema.index({ listingId: 1, buyerFirebaseUid: 1, sellerFirebaseUid: 1 }, { unique: true });
MessageThreadSchema.index({ buyerFirebaseUid: 1, lastMessageAt: -1 });
MessageThreadSchema.index({ sellerFirebaseUid: 1, lastMessageAt: -1 });
MessageThreadSchema.index({ organisationId: 1, lastMessageAt: -1 });
