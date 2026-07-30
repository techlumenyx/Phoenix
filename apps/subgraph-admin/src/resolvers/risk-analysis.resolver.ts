import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { requirePlatformAdmin } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import { AuditEventModel, ContentRiskAnalysisModel } from '../models';
import { RISK_REVIEW_VERDICTS, type ContentRiskAnalysisDocument } from '../models/content-risk-analysis.model';
import { retryRiskAnalysis, riskAnalysisEnabled } from '../services/risk-analysis.service';

const RISK_ROLES = ['TRUST_SAFETY'] as const;

export const riskAnalysisResolvers = {
  Query: {
    contentRiskAnalyses: async (_: unknown, args: { status?: string; level?: string; reviewerVerdict?: string; limit?: number; after?: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...RISK_ROLES, 'AUDITOR']);
      const limit = Math.min(Math.max(args.limit ?? 25, 1), 100);
      const filter: Record<string, unknown> = {};
      if (args.status) filter['status'] = args.status;
      if (args.level) filter['level'] = args.level;
      if (args.reviewerVerdict) filter['reviewerVerdict'] = args.reviewerVerdict;
      if (args.after && mongoose.isValidObjectId(args.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(args.after) };
      const docs = await ContentRiskAnalysisModel.find(filter).sort({ _id: -1 }).limit(limit + 1);
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map(mapRiskAnalysis);
      return { edges, hasNextPage, endCursor: edges.at(-1)?.id ?? null };
    },
    contentRiskAnalysisConfiguration: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...RISK_ROLES, 'AUDITOR']);
      return {
        enabled: process.env['AI_RISK_ENABLED'] === 'true' && (process.env['AI_RISK_PROVIDER'] ?? 'gemini') === 'gemini',
        provider: process.env['AI_RISK_PROVIDER'] ?? 'gemini',
        model: process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash',
        mode: 'SHADOW',
      };
    },
  },
  Mutation: {
    retryContentRiskAnalysis: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, [...RISK_ROLES]);
      if (!riskAnalysisEnabled()) throw new GraphQLError('AI risk analysis is disabled', { extensions: { code: 'BAD_USER_INPUT' } });
      const doc = await retryRiskAnalysis(id);
      if (!doc) throw new GraphQLError('Failed or skipped risk analysis not found', { extensions: { code: 'NOT_FOUND' } });
      await AuditEventModel.create({
        adminFirebaseUid: admin.firebaseUid, action: 'AI_RISK_RETRY', targetId: doc.targetId,
        targetType: 'MARKETPLACE_ITEM', reason: 'Risk analysis manually retried', beforeStatus: 'FAILED_OR_SKIPPED',
        afterStatus: 'PENDING', requestId: headerValue(ctx.request.headers['x-request-id']), adminRoles: admin.roles,
      });
      return mapRiskAnalysis(doc);
    },
    reviewContentRiskAnalysis: async (_: unknown, { id, verdict, note }: { id: string; verdict: string; note?: string | null }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, [...RISK_ROLES]);
      if (!RISK_REVIEW_VERDICTS.includes(verdict as typeof RISK_REVIEW_VERDICTS[number])) {
        throw new GraphQLError('Invalid risk review verdict', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const value = note?.trim() || null;
      if (value && value.length > 1000) throw new GraphQLError('Review note must not exceed 1000 characters', { extensions: { code: 'BAD_USER_INPUT' } });
      const doc = await ContentRiskAnalysisModel.findOneAndUpdate(
        { _id: id, status: 'COMPLETED' },
        { $set: { reviewerVerdict: verdict, reviewerNote: value, reviewedByFirebaseUid: admin.firebaseUid, reviewedAt: new Date() } },
        { new: true },
      );
      if (!doc) throw new GraphQLError('Completed risk analysis not found', { extensions: { code: 'NOT_FOUND' } });
      await AuditEventModel.create({
        adminFirebaseUid: admin.firebaseUid, action: 'AI_RISK_REVIEW', targetId: doc.targetId,
        targetType: 'MARKETPLACE_ITEM', reason: value ?? `AI risk signal marked ${verdict}`,
        beforeStatus: null, afterStatus: verdict,
        requestId: headerValue(ctx.request.headers['x-request-id']), adminRoles: admin.roles,
      });
      return mapRiskAnalysis(doc);
    },
  },
  ModerationCase: {
    riskAnalyses: async (parent: { targetId: string }, _: unknown, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...RISK_ROLES, 'AUDITOR']);
      return (await ContentRiskAnalysisModel.find({ targetId: parent.targetId }).sort({ createdAt: -1 }).limit(10)).map(mapRiskAnalysis);
    },
  },
};

function mapRiskAnalysis(doc: ContentRiskAnalysisDocument) {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function headerValue(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] ?? null : value ?? null; }
