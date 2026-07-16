import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const REPORT_REASON_CODES = [
  'SPAM_MISLEADING',
  'FRAUD_SCAM',
  'PROHIBITED_UNSAFE',
  'INAPPROPRIATE',
  'DUPLICATE',
  'OTHER',
] as const;
export type ReportReasonCode = (typeof REPORT_REASON_CODES)[number];

export interface IModerationReport {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId | null;
  targetId: string;
  targetType: 'MARKETPLACE_ITEM';
  targetService: 'CLASSIFIEDS';
  reporterFirebaseUid: string;
  reasonCode: ReportReasonCode;
  details: string | null;
  dedupeKey: string;
  snapshot: {
    title: string;
    ownerFirebaseUid: string;
    organisationId: string | null;
    status: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type ModerationReportDocument = HydratedDocument<IModerationReport>;

export const ModerationReportSchema = new Schema<IModerationReport>(
  {
    caseId: { type: Schema.Types.ObjectId, default: null, index: true },
    targetId: { type: String, required: true, index: true },
    targetType: { type: String, enum: ['MARKETPLACE_ITEM'], required: true },
    targetService: { type: String, enum: ['CLASSIFIEDS'], required: true },
    reporterFirebaseUid: { type: String, required: true },
    reasonCode: { type: String, enum: REPORT_REASON_CODES, required: true },
    details: { type: String, default: null, maxlength: 1000 },
    dedupeKey: { type: String, required: true, unique: true },
    snapshot: {
      title: { type: String, required: true },
      ownerFirebaseUid: { type: String, required: true },
      organisationId: { type: String, default: null },
      status: { type: String, required: true },
    },
  },
  { timestamps: true },
);

ModerationReportSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
ModerationReportSchema.index({ reporterFirebaseUid: 1, createdAt: -1 });
