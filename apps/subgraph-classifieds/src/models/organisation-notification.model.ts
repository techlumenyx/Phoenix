import mongoose, { Schema } from 'mongoose';

export interface IClassifiedOrganisationNotification {
  _id: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  type: 'LISTING_UNDER_REVIEW' | 'LISTING_MODERATION_DECISION';
  title: string;
  message: string;
  href: string | null;
  sourceId: string | null;
  dedupeKey: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
export const ClassifiedOrganisationNotificationSchema =
  new Schema<IClassifiedOrganisationNotification>(
    {
      organisationId: { type: Schema.Types.ObjectId, required: true, index: true },
      type: { type: String, enum: ['LISTING_UNDER_REVIEW', 'LISTING_MODERATION_DECISION'], required: true },
      title: { type: String, required: true },
      message: { type: String, required: true },
      href: { type: String, default: null },
      sourceId: { type: String, default: null },
      dedupeKey: { type: String, required: true, unique: true },
      readAt: { type: Date, default: null },
    },
    { timestamps: true },
  );
ClassifiedOrganisationNotificationSchema.index({ organisationId: 1, createdAt: -1 });
