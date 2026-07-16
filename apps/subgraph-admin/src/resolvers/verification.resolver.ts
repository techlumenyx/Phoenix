import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import { requirePlatformAdmin } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import { AdminNotificationModel, AuditEventModel, ModerationCaseModel, VerificationSubmissionModel } from '../models';
import type { VerificationSubmissionDocument } from '../models/verification-submission.model';

const REVIEW_ROLES = ['VERIFICATION_REVIEWER'] as const;

export const verificationResolvers = {
  Query: {
    verificationSubmissions: async (_: unknown, args: { status?: string; assigneeFirebaseUid?: string; search?: string; limit?: number; after?: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...REVIEW_ROLES, 'AUDITOR']);
      const limit = Math.min(Math.max(args.limit ?? 25, 1), 100);
      const filter: Record<string, unknown> = {};
      if (args.status) filter['status'] = args.status;
      if (args.assigneeFirebaseUid) filter['assigneeFirebaseUid'] = args.assigneeFirebaseUid;
      if (args.search?.trim()) {
        const pattern = { $regex: escapeRegex(args.search.trim()), $options: 'i' };
        filter['$or'] = [{ organisationName: pattern }, { organisationId: pattern }, { 'snapshot.registrationNumber': pattern }];
      }
      if (args.after && mongoose.isValidObjectId(args.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(args.after) };
      const docs = await VerificationSubmissionModel.find(filter).sort({ _id: -1 }).limit(limit + 1);
      return { edges: docs.slice(0, limit).map(mapVerification), hasNextPage: docs.length > limit, endCursor: docs[Math.min(limit, docs.length) - 1]?._id.toString() ?? null };
    },
    verificationSubmission: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...REVIEW_ROLES, 'AUDITOR']);
      if (!mongoose.isValidObjectId(id)) return null;
      const doc = await VerificationSubmissionModel.findById(id);
      return doc ? mapVerification(doc) : null;
    },
    adminDashboardStats: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const [openModerationCases, pendingVerifications, overdueVerifications, resolvedModerationLast7Days, verificationDecisionsLast7Days] = await Promise.all([
        ModerationCaseModel.countDocuments({ status: { $ne: 'RESOLVED' } }),
        VerificationSubmissionModel.countDocuments({ status: 'PENDING_REVIEW' }),
        VerificationSubmissionModel.countDocuments({ status: 'PENDING_REVIEW', dueAt: { $lt: now } }),
        ModerationCaseModel.countDocuments({ status: 'RESOLVED', resolvedAt: { $gte: sevenDaysAgo } }),
        VerificationSubmissionModel.countDocuments({ status: { $in: ['APPROVED', 'REJECTED', 'NEEDS_INFORMATION'] }, reviewedAt: { $gte: sevenDaysAgo } }),
      ]);
      return { openModerationCases, pendingVerifications, overdueVerifications, resolvedModerationLast7Days, verificationDecisionsLast7Days };
    },
  },
  Mutation: {
    assignVerificationSubmission: async (_: unknown, { id, assigneeFirebaseUid }: { id: string; assigneeFirebaseUid?: string | null }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, [...REVIEW_ROLES]);
      const doc = await VerificationSubmissionModel.findOneAndUpdate({ _id: id, status: 'PENDING_REVIEW' }, { $set: { assigneeFirebaseUid: assigneeFirebaseUid?.trim() || null } }, { new: true });
      if (!doc) throw notFoundOrClosed();
      await audit(ctx, admin.firebaseUid, 'VERIFICATION_ASSIGN', doc.organisationId, 'ORGANISATION_VERIFICATION', `Assigned to ${doc.assigneeFirebaseUid ?? 'nobody'}`, doc.status, doc.status);
      if (doc.assigneeFirebaseUid) await notifyAdmin(doc.assigneeFirebaseUid, 'ASSIGNMENT', 'Verification assigned', `${doc.organisationName} was assigned to you.`, `/verifications/${doc._id}`, `verification-assignment:${doc._id}:${doc.assigneeFirebaseUid}`);
      return mapVerification(doc);
    },
    accessVerificationDocument: async (_: unknown, { id, documentIndex }: { id: string; documentIndex: number }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, [...REVIEW_ROLES]);
      const doc = await VerificationSubmissionModel.findById(id);
      const url = doc?.documentUrls[documentIndex];
      if (!doc || !url) throw new GraphQLError('Verification document not found', { extensions: { code: 'NOT_FOUND' } });
      await audit(ctx, admin.firebaseUid, 'ACCESS_DOCUMENT', doc.organisationId, 'ORGANISATION_VERIFICATION', `Accessed verification document ${documentIndex + 1}`, doc.status, doc.status);
      return url;
    },
    decideVerificationSubmission: async (_: unknown, args: { id: string; action: 'APPROVE' | 'REJECT' | 'NEEDS_INFORMATION'; tier?: 'NONE' | 'STANDARD' | 'CHARITY' | 'NGO'; reason: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, [...REVIEW_ROLES]);
      const reason = args.reason.trim();
      if (reason.length < 5 || reason.length > 1000) throw new GraphQLError('A reason between 5 and 1000 characters is required', { extensions: { code: 'BAD_USER_INPUT' } });
      if (args.action === 'APPROVE' && (!args.tier || args.tier === 'NONE')) throw new GraphQLError('An approval tier is required', { extensions: { code: 'BAD_USER_INPUT' } });
      const doc = await VerificationSubmissionModel.findOne({ _id: args.id, status: 'PENDING_REVIEW' });
      if (!doc) throw notFoundOrClosed();
      const result = await internalPost<{ status: string; verificationTier: string }>('IDENTITY_INTERNAL_URL', 'http://localhost:4001', '/internal/admin/verification-decision', {
        organisationId: doc.organisationId, submissionId: doc._id.toString(), action: args.action, tier: args.action === 'APPROVE' ? args.tier : 'NONE', reason,
      });
      const before = doc.status;
      doc.status = args.action === 'APPROVE' ? 'APPROVED' : args.action === 'REJECT' ? 'REJECTED' : 'NEEDS_INFORMATION';
      doc.approvedTier = args.action === 'APPROVE' ? args.tier ?? 'STANDARD' : 'NONE';
      doc.decisionReason = reason;
      doc.reviewedByFirebaseUid = admin.firebaseUid;
      doc.reviewedAt = new Date();
      await doc.save();
      await audit(ctx, admin.firebaseUid, `VERIFICATION_${args.action}`, doc.organisationId, 'ORGANISATION_VERIFICATION', reason, before, result.status);
      return mapVerification(doc);
    },
  },
  VerificationSubmission: {
    history: async (parent: { organisationId: string }, _: unknown, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...REVIEW_ROLES, 'AUDITOR']);
      return (await VerificationSubmissionModel.find({ organisationId: parent.organisationId }).sort({ version: -1 })).map(mapVerification);
    },
    auditTimeline: async (parent: { organisationId: string }, _: unknown, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...REVIEW_ROLES, 'AUDITOR']);
      return (await AuditEventModel.find({ targetId: parent.organisationId, targetType: 'ORGANISATION_VERIFICATION' }).sort({ createdAt: 1 })).map(mapAudit);
    },
  },
};

function mapVerification(doc: VerificationSubmissionDocument) {
  return { ...doc.toObject(), ...doc.snapshot, id: doc._id.toString(), documentLabels: doc.documentUrls.map((url, index) => documentLabel(url, index)) };
}
function mapAudit(doc: { toObject(): object; _id: { toString(): string } }) { return { ...doc.toObject(), id: doc._id.toString() }; }
function documentLabel(url: string, index: number) { try { return decodeURIComponent(new URL(url).pathname.split('/').at(-1) || `Document ${index + 1}`); } catch { return `Document ${index + 1}`; } }
function notFoundOrClosed() { return new GraphQLError('Verification submission was not found or is already decided', { extensions: { code: 'CONFLICT' } }); }
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function requestId(ctx: GraphQLContext) { const value = ctx.request.headers['x-request-id']; return Array.isArray(value) ? value[0] ?? null : value ?? null; }

export async function internalPost<T>(envName: string, fallback: string, path: string, body: unknown): Promise<T> {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) throw new GraphQLError('Internal service credentials are not configured', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  const response = await fetch(`${process.env[envName] ?? fallback}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-cl-service-key': secret }, body: JSON.stringify(body) });
  if (!response.ok) throw new GraphQLError('Owning service could not complete the operation', { extensions: { code: 'BAD_GATEWAY' } });
  return response.json() as Promise<T>;
}

export type AuditableTarget = 'ORGANISATION_VERIFICATION' | 'USER' | 'ORGANISATION' | 'EVENT' | 'JOB' | 'AUDIT_EXPORT' | 'TEMPLATE' | 'FEATURED_PLACEMENT' | 'SAVED_VIEW';
export async function audit(ctx: GraphQLContext, adminFirebaseUid: string, action: string, targetId: string, targetType: AuditableTarget, reason: string, beforeStatus?: string | null, afterStatus?: string | null, result: 'SUCCESS' | 'FAILED' = 'SUCCESS') {
  const routeHeader = ctx.request.headers['x-admin-route'];
  const userAgent = ctx.request.headers['user-agent'];
  await AuditEventModel.create({ adminFirebaseUid, action, targetId, targetType, caseId: null, reason, beforeStatus: beforeStatus ?? null, afterStatus: afterStatus ?? null, requestId: requestId(ctx), adminRoles: ctx.admin.roles, result, route: Array.isArray(routeHeader) ? routeHeader[0] ?? null : routeHeader ?? null, ipAddress: ctx.request.ip ?? null, userAgent: Array.isArray(userAgent) ? userAgent[0] ?? null : userAgent ?? null });
}

export async function notifyAdmin(recipientFirebaseUid: string, type: 'ASSIGNMENT' | 'SLA_WARNING' | 'ESCALATION' | 'ACTION_FAILED' | 'MENTION', title: string, message: string, href: string | null, dedupeKey: string) {
  await AdminNotificationModel.updateOne({ dedupeKey }, { $setOnInsert: { recipientFirebaseUid, type, title, message, href, dedupeKey, readAt: null } }, { upsert: true });
}
