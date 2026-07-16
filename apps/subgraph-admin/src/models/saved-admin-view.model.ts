import mongoose, { Schema, type HydratedDocument } from 'mongoose';
export interface ISavedAdminView { _id: mongoose.Types.ObjectId; ownerFirebaseUid: string; name: string; module: string; filtersJson: string; createdAt: Date; updatedAt: Date }
export type SavedAdminViewDocument = HydratedDocument<ISavedAdminView>;
export const SavedAdminViewSchema = new Schema<ISavedAdminView>({
  ownerFirebaseUid: { type: String, required: true, index: true },
  name: { type: String, required: true, maxlength: 80 },
  module: { type: String, enum: ['MODERATION', 'VERIFICATION', 'AUDIT', 'DIRECTORY', 'CURATION'], required: true },
  filtersJson: { type: String, required: true, maxlength: 4000 },
}, { timestamps: true });
SavedAdminViewSchema.index({ ownerFirebaseUid: 1, module: 1, name: 1 }, { unique: true });
