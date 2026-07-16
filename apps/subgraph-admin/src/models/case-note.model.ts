import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface ICaseNote {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  authorFirebaseUid: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CaseNoteDocument = HydratedDocument<ICaseNote>;

export const CaseNoteSchema = new Schema<ICaseNote>(
  {
    caseId: { type: Schema.Types.ObjectId, required: true, index: true },
    authorFirebaseUid: { type: String, required: true },
    body: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true },
);

CaseNoteSchema.index({ caseId: 1, createdAt: 1 });
