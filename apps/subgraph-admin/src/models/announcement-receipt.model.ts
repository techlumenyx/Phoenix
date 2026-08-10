import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IAnnouncementReceipt {
  _id: mongoose.Types.ObjectId;
  announcementId: mongoose.Types.ObjectId;
  firebaseUid: string;
  seenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AnnouncementReceiptDocument = HydratedDocument<IAnnouncementReceipt>;
export const AnnouncementReceiptSchema = new Schema<IAnnouncementReceipt>({
  announcementId: { type: Schema.Types.ObjectId, required: true, index: true },
  firebaseUid: { type: String, required: true, index: true },
  seenAt: { type: Date, required: true },
}, { timestamps: true });
AnnouncementReceiptSchema.index({ announcementId: 1, firebaseUid: 1 }, { unique: true });
