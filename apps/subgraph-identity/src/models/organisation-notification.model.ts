import mongoose, { Schema } from 'mongoose';

export interface IIdentityOrganisationNotification {
  _id: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  type: 'NEW_FOLLOWER' | 'VERIFICATION_UPDATE' | 'ACCOUNT_UPDATE';
  title: string;
  message: string;
  href: string | null;
  sourceId: string | null;
  dedupeKey: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
export const IdentityOrganisationNotificationSchema = new Schema<IIdentityOrganisationNotification>(
  {
    organisationId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, enum: ['NEW_FOLLOWER', 'VERIFICATION_UPDATE', 'ACCOUNT_UPDATE'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    href: { type: String, default: null },
    sourceId: { type: String, default: null },
    dedupeKey: { type: String, required: true, unique: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);
IdentityOrganisationNotificationSchema.index({ organisationId: 1, createdAt: -1 });
