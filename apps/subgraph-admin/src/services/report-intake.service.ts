import { ModerationCaseModel, ModerationReportModel, ReportConversationModel } from '../models';
import type { ReportReasonCode } from '../models/moderation-report.model';

export interface MarketplaceReportInput {
  itemId: string;
  reporterFirebaseUid: string;
  reason: string;
  snapshot: {
    title: string;
    ownerFirebaseUid: string;
    organisationId: string | null;
    status: string;
  };
}

export type ReportableContentType = 'MARKETPLACE_ITEM' | 'JOB' | 'EVENT' | 'ORGANISATION' | 'USER';
export type ReportTargetService = 'CLASSIFIEDS' | 'EVENTS' | 'IDENTITY';
export interface ContentReportInput {
  targetId: string;
  targetType: ReportableContentType;
  targetService: ReportTargetService;
  reporterFirebaseUid: string;
  reason: string;
  snapshot: MarketplaceReportInput['snapshot'];
}

export interface ReportIntakeResult {
  reportId: string;
  caseId: string;
  distinctReportCount: number;
  duplicate: boolean;
  shouldHide: boolean;
}

export class ReportRateLimitError extends Error {
  constructor() {
    super('Too many reports submitted. Please try again later.');
    this.name = 'ReportRateLimitError';
  }
}

export async function ingestMarketplaceReport(input: MarketplaceReportInput): Promise<ReportIntakeResult> {
  return ingestContentReport({ ...input, targetId: input.itemId, targetType: 'MARKETPLACE_ITEM', targetService: 'CLASSIFIEDS' });
}

export async function ingestContentReport(input: ContentReportInput): Promise<ReportIntakeResult> {
  const targetKey = `${input.targetType}:${input.targetId}`;
  const dedupeKey = `${targetKey}:${input.reporterFirebaseUid}`;
  const existing = await ModerationReportModel.findOne({ dedupeKey });
  if (existing) {
    const existingCase = await ModerationCaseModel.findById(existing.caseId);
    if (!existingCase) throw new Error('Moderation case is missing for an existing report');
    await ReportConversationModel.updateOne(
      { caseId: existingCase._id, audience: 'REPORTER', reportId: existing._id },
      { $setOnInsert: { participantFirebaseUid: input.reporterFirebaseUid, organisationId: null, subject: `Report about ${input.snapshot.title}`, status: 'OPEN', unreadForParticipant: false, unreadForAdmin: false, lastMessageAt: null } },
      { upsert: true },
    );
    return {
      reportId: existing._id.toString(),
      caseId: existingCase._id.toString(),
      distinctReportCount: existingCase.reportCount,
      duplicate: true,
      shouldHide: existingCase.reportCount >= 3,
    };
  }

  const recentReportCount = await ModerationReportModel.countDocuments({
    reporterFirebaseUid: input.reporterFirebaseUid,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  });
  if (recentReportCount >= 10) throw new ReportRateLimitError();

  const { reasonCode, details } = parseReason(input.reason);
  let report;
  try {
    report = await ModerationReportModel.create({
      caseId: null,
      targetId: input.targetId,
      targetType: input.targetType,
      targetService: input.targetService,
      reporterFirebaseUid: input.reporterFirebaseUid,
      reasonCode,
      details,
      dedupeKey,
      snapshot: input.snapshot,
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const duplicate = await ModerationReportModel.findOne({ dedupeKey });
    const duplicateCase = duplicate?.caseId ? await ModerationCaseModel.findById(duplicate.caseId) : null;
    if (!duplicate || !duplicateCase) throw new Error('Duplicate moderation report could not be reconciled');
    return {
      reportId: duplicate._id.toString(),
      caseId: duplicateCase._id.toString(),
      distinctReportCount: duplicateCase.reportCount,
      duplicate: true,
      shouldHide: duplicateCase.reportCount >= 3,
    };
  }

  const moderationCase = await ModerationCaseModel.findOneAndUpdate(
    { targetKey },
    {
      $setOnInsert: {
        targetId: input.targetId,
        targetType: input.targetType,
        targetService: input.targetService,
        ownerFirebaseUid: input.snapshot.ownerFirebaseUid,
        organisationId: input.snapshot.organisationId,
        previousStatus: input.snapshot.status,
      },
      $set: {
        title: input.snapshot.title,
        targetStatus: input.snapshot.status,
        status: 'OPEN',
        assigneeFirebaseUid: null,
        resolutionAction: null,
        resolutionReason: null,
        resolvedByFirebaseUid: null,
        resolvedAt: null,
      },
      $addToSet: {
        reporterFirebaseUids: input.reporterFirebaseUid,
        reasonCodes: reasonCode,
      },
      $inc: { reportCount: 1, version: 1 },
    },
    { upsert: true, new: true },
  );

  if (moderationCase.reportCount >= 3) {
    moderationCase.status = 'PENDING_REVIEW';
    moderationCase.priority = 'HIGH';
    moderationCase.targetStatus = 'PENDING_REVIEW';
    await moderationCase.save();
  }

  report.caseId = moderationCase._id;
  await report.save();

  await ReportConversationModel.updateOne(
    { caseId: moderationCase._id, audience: 'REPORTER', reportId: report._id },
    { $setOnInsert: {
      participantFirebaseUid: input.reporterFirebaseUid,
      organisationId: null,
      subject: `Report about ${input.snapshot.title}`,
      status: 'OPEN',
      unreadForParticipant: false,
      unreadForAdmin: false,
      lastMessageAt: null,
    } },
    { upsert: true },
  );

  return {
    reportId: report._id.toString(),
    caseId: moderationCase._id.toString(),
    distinctReportCount: moderationCase.reportCount,
    duplicate: false,
    shouldHide: moderationCase.reportCount >= 3,
  };
}

function parseReason(value: string): { reasonCode: ReportReasonCode; details: string | null } {
  const [label, ...detailParts] = value.trim().split(':');
  const normalized = label.trim().toLowerCase();
  const reasonCode: ReportReasonCode = normalized.includes('spam')
    ? 'SPAM_MISLEADING'
    : normalized.includes('fraud') || normalized.includes('scam')
      ? 'FRAUD_SCAM'
      : normalized.includes('prohibited') || normalized.includes('unsafe')
        ? 'PROHIBITED_UNSAFE'
        : normalized.includes('inappropriate')
          ? 'INAPPROPRIATE'
          : normalized.includes('duplicate')
            ? 'DUPLICATE'
            : 'OTHER';
  const details = detailParts.join(':').trim().slice(0, 1000);
  return { reasonCode, details: details || null };
}
