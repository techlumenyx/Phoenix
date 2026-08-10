import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const REPORT_CONVERSATION_AUDIENCES = ['REPORTER', 'OWNER'] as const;
export const REPORT_CONVERSATION_STATUSES = ['OPEN', 'RESOLVED', 'APPEAL_PENDING'] as const;

export interface IReportConversation {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  reportId: mongoose.Types.ObjectId | null;
  audience: (typeof REPORT_CONVERSATION_AUDIENCES)[number];
  participantFirebaseUid: string | null;
  organisationId: string | null;
  subject: string;
  status: (typeof REPORT_CONVERSATION_STATUSES)[number];
  unreadForParticipant: boolean;
  unreadForAdmin: boolean;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportConversationDocument = HydratedDocument<IReportConversation>;

export const ReportConversationSchema = new Schema<IReportConversation>({
  caseId: { type: Schema.Types.ObjectId, required: true, index: true },
  reportId: { type: Schema.Types.ObjectId, default: null, index: true },
  audience: { type: String, enum: REPORT_CONVERSATION_AUDIENCES, required: true },
  participantFirebaseUid: { type: String, default: null, index: true },
  organisationId: { type: String, default: null, index: true },
  subject: { type: String, required: true, maxlength: 200 },
  status: { type: String, enum: REPORT_CONVERSATION_STATUSES, default: 'OPEN' },
  unreadForParticipant: { type: Boolean, default: false },
  unreadForAdmin: { type: Boolean, default: false },
  lastMessageAt: { type: Date, default: null },
}, { timestamps: true });

ReportConversationSchema.index({ caseId: 1, audience: 1, reportId: 1 }, { unique: true });
ReportConversationSchema.index({ participantFirebaseUid: 1, updatedAt: -1 });
ReportConversationSchema.index({ organisationId: 1, updatedAt: -1 });

