import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const ANNOUNCEMENT_AUDIENCES = ['MEMBER', 'ORGANISATION', 'ADMIN'] as const;
export const ANNOUNCEMENT_STATUSES = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] as const;

export interface IProductAnnouncement {
  _id: mongoose.Types.ObjectId;
  releaseKey: string;
  title: string;
  summary: string | null;
  body: string;
  audiences: Array<(typeof ANNOUNCEMENT_AUDIENCES)[number]>;
  status: (typeof ANNOUNCEMENT_STATUSES)[number];
  imageUrl: string | null;
  imageAlt: string | null;
  videoUrl: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
  publishAt: Date | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
  createdByFirebaseUid: string;
  updatedByFirebaseUid: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductAnnouncementDocument = HydratedDocument<IProductAnnouncement>;

export const ProductAnnouncementSchema = new Schema<IProductAnnouncement>({
  releaseKey: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 60 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  summary: { type: String, default: null, maxlength: 240 },
  body: { type: String, required: true, maxlength: 6000 },
  audiences: [{ type: String, enum: ANNOUNCEMENT_AUDIENCES, required: true }],
  status: { type: String, enum: ANNOUNCEMENT_STATUSES, default: 'DRAFT', index: true },
  imageUrl: { type: String, default: null, maxlength: 2000 },
  imageAlt: { type: String, default: null, maxlength: 240 },
  videoUrl: { type: String, default: null, maxlength: 2000 },
  buttonLabel: { type: String, default: null, maxlength: 60 },
  buttonUrl: { type: String, default: null, maxlength: 2000 },
  publishAt: { type: Date, default: null, index: true },
  publishedAt: { type: Date, default: null },
  archivedAt: { type: Date, default: null },
  createdByFirebaseUid: { type: String, required: true },
  updatedByFirebaseUid: { type: String, required: true },
}, { timestamps: true });

ProductAnnouncementSchema.index({ status: 1, audiences: 1, publishAt: -1 });
