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
} from '../models';
import type { ModerationCaseDocument } from '../models/moderation-case.model';
import type { ModerationReportDocument } from '../models/moderation-report.model';
import type { CaseNoteDocument } from '../models/case-note.model';
import type { AuditEventDocument } from '../models/audit-event.model';

const MODERATOR_ROLES = ['TRUST_SAFETY'] as const;

export const moderationResolvers = {
  Query: {
    moderationCases: async (
      _: unknown,
      args: {
        status?: string;
        priority?: string;
        assigneeFirebaseUid?: string;
        search?: string;
        limit?: number;
        after?: string;
      },
      ctx: GraphQLContext,
    ) => {
      requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES, 'AUDITOR']);
      const limit = Math.min(Math.max(args.limit ?? 25, 1), 100);
      const filter: Record<string, unknown> = {};
      if (args.status) filter['status'] = args.status;
      if (args.priority) filter['priority'] = args.priority;
      if (args.assigneeFirebaseUid) filter['assigneeFirebaseUid'] = args.assigneeFirebaseUid;
      if (args.search?.trim()) {
        const pattern = { $regex: escapeRegex(args.search.trim()), $options: 'i' };
        filter['$or'] = [{ title: pattern }, { targetId: pattern }, { ownerFirebaseUid: pattern }];
      }
      if (args.after && mongoose.isValidObjectId(args.after)) {
        filter['_id'] = { $lt: new mongoose.Types.ObjectId(args.after) };
      }

      const docs = await ModerationCaseModel.find(filter).sort({ _id: -1 }).limit(limit + 1);
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map(mapCase);
      return { edges, hasNextPage, endCursor: edges.at(-1)?.id ?? null };
    },
    moderationCase: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES, 'AUDITOR']);
      if (!mongoose.isValidObjectId(id)) return null;
      const doc = await ModerationCaseModel.findById(id);
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
      return { edges, hasNextPage, endCursor: edges.at(-1)?.id ?? null };
    },
  },
  Mutation: {
    assignModerationCase: async (
      _: unknown,
      { id, assigneeFirebaseUid, expectedVersion }: { id: string; assigneeFirebaseUid?: string | null; expectedVersion: number },
      ctx: GraphQLContext,
    ) => {
      requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES]);
      const doc = await ModerationCaseModel.findOneAndUpdate(
        { _id: id, version: expectedVersion, status: { $ne: 'RESOLVED' } },
        { $set: { assigneeFirebaseUid: assigneeFirebaseUid?.trim() || null }, $inc: { version: 1 } },
        { new: true },
      );
      if (!doc) throw staleCaseError();
      await AuditEventModel.create({
        adminFirebaseUid: ctx.admin.firebaseUid,
        action: 'ASSIGN',
        targetId: doc.targetId,
        targetType: 'MARKETPLACE_ITEM',
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
      if (!await ModerationCaseModel.exists({ _id: caseId })) {
        throw new GraphQLError('Moderation case not found', { extensions: { code: 'NOT_FOUND' } });
      }
      const note = await CaseNoteModel.create({ caseId, authorFirebaseUid: admin.firebaseUid, body: value });
      const moderationCase = await ModerationCaseModel.findById(caseId);
      if (moderationCase) {
        await AuditEventModel.create({
          adminFirebaseUid: admin.firebaseUid,
          action: 'ADD_NOTE',
          targetId: moderationCase.targetId,
          targetType: 'MARKETPLACE_ITEM',
          caseId: moderationCase._id,
          reason: 'Internal note added',
          beforeStatus: moderationCase.targetStatus,
          afterStatus: moderationCase.targetStatus,
          requestId: headerValue(ctx.request.headers['x-request-id']),
        });
      }
      return mapNote(note);
    },
    resolveModerationCase: async (
      _: unknown,
      { id, action, reason, expectedVersion }: { id: string; action: string; reason: string; expectedVersion: number },
      ctx: GraphQLContext,
    ) => {
      const admin = requirePlatformAdmin(ctx.auth, [...MODERATOR_ROLES]);
      const value = reason.trim();
      if (value.length < 5 || value.length > 1000) {
        throw new GraphQLError('A reason between 5 and 1000 characters is required', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const moderationCase = await ModerationCaseModel.findOne({ _id: id, version: expectedVersion, status: { $ne: 'RESOLVED' } });
      if (!moderationCase) throw staleCaseError();

      const requestId = headerValue(ctx.request.headers['x-request-id']);
      const idempotencyKey = `${moderationCase._id}:${expectedVersion}:${action}`;
      const command = await reserveCommand({ idempotencyKey, caseId: moderationCase._id, targetId: moderationCase.targetId, action, reason: value, requestedByFirebaseUid: admin.firebaseUid, requestId });
      if (command.state === 'COMPLETED') {
        const completed = await ModerationCaseModel.findById(id);
        if (completed) return mapCase(completed);
      }
      if (command.state !== 'PENDING') throw staleCaseError();

      try {
        const commandResult = await sendClassifiedsCommand({ itemId: moderationCase.targetId, caseId: moderationCase._id.toString(), action, reason: value, requestId });
        command.state = 'DOMAIN_APPLIED'; command.canonicalStatus = commandResult.status; await command.save();
        const beforeStatus = moderationCase.targetStatus;
        moderationCase.status = 'RESOLVED'; moderationCase.targetStatus = commandResult.status; moderationCase.resolutionAction = action;
        moderationCase.resolutionReason = value; moderationCase.resolvedByFirebaseUid = admin.firebaseUid; moderationCase.resolvedAt = new Date(); moderationCase.version += 1;
        await moderationCase.save();
        await AuditEventModel.create({ adminFirebaseUid: admin.firebaseUid, action, targetId: moderationCase.targetId, targetType: 'MARKETPLACE_ITEM', caseId: moderationCase._id, reason: value, beforeStatus, afterStatus: commandResult.status, requestId });
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

async function sendClassifiedsCommand(input: { itemId: string; caseId: string; action: string; reason: string; requestId: string | null }) {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) throw new GraphQLError('Moderation service credentials are not configured', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  const baseUrl = process.env['CLASSIFIEDS_INTERNAL_URL'] ?? 'http://localhost:4003';
  const response = await fetch(`${baseUrl}/internal/moderation/marketplace`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-cl-service-key': secret, ...(input.requestId ? { 'x-request-id': input.requestId } : {}) },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new GraphQLError('The listing could not be updated. The case remains open.', { extensions: { code: 'BAD_GATEWAY' } });
  return response.json() as Promise<{ status: string }>;
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
