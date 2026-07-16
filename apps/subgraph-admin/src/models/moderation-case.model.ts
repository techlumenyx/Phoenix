import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const MODERATION_CASE_STATUSES = ['OPEN', 'PENDING_REVIEW', 'RESOLVED'] as const;
export type ModerationCaseStatus = (typeof MODERATION_CASE_STATUSES)[number];
export const MODERATION_PRIORITIES = ['NORMAL', 'HIGH', 'CRITICAL'] as const;
export type ModerationPriority = (typeof MODERATION_PRIORITIES)[number];

export interface IModerationCase {
  _id: mongoose.Types.ObjectId;
  targetKey: string;
  targetId: string;
  targetType: 'MARKETPLACE_ITEM';
  targetService: 'CLASSIFIEDS';
  title: string;
  ownerFirebaseUid: string;
  organisationId: string | null;
  status: ModerationCaseStatus;
  priority: ModerationPriority;
  reportCount: number;
  reporterFirebaseUids: string[];
  reasonCodes: string[];
  assigneeFirebaseUid: string | null;
  targetStatus: string;
  previousStatus: string | null;
  resolutionAction: string | null;
  resolutionReason: string | null;
  resolvedByFirebaseUid: string | null;
  resolvedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ModerationCaseDocument = HydratedDocument<IModerationCase>;

export const ModerationCaseSchema = new Schema<IModerationCase>(
  {
    targetKey: { type: String, required: true, unique: true },
    targetId: { type: String, required: true, index: true },
    targetType: { type: String, enum: ['MARKETPLACE_ITEM'], required: true },
    targetService: { type: String, enum: ['CLASSIFIEDS'], required: true },
    title: { type: String, required: true },
    ownerFirebaseUid: { type: String, required: true },
    organisationId: { type: String, default: null },
    status: { type: String, enum: MODERATION_CASE_STATUSES, default: 'OPEN' },
    priority: { type: String, enum: MODERATION_PRIORITIES, default: 'NORMAL' },
    reportCount: { type: Number, default: 0 },
    reporterFirebaseUids: [{ type: String }],
    reasonCodes: [{ type: String }],
    assigneeFirebaseUid: { type: String, default: null },
    targetStatus: { type: String, required: true },
    previousStatus: { type: String, default: null },
    resolutionAction: { type: String, default: null },
    resolutionReason: { type: String, default: null },
    resolvedByFirebaseUid: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
    version: { type: Number, default: 1 },
  },
  { timestamps: true },
);

ModerationCaseSchema.index({ status: 1, priority: -1, updatedAt: -1 });
ModerationCaseSchema.index({ assigneeFirebaseUid: 1, status: 1 });
