import mongoose, { Schema } from 'mongoose';

export interface IClassifiedAnalyticsEvent {
  organisationId: mongoose.Types.ObjectId;
  entityId: mongoose.Types.ObjectId;
  entityType: 'JOB' | 'MARKETPLACE';
  viewerHash: string;
  eventType: 'IMPRESSION' | 'DETAIL_VIEW';
  surface: string;
  position: number | null;
  bucket: Date;
  createdAt: Date;
}

export const ClassifiedAnalyticsEventSchema = new Schema<IClassifiedAnalyticsEvent>({
  organisationId: { type: Schema.Types.ObjectId, required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  entityType: { type: String, enum: ['JOB', 'MARKETPLACE'], required: true },
  viewerHash: { type: String, required: true },
  eventType: { type: String, enum: ['IMPRESSION', 'DETAIL_VIEW'], required: true },
  surface: { type: String, required: true, maxlength: 64 },
  position: { type: Number, default: null },
  bucket: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
}, { versionKey: false });

ClassifiedAnalyticsEventSchema.index(
  { viewerHash: 1, entityId: 1, eventType: 1, surface: 1, bucket: 1 },
  { unique: true },
);
ClassifiedAnalyticsEventSchema.index({ organisationId: 1, entityType: 1, createdAt: -1, eventType: 1 });
ClassifiedAnalyticsEventSchema.index({ organisationId: 1, entityId: 1, createdAt: -1 });
