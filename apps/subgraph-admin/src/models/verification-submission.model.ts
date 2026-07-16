import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const VERIFICATION_REVIEW_STATUSES = ['PENDING_REVIEW', 'NEEDS_INFORMATION', 'APPROVED', 'REJECTED'] as const;
export type VerificationReviewStatus = (typeof VERIFICATION_REVIEW_STATUSES)[number];

export interface IVerificationSubmission {
  _id: mongoose.Types.ObjectId;
  organisationId: string;
  organisationName: string;
  ownerFirebaseUid: string;
  version: number;
  status: VerificationReviewStatus;
  requestedTier: 'STANDARD' | 'CHARITY' | 'NGO';
  approvedTier: 'NONE' | 'STANDARD' | 'CHARITY' | 'NGO' | null;
  documentUrls: string[];
  snapshot: {
    officialName: string | null;
    registrationNumber: string | null;
    officialEmail: string | null;
    pocName: string | null;
    pocTitle: string | null;
    organisationType: string | null;
    region: string | null;
  };
  assigneeFirebaseUid: string | null;
  decisionReason: string | null;
  reviewedByFirebaseUid: string | null;
  reviewedAt: Date | null;
  dueAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type VerificationSubmissionDocument = HydratedDocument<IVerificationSubmission>;

export const VerificationSubmissionSchema = new Schema<IVerificationSubmission>({
  organisationId: { type: String, required: true, index: true },
  organisationName: { type: String, required: true },
  ownerFirebaseUid: { type: String, required: true },
  version: { type: Number, required: true },
  status: { type: String, enum: VERIFICATION_REVIEW_STATUSES, default: 'PENDING_REVIEW', index: true },
  requestedTier: { type: String, enum: ['STANDARD', 'CHARITY', 'NGO'], default: 'STANDARD' },
  approvedTier: { type: String, enum: ['NONE', 'STANDARD', 'CHARITY', 'NGO'], default: null },
  documentUrls: [{ type: String, required: true }],
  snapshot: {
    officialName: { type: String, default: null },
    registrationNumber: { type: String, default: null },
    officialEmail: { type: String, default: null },
    pocName: { type: String, default: null },
    pocTitle: { type: String, default: null },
    organisationType: { type: String, default: null },
    region: { type: String, default: null },
  },
  assigneeFirebaseUid: { type: String, default: null, index: true },
  decisionReason: { type: String, default: null, maxlength: 1000 },
  reviewedByFirebaseUid: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  dueAt: { type: Date, required: true, index: true },
}, { timestamps: true });

VerificationSubmissionSchema.index({ organisationId: 1, version: 1 }, { unique: true });
VerificationSubmissionSchema.index({ status: 1, dueAt: 1 });
