import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const ADMIN_TEMPLATE_TYPES = ['WARNING', 'REJECTION', 'REMOVAL', 'SUSPENSION', 'VERIFICATION'] as const;
export interface IAdminTemplate {
  _id: mongoose.Types.ObjectId;
  key: string;
  type: (typeof ADMIN_TEMPLATE_TYPES)[number];
  title: string;
  publicMessage: string;
  internalGuidance: string | null;
  locale: string;
  version: number;
  active: boolean;
  createdByFirebaseUid: string;
  createdAt: Date;
  updatedAt: Date;
}
export type AdminTemplateDocument = HydratedDocument<IAdminTemplate>;
export const AdminTemplateSchema = new Schema<IAdminTemplate>({
  key: { type: String, required: true, trim: true, uppercase: true },
  type: { type: String, enum: ADMIN_TEMPLATE_TYPES, required: true, index: true },
  title: { type: String, required: true, maxlength: 120 },
  publicMessage: { type: String, required: true, maxlength: 2000 },
  internalGuidance: { type: String, default: null, maxlength: 2000 },
  locale: { type: String, default: 'en', maxlength: 12 },
  version: { type: Number, required: true },
  active: { type: Boolean, default: true, index: true },
  createdByFirebaseUid: { type: String, required: true },
}, { timestamps: true });
AdminTemplateSchema.index({ key: 1, locale: 1, version: 1 }, { unique: true });
AdminTemplateSchema.index({ key: 1, locale: 1, active: 1 });
