import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { requirePlatformAdmin } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import {
  AuditEventModel,
  AdminCommandModel,
  AdminNotificationModel,
  CaseNoteModel,
  ModerationCaseModel,
  ModerationReportModel,
  ReportAppealModel,
  ReportConversationModel,
  ReportMessageModel,
} from '../models';
import type { ModerationCaseDocument } from '../models/moderation-case.model';
import type { ModerationReportDocument } from '../models/moderation-report.model';
import type { CaseNoteDocument } from '../models/case-note.model';
import type { AuditEventDocument } from '../models/audit-event.model';
import { adminPage, pageResult, type AdminPageArgs } from './admin-pagination';
import { internalPost } from './verification.resolver';

const MODERATOR_ROLES = ['TRUST_SAFETY', 'CONTENT_MANAGER'] as const;

export const moderationResolvers = {
  Query: {
    moderationCases: async (
      _: unknown,
      args: AdminPageArgs & {
        status?: string;
        priority?: string;
        assigneeFirebaseUid?: string;
        search?: string;
        limit?: number;
        after?: string;
      },
      ctx: GraphQLContext,
    ) => {
      const admin = requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES, 'AUDITOR']);
      const page = adminPage(args, 'createdAt', ['createdAt', 'updatedAt', 'priority', 'status', 'title']);
      const filter: Record<string, unknown> = {};
      if (isContentOnlyAdmin(admin.roles)) filter['targetType'] = { $in: ['MARKETPLACE_ITEM', 'JOB', 'EVENT'] };
      if (args.status) filter['status'] = args.status;
      if (args.priority) filter['priority'] = args.priority;
      if (args.assigneeFirebaseUid) filter['assigneeFirebaseUid'] = args.assigneeFirebaseUid;
      if (args.search?.trim()) {
        const pattern = { $regex: escapeRegex(args.search.trim()), $options: 'i' };
        filter['$or'] = [{ title: pattern }, { targetId: pattern }, { ownerFirebaseUid: pattern }];
      }
      if (args.offset == null && args.after && mongoose.isValidObjectId(args.after)) {
        filter['_id'] = { $lt: new mongoose.Types.ObjectId(args.after) };
      }

      const [docs, totalCount] = await Promise.all([
        ModerationCaseModel.find(filter).sort(page.sort).skip(page.offset).limit(page.limit),
        ModerationCaseModel.countDocuments(filter),
      ]);
      return pageResult(docs.map(mapCase), totalCount, page.limit, page.offset);
    },
    moderationCase: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES, 'AUDITOR']);
      if (!mongoose.isValidObjectId(id)) return null;
      const doc = await ModerationCaseModel.findById(id);
      if (doc && isContentOnlyAdmin(requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES, 'AUDITOR']).roles) && ['USER', 'ORGANISATION'].includes(doc.targetType)) throw new GraphQLError('Insufficient admin permissions', { extensions: { code: 'FORBIDDEN' } });
      return doc ? mapCase(doc) : null;
    },
    auditEvents: async (
      _: unknown,
      args: { caseId?: string; adminFirebaseUid?: string; limit?: number; after?: string },
      ctx: GraphQLContext,
    ) => {
      requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES, 'AUDITOR']);
      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100);
      const filter: Record<string, unknown> = {};
      if (args.caseId && mongoose.isValidObjectId(args.caseId)) filter['caseId'] = args.caseId;
      if (args.adminFirebaseUid) filter['adminFirebaseUid'] = args.adminFirebaseUid;
      if (args.after && mongoose.isValidObjectId(args.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(args.after) };
      const docs = await AuditEventModel.find(filter).sort({ _id: -1 }).limit(limit + 1);
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map(mapAudit);
      return { edges, totalCount: await AuditEventModel.countDocuments(filter), hasNextPage, endCursor: edges.at(-1)?.id ?? null };
    },
  },
  Mutation: {
    assignModerationCase: async (
      _: unknown,
      { id, assigneeFirebaseUid, expectedVersion }: { id: string; assigneeFirebaseUid?: string | null; expectedVersion: number },
      ctx: GraphQLContext,
    ) => {
      requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES]);
      const admin = requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES]);
      const doc = await ModerationCaseModel.findOneAndUpdate(
        { _id: id, version: expectedVersion, status: { $ne: 'RESOLVED' }, ...(isContentOnlyAdmin(admin.roles) ? { targetType: { $in: ['MARKETPLACE_ITEM', 'JOB', 'EVENT'] } } : {}) },
        { $set: { assigneeFirebaseUid: assigneeFirebaseUid?.trim() || null }, $inc: { version: 1 } },
        { new: true },
      );
      if (!doc) throw staleCaseError();
      await AuditEventModel.create({
        adminFirebaseUid: admin.firebaseUid,
        action: 'ASSIGN',
        targetId: doc.targetId,
        targetType: doc.targetType,
        caseId: doc._id,
        reason: assigneeFirebaseUid?.trim() ? `Assigned to ${assigneeFirebaseUid.trim()}` : 'Case unassigned',
        beforeStatus: doc.targetStatus,
        afterStatus: doc.targetStatus,
        requestId: headerValue(ctx.request.headers['x-request-id']),
      });
      if (doc.assigneeFirebaseUid) await AdminNotificationModel.updateOne(
        { dedupeKey: `moderation-assignment:${doc._id}:${doc.assigneeFirebaseUid}` },
        { $setOnInsert: { recipientFirebaseUid: doc.assigneeFirebaseUid, type: 'ASSIGNMENT', title: 'Moderation case assigned', message: `${doc.title} was assigned to you.`, href: `/moderation/${doc._id}`, dedupeKey: `moderation-assignment:${doc._id}:${doc.assigneeFirebaseUid}`, readAt: null } },
        { upsert: true },
      );
      return mapCase(doc);
    },
    setModerationCasePriority: async (_: unknown, { id, priority, expectedVersion }: { id: string; priority: 'NORMAL' | 'HIGH' | 'CRITICAL'; expectedVersion: number }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES]);
      const doc = await ModerationCaseModel.findOneAndUpdate({ _id: id, version: expectedVersion, ...(isContentOnlyAdmin(admin.roles) ? { targetType: { $in: ['MARKETPLACE_ITEM', 'JOB', 'EVENT'] } } : {}) }, { $set: { priority }, $inc: { version: 1 } }, { new: true });
      if (!doc) throw staleCaseError();
      await AuditEventModel.create({ adminFirebaseUid: admin.firebaseUid, action: 'CHANGE_PRIORITY', targetId: doc.targetId, targetType: doc.targetType, caseId: doc._id, reason: `Priority changed to ${priority}`, beforeStatus: doc.targetStatus, afterStatus: doc.targetStatus, requestId: headerValue(ctx.request.headers['x-request-id']) });
      return mapCase(doc);
    },
    addModerationCaseNote: async (
      _: unknown,
      { caseId, body }: { caseId: string; body: string },
      ctx: GraphQLContext,
    ) => {
      const admin = requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES]);
      const value = body.trim();
      if (!value || value.length > 2000) {
        throw new GraphQLError('Note must contain between 1 and 2000 characters', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const moderationCase = await ModerationCaseModel.findById(caseId);
      if (!moderationCase) {
        throw new GraphQLError('Moderation case not found', { extensions: { code: 'NOT_FOUND' } });
      }
      if (isContentOnlyAdmin(admin.roles) && ['USER', 'ORGANISATION'].includes(moderationCase.targetType)) throw new GraphQLError('Insufficient admin permissions', { extensions: { code: 'FORBIDDEN' } });
      const note = await CaseNoteModel.create({ caseId, authorFirebaseUid: admin.firebaseUid, body: value });
      await AuditEventModel.create({
          adminFirebaseUid: admin.firebaseUid,
          action: 'ADD_NOTE',
          targetId: moderationCase.targetId,
          targetType: moderationCase.targetType,
          caseId: moderationCase._id,
          reason: 'Internal note added',
          beforeStatus: moderationCase.targetStatus,
          afterStatus: moderationCase.targetStatus,
          requestId: headerValue(ctx.request.headers['x-request-id']),
        });
      return mapNote(note);
    },
    resolveModerationCase: async (
      _: unknown,
      { id, action, reason, expectedVersion, scope }: { id: string; action: string; reason: string; expectedVersion: number; scope?: 'OCCURRENCE' | 'SERIES' | null },
      ctx: GraphQLContext,
    ) => {
      const admin = requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES]);
      const value = reason.trim();
      if (value.length < 5 || value.length > 1000) {
        throw new GraphQLError('A reason between 5 and 1000 characters is required', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const statusFilter = action === 'REOPEN' || action === 'RESTORE' ? {} : { status: { $ne: 'RESOLVED' } };
      const moderationCase = await ModerationCaseModel.findOne({ _id: id, version: expectedVersion, ...statusFilter });
      if (!moderationCase) throw staleCaseError();
      if (['USER', 'ORGANISATION'].includes(moderationCase.targetType) || ['SUSPEND', 'REACTIVATE'].includes(action)) requirePlatformAdmin(ctx.auth, ['TRUST_SAFETY']);

      const requestId = headerValue(ctx.request.headers['x-request-id']);
      const idempotencyKey = `${moderationCase._id}:${expectedVersion}:${action}`;
      const command = await reserveCommand({ idempotencyKey, caseId: moderationCase._id, targetId: moderationCase.targetId, action, reason: value, requestedByFirebaseUid: admin.firebaseUid, requestId });
      if (command.state === 'COMPLETED') {
        const completed = await ModerationCaseModel.findById(id);
        if (completed) return mapCase(completed);
      }
      if (command.state !== 'PENDING') throw staleCaseError();

      try {
        const commandResult = await sendModerationCommand({ targetType: moderationCase.targetType, targetId: moderationCase.targetId, currentStatus: moderationCase.targetStatus, caseId: moderationCase._id.toString(), action, reason: value, requestId, scope: scope ?? 'OCCURRENCE' });
        command.state = 'DOMAIN_APPLIED'; command.canonicalStatus = commandResult.status; await command.save();
        const beforeStatus = moderationCase.targetStatus;
        moderationCase.status = action === 'ESCALATE' || action === 'REQUEST_CHANGES' ? 'PENDING_REVIEW' : action === 'REOPEN' ? 'OPEN' : 'RESOLVED'; moderationCase.targetStatus = commandResult.status; moderationCase.resolutionAction = action;
        if (action === 'ESCALATE') moderationCase.priority = 'CRITICAL';
        moderationCase.resolutionReason = value; moderationCase.resolvedByFirebaseUid = admin.firebaseUid; moderationCase.resolvedAt = new Date(); moderationCase.version += 1;
        await moderationCase.save();
        await publishDecisionMessages(moderationCase, admin.firebaseUid, action, value);
        await AuditEventModel.create({ adminFirebaseUid: admin.firebaseUid, action, targetId: moderationCase.targetId, targetType: moderationCase.targetType, caseId: moderationCase._id, reason: value, beforeStatus, afterStatus: commandResult.status, requestId });
        command.state = 'COMPLETED'; await command.save();
        return mapCase(moderationCase);
      } catch (error) {
        const domainApplied = command.state === 'DOMAIN_APPLIED';
        command.state = domainApplied ? 'REQUIRES_RECONCILIATION' : 'FAILED';
        command.failureReason = safeFailure(error);
        await command.save();
        if (domainApplied) {
          await AdminNotificationModel.updateOne(
            { dedupeKey: `command-reconciliation:${command._id}` },
            { $setOnInsert: { recipientFirebaseUid: admin.firebaseUid, type: 'ACTION_FAILED', title: 'Admin action needs reconciliation', message: 'The canonical listing changed, but the admin record did not finish updating. Do not repeat the action.', href: `/moderation/${id}`, dedupeKey: `command-reconciliation:${command._id}`, readAt: null } },
            { upsert: true },
          );
          throw new GraphQLError('The listing changed but the admin workflow needs reconciliation. Operations has been alerted.', { extensions: { code: 'INTERNAL_SERVER_ERROR', requestId } });
        }
        throw error;
      }
    },
  },
  ModerationCase: {
    reports: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES, 'AUDITOR']);
      const canSeeReporter = admin.roles.includes('SUPER_ADMIN') || admin.roles.includes('TRUST_SAFETY');
      return (await ModerationReportModel.find({ caseId: parent.id }).sort({ createdAt: 1 })).map((report) => ({
        ...mapReport(report),
        reporterFirebaseUid: canSeeReporter ? report.reporterFirebaseUid : 'REDACTED',
      }));
    },
    notes: async (parent: { id: string }) => (await CaseNoteModel.find({ caseId: parent.id }).sort({ createdAt: 1 })).map(mapNote),
    auditTimeline: async (parent: { id: string }) => (await AuditEventModel.find({ caseId: parent.id }).sort({ createdAt: 1 })).map(mapAudit),
    conversations: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => canAccessReportCommunication(ctx) ? (await ReportConversationModel.find({ caseId: parent.id }).sort({ updatedAt: -1 })).map((doc) => ({ ...doc.toObject(), id: doc._id.toString(), caseId: doc.caseId.toString(), reportId: doc.reportId?.toString() ?? null, unread: doc.unreadForAdmin })) : [],
    appeals: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => canAccessReportCommunication(ctx) ? (await ReportAppealModel.find({ caseId: parent.id }).sort({ createdAt: -1 })).map((doc) => ({ ...doc.toObject(), id: doc._id.toString() })) : [],
    unreadCommunicationCount: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => canAccessReportCommunication(ctx) ? ReportConversationModel.countDocuments({ caseId: parent.id, unreadForAdmin: true }) : 0,
  },
};

function mapCase(doc: ModerationCaseDocument) {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function mapReport(doc: ModerationReportDocument) {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function mapNote(doc: CaseNoteDocument) {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function mapAudit(doc: AuditEventDocument) {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function staleCaseError() {
  return new GraphQLError('This case changed since it was opened. Refresh and try again.', { extensions: { code: 'CONFLICT' } });
}

async function sendModerationCommand(input: { targetType: string; targetId: string; currentStatus: string; caseId: string; action: string; reason: string; requestId: string | null; scope: 'OCCURRENCE' | 'SERIES' }) {
  if (['ESCALATE', 'RESOLVE', 'REOPEN'].includes(input.action)) return { status: input.currentStatus };
  if (input.targetType === 'MARKETPLACE_ITEM' || input.targetType === 'JOB') {
    if (input.action === 'SUSPEND' || input.action === 'REACTIVATE') throw new GraphQLError('Account actions are not valid for content', { extensions: { code: 'BAD_USER_INPUT' } });
    if (input.targetType === 'JOB' && ['DISMISS', 'WARN'].includes(input.action)) return { status: input.currentStatus };
    return internalPost<{ status: string }>('CLASSIFIEDS_INTERNAL_URL', 'http://localhost:4003', '/internal/moderation/content', input);
  }
  if (input.targetType === 'EVENT') {
    if (['WARN', 'DISMISS'].includes(input.action)) return { status: input.currentStatus };
    const action = ['REMOVE', 'REQUEST_CHANGES'].includes(input.action) ? 'CANCEL' : 'RESTORE';
    return internalPost<{ status: string }>('EVENTS_INTERNAL_URL', 'http://localhost:4002', '/internal/admin/event-action', { id: input.targetId, action, scope: input.scope, reason: input.reason });
  }
  if (input.targetType === 'USER' || input.targetType === 'ORGANISATION') {
    if (input.action === 'DISMISS') return { status: input.currentStatus };
    if (!['WARN', 'SUSPEND', 'REACTIVATE'].includes(input.action)) throw new GraphQLError('Choose an account action for this report', { extensions: { code: 'BAD_USER_INPUT' } });
    const identityResult = await internalPost<{ status: string }>('IDENTITY_INTERNAL_URL', 'http://localhost:4001', '/internal/admin/account-action', { type: input.targetType, id: input.targetId, action: input.action, reason: input.reason });
    if (input.targetType === 'ORGANISATION' && (input.action === 'SUSPEND' || input.action === 'REACTIVATE')) await Promise.all([
      internalPost('EVENTS_INTERNAL_URL', 'http://localhost:4002', '/internal/admin/organisation-action', { organisationId: input.targetId, action: input.action }),
      internalPost('CLASSIFIEDS_INTERNAL_URL', 'http://localhost:4003', '/internal/admin/organisation-action', { organisationId: input.targetId, action: input.action }),
    ]);
    return identityResult;
  }
  throw new GraphQLError('Unsupported report target', { extensions: { code: 'BAD_USER_INPUT' } });
}

function headerValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function reserveCommand(input: { idempotencyKey: string; caseId: mongoose.Types.ObjectId; targetId: string; action: string; reason: string; requestedByFirebaseUid: string; requestId: string | null }) {
  try {
    return await AdminCommandModel.create({ ...input, state: 'PENDING', canonicalStatus: null, failureReason: null });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const existing = await AdminCommandModel.findOne({ idempotencyKey: input.idempotencyKey });
    if (!existing) throw error;
    if (existing.state === 'FAILED') { existing.state = 'PENDING'; existing.failureReason = null; await existing.save(); }
    return existing;
  }
}

function safeFailure(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown command failure';
  return message.replace(/Bearer\s+\S+|https?:\/\/\S+/gi, '[REDACTED]').slice(0, 500);
}
function isContentOnlyAdmin(roles: readonly string[]) { return roles.includes('CONTENT_MANAGER') && !roles.includes('SUPER_ADMIN') && !roles.includes('TRUST_SAFETY'); }
function canAccessReportCommunication(ctx: GraphQLContext) { return Boolean(ctx.admin?.roles.some((role) => role === 'SUPER_ADMIN' || role === 'TRUST_SAFETY' || role === 'CONTENT_MANAGER')); }

async function publishDecisionMessages(moderationCase: ModerationCaseDocument, adminFirebaseUid: string, action: string, reason: string) {
  const reporterConversations = await ReportConversationModel.find({ caseId: moderationCase._id, audience: 'REPORTER' });
  let ownerConversation = await ReportConversationModel.findOne({ caseId: moderationCase._id, audience: 'OWNER', reportId: null });
  if (!ownerConversation) ownerConversation = await ReportConversationModel.create({
    caseId: moderationCase._id,
    reportId: null,
    audience: 'OWNER',
    participantFirebaseUid: moderationCase.organisationId ? null : moderationCase.ownerFirebaseUid,
    organisationId: moderationCase.organisationId,
    subject: `Report about ${moderationCase.title}`,
    status: 'OPEN',
    unreadForParticipant: false,
    unreadForAdmin: false,
    lastMessageAt: null,
  });
  const conversations = [...reporterConversations, ownerConversation];
  for (const conversation of conversations) {
    const body = `${action.replaceAll('_', ' ')}: ${reason}`;
    const message = await ReportMessageModel.create({ conversationId: conversation._id, authorType: 'ADMIN', authorFirebaseUid: adminFirebaseUid, body, templateKey: `MODERATION_${action}` });
    conversation.unreadForParticipant = true;
    conversation.unreadForAdmin = false;
    conversation.lastMessageAt = message.createdAt;
    conversation.status = moderationCase.status === 'RESOLVED' ? 'RESOLVED' : 'OPEN';
    await conversation.save();
  }
}
