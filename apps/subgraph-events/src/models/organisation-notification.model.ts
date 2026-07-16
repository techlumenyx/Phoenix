import mongoose, { Schema } from 'mongoose';

export interface IEventOrganisationNotification {
  _id: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  type: 'RSVP_MILESTONE' | 'ADMIN_ACTION';
  title: string;
  message: string;
  href: string | null;
  sourceId: string | null;
  dedupeKey: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
export const EventOrganisationNotificationSchema = new Schema<IEventOrganisationNotification>(
  {
    organisationId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, enum: ['RSVP_MILESTONE', 'ADMIN_ACTION'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    href: { type: String, default: null },
    sourceId: { type: String, default: null },
    dedupeKey: { type: String, required: true, unique: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);
EventOrganisationNotificationSchema.index({ organisationId: 1, createdAt: -1 });
