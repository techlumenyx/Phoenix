import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IReportAppeal {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  appellantFirebaseUid: string;
  body: string;
  status: 'PENDING' | 'UPHELD' | 'OVERTURNED' | 'NEEDS_INFORMATION';
  decisionReason: string | null;
  decidedByFirebaseUid: string | null;
  decidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportAppealDocument = HydratedDocument<IReportAppeal>;
export const ReportAppealSchema = new Schema<IReportAppeal>({
  caseId: { type: Schema.Types.ObjectId, required: true, index: true },
  conversationId: { type: Schema.Types.ObjectId, required: true, index: true },
  appellantFirebaseUid: { type: String, required: true, index: true },
  body: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ['PENDING', 'UPHELD', 'OVERTURNED', 'NEEDS_INFORMATION'], default: 'PENDING' },
  decisionReason: { type: String, default: null },
  decidedByFirebaseUid: { type: String, default: null },
  decidedAt: { type: Date, default: null },
}, { timestamps: true });
ReportAppealSchema.index({ conversationId: 1, status: 1 });
