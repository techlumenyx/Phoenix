import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import { requirePlatformAdmin } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import {
  AuditEventModel,
  ModerationCaseModel,
  ModerationReportModel,
  ReportAppealModel,
  ReportConversationModel,
  ReportMessageModel,
} from '../models';
import { ingestContentReport, type ReportableContentType, type ReportTargetService } from '../services/report-intake.service';
import type { ReportConversationDocument } from '../models/report-conversation.model';
import type { ReportMessageDocument } from '../models/report-message.model';
import type { ReportAppealDocument } from '../models/report-appeal.model';

const MODERATOR_ROLES = ['TRUST_SAFETY', 'CONTENT_MANAGER'] as const;
const REPORTABLE_TYPES: ReportableContentType[] = ['MARKETPLACE_ITEM', 'JOB', 'EVENT', 'ORGANISATION', 'USER'];

export const reportConversationResolvers = {
  Query: {
    myReportConversations: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const uid = requireUser(ctx);
      const docs = await ReportConversationModel.find({ audience: 'REPORTER', participantFirebaseUid: uid }).sort({ updatedAt: -1 });
      return docs.map((doc) => mapConversation(doc, false));
    },
    myReportUnreadCount: async (_: unknown, __: unknown, ctx: GraphQLContext) => ReportConversationModel.countDocuments({ audience: 'REPORTER', participantFirebaseUid: requireUser(ctx), unreadForParticipant: true }),
    organisationReportConversations: async (_: unknown, { organisationId }: { organisationId: string }, ctx: GraphQLContext) => {
      requireOrganisationAccess(ctx, organisationId);
      const permittedTypes = permittedOrganisationTargetTypes(ctx);
      const cases = await ModerationCaseModel.find({ organisationId, targetType: { $in: permittedTypes } }).select('_id');
      const docs = await ReportConversationModel.find({ audience: 'OWNER', organisationId, caseId: { $in: cases.map((item) => item._id) } }).sort({ updatedAt: -1 });
      return docs.map((doc) => mapConversation(doc, false));
    },
    organisationReportUnreadCount: async (_: unknown, { organisationId }: { organisationId: string }, ctx: GraphQLContext) => {
      requireOrganisationAccess(ctx, organisationId);
      const cases = await ModerationCaseModel.find({ organisationId, targetType: { $in: permittedOrganisationTargetTypes(ctx) } }).select('_id');
      return ReportConversationModel.countDocuments({ audience: 'OWNER', organisationId, caseId: { $in: cases.map((item) => item._id) }, unreadForParticipant: true });
    },
    reportConversation: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!mongoose.isValidObjectId(id)) return null;
      const doc = await ReportConversationModel.findById(id);
      if (!doc) return null;
      const isAdmin = Boolean(ctx.admin && (ctx.admin.roles.includes('SUPER_ADMIN') || ctx.admin.roles.includes('TRUST_SAFETY') || ctx.admin.roles.includes('CONTENT_MANAGER')));
      if (ctx.admin && !isAdmin) throw new GraphQLError('Insufficient admin permissions', { extensions: { code: 'FORBIDDEN' } });
      if (!isAdmin) await requireConversationAccess(ctx, doc);
      if (isAdmin) await ReportConversationModel.updateOne({ _id: doc._id }, { $set: { unreadForAdmin: false } });
      return mapConversation(doc, isAdmin);
    },
  },
  Mutation: {
    submitContentReport: async (_: unknown, args: { targetType: string; targetId: string; reason: string; details?: string | null }, ctx: GraphQLContext) => {
      const reporterFirebaseUid = requireUser(ctx);
      if (!REPORTABLE_TYPES.includes(args.targetType as ReportableContentType)) throw badInput('This content type cannot be reported');
      const reason = args.reason.trim();
      const details = args.details?.trim() ?? '';
      if (!reason || reason.length > 100 || details.length > 1000) throw badInput('Provide a valid reason and up to 1000 characters of detail');
      const targetType = args.targetType as ReportableContentType;
      const snapshot = await fetchTargetSnapshot(targetType, args.targetId);
      if (snapshot.ownerFirebaseUid === reporterFirebaseUid) throw badInput('You cannot report content you manage');
      const result = await ingestContentReport({
        targetId: args.targetId,
        targetType,
        targetService: serviceFor(targetType),
        reporterFirebaseUid,
        reason: details ? `${reason}: ${details}` : reason,
        snapshot,
      });
      if (result.shouldHide && targetType === 'MARKETPLACE_ITEM') {
        await applyAutomaticMarketplaceReview(args.targetId, result.caseId);
        await ensureAutomaticOwnerNotice(result.caseId, snapshot);
      }
      const conversation = await ReportConversationModel.findOne({ caseId: result.caseId, audience: 'REPORTER', participantFirebaseUid: reporterFirebaseUid });
      if (!conversation) throw new GraphQLError('The report was received but its conversation could not be loaded', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      return mapConversation(conversation, false);
    },
    sendReportConversationMessage: async (_: unknown, { conversationId, body }: { conversationId: string; body: string }, ctx: GraphQLContext) => {
      const uid = requireUser(ctx);
      const conversation = await ReportConversationModel.findById(conversationId);
      if (!conversation) throw notFound('Report conversation not found');
      await requireConversationAccess(ctx, conversation);
      const value = validBody(body);
      const recentMessages = await ReportMessageModel.countDocuments({ conversationId, authorType: 'PARTICIPANT', createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } });
      if (recentMessages >= 20) throw new GraphQLError('Too many messages. Please try again later.', { extensions: { code: 'RATE_LIMITED' } });
      const message = await ReportMessageModel.create({ conversationId, authorType: 'PARTICIPANT', authorFirebaseUid: uid, body: value, templateKey: null });
      await ReportConversationModel.updateOne({ _id: conversationId }, { $set: { unreadForAdmin: true, unreadForParticipant: false, lastMessageAt: message.createdAt, status: 'OPEN' } });
      await ModerationCaseModel.updateOne({ _id: conversation.caseId, status: 'RESOLVED' }, { $set: { status: 'OPEN' }, $inc: { version: 1 } });
      await writeAudit(ctx, conversation.caseId, 'REPORT_REPLY', 'Participant replied to report communication');
      return mapMessage(message);
    },
    markReportConversationRead: async (_: unknown, { conversationId }: { conversationId: string }, ctx: GraphQLContext) => {
      const conversation = await ReportConversationModel.findById(conversationId);
      if (!conversation) throw notFound('Report conversation not found');
      await requireConversationAccess(ctx, conversation);
      await ReportConversationModel.updateOne({ _id: conversationId }, { $set: { unreadForParticipant: false } });
      return true;
    },
    submitReportAppeal: async (_: unknown, { conversationId, body }: { conversationId: string; body: string }, ctx: GraphQLContext) => {
      const uid = requireUser(ctx);
      const conversation = await ReportConversationModel.findById(conversationId);
      if (!conversation) throw notFound('Report conversation not found');
      await requireConversationAccess(ctx, conversation);
      const existing = await ReportAppealModel.findOne({ conversationId, status: 'PENDING' });
      if (existing) throw badInput('An appeal is already awaiting review');
      const appeal = await ReportAppealModel.create({ caseId: conversation.caseId, conversationId, appellantFirebaseUid: uid, body: validBody(body), status: 'PENDING', decisionReason: null, decidedByFirebaseUid: null, decidedAt: null });
      await Promise.all([
        ReportConversationModel.updateOne({ _id: conversationId }, { $set: { status: 'APPEAL_PENDING', unreadForAdmin: true, lastMessageAt: appeal.createdAt } }),
        ModerationCaseModel.updateOne({ _id: conversation.caseId }, { $set: { status: 'APPEAL_PENDING', priority: 'HIGH' }, $inc: { version: 1 } }),
      ]);
      await writeAudit(ctx, conversation.caseId, 'APPEAL_SUBMIT', 'Participant submitted an appeal');
      return mapAppeal(appeal, false);
    },
    sendAdminReportMessage: async (_: unknown, args: { caseId: string; audience: 'REPORTER' | 'OWNER'; reportId?: string | null; body: string; templateKey?: string | null }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES]);
      const moderationCase = await ModerationCaseModel.findById(args.caseId);
      if (!moderationCase) throw notFound('Moderation case not found');
      if (isContentOnlyAdmin(admin.roles) && ['USER', 'ORGANISATION'].includes(moderationCase.targetType)) throw new GraphQLError('Insufficient admin permissions', { extensions: { code: 'FORBIDDEN' } });
      let report = null;
      if (args.audience === 'REPORTER') {
        if (!args.reportId) throw badInput('Choose the reporter conversation');
        report = await ModerationReportModel.findOne({ _id: args.reportId, caseId: moderationCase._id });
        if (!report) throw notFound('Report not found');
      }
      const identity = args.audience === 'REPORTER'
        ? { reportId: report!._id, participantFirebaseUid: report!.reporterFirebaseUid, organisationId: null }
        : { reportId: null, participantFirebaseUid: moderationCase.organisationId ? null : moderationCase.ownerFirebaseUid, organisationId: moderationCase.organisationId };
      const conversation = await ReportConversationModel.findOneAndUpdate(
        { caseId: moderationCase._id, audience: args.audience, reportId: identity.reportId },
        { $setOnInsert: { ...identity, subject: `Report about ${moderationCase.title}`, status: 'OPEN' } },
        { upsert: true, new: true },
      );
      const message = await ReportMessageModel.create({ conversationId: conversation._id, authorType: 'ADMIN', authorFirebaseUid: admin.firebaseUid, body: validBody(args.body), templateKey: args.templateKey?.trim() || null });
      conversation.unreadForParticipant = true;
      conversation.unreadForAdmin = false;
      conversation.lastMessageAt = message.createdAt;
      conversation.status = 'OPEN';
      await conversation.save();
      await writeAudit(ctx, moderationCase._id, 'SEND_REPORT_MESSAGE', `Admin contacted ${args.audience.toLowerCase()}`);
      return mapConversation(conversation, true);
    },
    decideReportAppeal: async (_: unknown, { appealId, decision, reason }: { appealId: string; decision: 'UPHOLD' | 'OVERTURN' | 'NEEDS_INFORMATION'; reason: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES]);
      const appeal = await ReportAppealModel.findOne({ _id: appealId, status: 'PENDING' });
      if (!appeal) throw notFound('Pending appeal not found');
      const moderationCase = await ModerationCaseModel.findById(appeal.caseId).select('targetType');
      if (moderationCase && isContentOnlyAdmin(admin.roles) && ['USER', 'ORGANISATION'].includes(moderationCase.targetType)) throw new GraphQLError('Insufficient admin permissions', { extensions: { code: 'FORBIDDEN' } });
      appeal.status = decision === 'UPHOLD' ? 'UPHELD' : decision === 'OVERTURN' ? 'OVERTURNED' : 'NEEDS_INFORMATION';
      appeal.decisionReason = validBody(reason);
      appeal.decidedByFirebaseUid = admin.firebaseUid;
      appeal.decidedAt = new Date();
      await appeal.save();
      const conversation = await ReportConversationModel.findById(appeal.conversationId);
      if (conversation) {
        const message = await ReportMessageModel.create({ conversationId: conversation._id, authorType: 'ADMIN', authorFirebaseUid: admin.firebaseUid, body: appeal.decisionReason, templateKey: `APPEAL_${decision}` });
        conversation.status = decision === 'NEEDS_INFORMATION' ? 'OPEN' : 'RESOLVED';
        conversation.unreadForParticipant = true;
        conversation.unreadForAdmin = false;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();
      }
      await ModerationCaseModel.updateOne({ _id: appeal.caseId }, { $set: { status: decision === 'NEEDS_INFORMATION' ? 'OPEN' : 'RESOLVED' }, $inc: { version: 1 } });
      await writeAudit(ctx, appeal.caseId, decision === 'UPHOLD' ? 'APPEAL_UPHOLD' : decision === 'OVERTURN' ? 'APPEAL_OVERTURN' : 'APPEAL_NEEDS_INFORMATION', appeal.decisionReason);
      return mapAppeal(appeal, true);
    },
  },
  ReportConversation: {
    targetId: async (parent: { caseId: string }) => (await ModerationCaseModel.findById(parent.caseId).select('targetId'))?.targetId ?? '',
    targetType: async (parent: { caseId: string }) => (await ModerationCaseModel.findById(parent.caseId).select('targetType'))?.targetType ?? 'MARKETPLACE_ITEM',
    targetTitle: async (parent: { caseId: string }) => (await ModerationCaseModel.findById(parent.caseId).select('title'))?.title ?? 'Reported content',
    messages: async (parent: { id: string }) => (await ReportMessageModel.find({ conversationId: parent.id }).sort({ createdAt: 1 })).map(mapMessage),
    appeals: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => (await ReportAppealModel.find({ conversationId: parent.id }).sort({ createdAt: -1 })).map((appeal) => mapAppeal(appeal, Boolean(ctx.admin))),
  },
};

function requireUser(ctx: GraphQLContext) {
  if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  return ctx.auth.firebaseUid;
}
function requireOrganisationAccess(ctx: GraphQLContext, organisationId: string) {
  requireUser(ctx);
  if (ctx.auth.decodedToken?.['orgId'] !== organisationId) throw new GraphQLError('Organisation access required', { extensions: { code: 'FORBIDDEN' } });
}
async function requireConversationAccess(ctx: GraphQLContext, conversation: ReportConversationDocument) {
  const uid = requireUser(ctx);
  if (conversation.audience === 'REPORTER' && conversation.participantFirebaseUid === uid) return;
  if (conversation.audience === 'OWNER' && conversation.participantFirebaseUid === uid) return;
  if (conversation.audience === 'OWNER' && conversation.organisationId) {
    const moderationCase = await ModerationCaseModel.findById(conversation.caseId).select('targetType');
    requireOrganisationAccess(ctx, conversation.organisationId);
    if (!moderationCase || !permittedOrganisationTargetTypes(ctx).includes(moderationCase.targetType as ReportableContentType)) throw new GraphQLError('Your organisation role cannot access this report conversation', { extensions: { code: 'FORBIDDEN' } });
    return;
  }
  throw new GraphQLError('You do not have access to this report conversation', { extensions: { code: 'FORBIDDEN' } });
}
function permittedOrganisationTargetTypes(ctx: GraphQLContext): ReportableContentType[] {
  const roles = Array.isArray(ctx.auth.decodedToken?.['roles']) ? ctx.auth.decodedToken?.['roles'] as string[] : [];
  if (roles.some((role) => role === 'master_admin' || role === 'site_admin')) return ['MARKETPLACE_ITEM', 'JOB', 'EVENT', 'ORGANISATION'];
  const types: ReportableContentType[] = [];
  if (roles.includes('events_manager')) types.push('EVENT');
  if (roles.includes('jobs_manager')) types.push('JOB');
  if (roles.includes('classifieds_manager')) types.push('MARKETPLACE_ITEM');
  return types;
}
function isContentOnlyAdmin(roles: readonly string[]) { return roles.includes('CONTENT_MANAGER') && !roles.includes('SUPER_ADMIN') && !roles.includes('TRUST_SAFETY'); }
function validBody(body: string) { const value = body.trim(); if (!value || value.length > 2000) throw badInput('Message must contain between 1 and 2000 characters'); return value; }
function badInput(message: string) { return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } }); }
function notFound(message: string) { return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } }); }
function serviceFor(type: ReportableContentType): ReportTargetService { return type === 'EVENT' ? 'EVENTS' : type === 'USER' || type === 'ORGANISATION' ? 'IDENTITY' : 'CLASSIFIEDS'; }
async function fetchTargetSnapshot(type: ReportableContentType, id: string) {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) throw new GraphQLError('Reporting is temporarily unavailable', { extensions: { code: 'SERVICE_UNAVAILABLE' } });
  const service = serviceFor(type);
  const baseUrl = service === 'EVENTS' ? process.env['EVENTS_INTERNAL_URL'] ?? 'http://localhost:4002' : service === 'IDENTITY' ? process.env['IDENTITY_INTERNAL_URL'] ?? 'http://localhost:4001' : process.env['CLASSIFIEDS_INTERNAL_URL'] ?? 'http://localhost:4003';
  const directoryType = type;
  const response = await fetch(`${baseUrl}/internal/admin/directory`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-cl-service-key': secret }, body: JSON.stringify({ type: directoryType, id, limit: 1 }) });
  if (!response.ok) throw notFound('Reported content was not found');
  const payload = await response.json() as { items?: Array<{ title: string; ownerFirebaseUid: string; organisationId: string | null; status: string }> };
  const item = payload.items?.[0];
  if (!item || !item.ownerFirebaseUid) throw notFound('Reported content was not found');
  return { title: item.title, ownerFirebaseUid: item.ownerFirebaseUid, organisationId: item.organisationId, status: item.status };
}
function mapConversation(doc: ReportConversationDocument, isAdmin: boolean) { return { ...doc.toObject(), id: doc._id.toString(), caseId: doc.caseId.toString(), reportId: doc.reportId?.toString() ?? null, unread: isAdmin ? doc.unreadForAdmin : doc.unreadForParticipant }; }
function mapMessage(doc: ReportMessageDocument) { return { ...doc.toObject(), id: doc._id.toString() }; }
function mapAppeal(doc: ReportAppealDocument, isAdmin: boolean) { const value = { ...doc.toObject(), id: doc._id.toString() }; return isAdmin ? value : { ...value, appellantFirebaseUid: undefined, decidedByFirebaseUid: undefined }; }
async function applyAutomaticMarketplaceReview(targetId: string, caseId: string) {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) return;
  const baseUrl = process.env['CLASSIFIEDS_INTERNAL_URL'] ?? 'http://localhost:4003';
  const response = await fetch(`${baseUrl}/internal/moderation/content`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-cl-service-key': secret }, body: JSON.stringify({ targetType: 'MARKETPLACE_ITEM', targetId, caseId, action: 'REQUEST_CHANGES', reason: 'Temporarily hidden after multiple distinct community reports pending safety review.' }) });
  if (!response.ok) throw new GraphQLError('The report was saved, but automatic safety review could not be applied', { extensions: { code: 'BAD_GATEWAY' } });
}
async function ensureAutomaticOwnerNotice(caseId: string, snapshot: { title: string; ownerFirebaseUid: string; organisationId: string | null }) {
  const conversation = await ReportConversationModel.findOneAndUpdate(
    { caseId, audience: 'OWNER', reportId: null },
    { $setOnInsert: { participantFirebaseUid: snapshot.organisationId ? null : snapshot.ownerFirebaseUid, organisationId: snapshot.organisationId, subject: `Report about ${snapshot.title}`, status: 'OPEN' } },
    { upsert: true, new: true },
  );
  if (conversation.lastMessageAt) return;
  const message = await ReportMessageModel.create({ conversationId: conversation._id, authorType: 'SYSTEM', authorFirebaseUid: null, body: 'This listing is temporarily hidden while the safety team reviews multiple distinct community reports. Reporter identities remain confidential.', templateKey: 'AUTOMATIC_REVIEW' });
  conversation.unreadForParticipant = true; conversation.lastMessageAt = message.createdAt; await conversation.save();
}
async function writeAudit(ctx: GraphQLContext, caseId: mongoose.Types.ObjectId, action: string, reason: string) {
  const moderationCase = await ModerationCaseModel.findById(caseId);
  if (!moderationCase) return;
  await AuditEventModel.create({ adminFirebaseUid: ctx.auth.firebaseUid ?? 'participant', action, targetId: moderationCase.targetId, targetType: moderationCase.targetType, caseId, reason, beforeStatus: moderationCase.targetStatus, afterStatus: moderationCase.targetStatus, requestId: null });
}
