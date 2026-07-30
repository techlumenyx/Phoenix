import mongoose, { Schema, type HydratedDocument } from 'mongoose';
import { RISK_SIGNAL_CODES, type RiskSignalCode } from '@christian-listings/types';
import type { MarketplaceRiskAnalysisJob } from '@christian-listings/types';

export const RISK_ANALYSIS_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED'] as const;
export type RiskAnalysisStatus = (typeof RISK_ANALYSIS_STATUSES)[number];
export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;
export const RISK_REVIEW_VERDICTS = ['ACCURATE', 'FALSE_POSITIVE', 'NEEDS_MORE_INFO'] as const;

export interface IContentRiskSignal {
  code: RiskSignalCode;
  confidence: number;
  explanation: string;
  evidenceExcerpt: string | null;
}

export interface IContentRiskAnalysis {
  _id: mongoose.Types.ObjectId;
  targetId: string;
  targetType: 'MARKETPLACE_ITEM';
  targetService: 'CLASSIFIEDS';
  title: string;
  content: MarketplaceRiskAnalysisJob['content'];
  contentHash: string;
  mode: 'SHADOW';
  status: RiskAnalysisStatus;
  provider: 'GEMINI';
  model: string;
  score: number | null;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  summary: string | null;
  recommendedAction: 'NONE' | 'REVIEW' | 'PENDING_REVIEW' | null;
  signals: IContentRiskSignal[];
  error: string | null;
  attemptCount: number;
  reviewerVerdict: 'ACCURATE' | 'FALSE_POSITIVE' | 'NEEDS_MORE_INFO' | null;
  reviewerNote: string | null;
  reviewedByFirebaseUid: string | null;
  reviewedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentRiskAnalysisDocument = HydratedDocument<IContentRiskAnalysis>;

const ContentRiskSignalSchema = new Schema<IContentRiskSignal>({
  code: { type: String, enum: RISK_SIGNAL_CODES, required: true },
  confidence: { type: Number, min: 0, max: 1, required: true },
  explanation: { type: String, required: true, maxlength: 500 },
  evidenceExcerpt: { type: String, default: null, maxlength: 200 },
}, { _id: false });

const AnalysedContentSchema = new Schema<MarketplaceRiskAnalysisJob['content']>({
  title: { type: String, required: true, maxlength: 300 },
  description: { type: String, required: true, maxlength: 10_000 },
  category: { type: String, required: true, maxlength: 100 },
  condition: { type: String, required: true, maxlength: 100 },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, maxlength: 10 },
  isDonation: { type: Boolean, required: true },
  region: { type: String, required: true, maxlength: 200 },
}, { _id: false });

export const ContentRiskAnalysisSchema = new Schema<IContentRiskAnalysis>({
  targetId: { type: String, required: true, index: true },
  targetType: { type: String, enum: ['MARKETPLACE_ITEM'], required: true },
  targetService: { type: String, enum: ['CLASSIFIEDS'], required: true },
  title: { type: String, required: true, maxlength: 300 },
  content: { type: AnalysedContentSchema, required: true },
  contentHash: { type: String, required: true },
  mode: { type: String, enum: ['SHADOW'], default: 'SHADOW' },
  status: { type: String, enum: RISK_ANALYSIS_STATUSES, required: true },
  provider: { type: String, enum: ['GEMINI'], default: 'GEMINI' },
  model: { type: String, required: true },
  score: { type: Number, min: 0, max: 100, default: null },
  level: { type: String, enum: RISK_LEVELS, default: null },
  summary: { type: String, default: null, maxlength: 1000 },
  recommendedAction: { type: String, enum: ['NONE', 'REVIEW', 'PENDING_REVIEW'], default: null },
  signals: { type: [ContentRiskSignalSchema], default: [] },
  error: { type: String, default: null, maxlength: 1000 },
  attemptCount: { type: Number, default: 0 },
  reviewerVerdict: { type: String, enum: RISK_REVIEW_VERDICTS, default: null },
  reviewerNote: { type: String, default: null, maxlength: 1000 },
  reviewedByFirebaseUid: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

ContentRiskAnalysisSchema.index({ targetId: 1, contentHash: 1 }, { unique: true });
ContentRiskAnalysisSchema.index({ status: 1, level: -1, createdAt: -1 });
ContentRiskAnalysisSchema.index({ reviewerVerdict: 1, completedAt: -1 });
