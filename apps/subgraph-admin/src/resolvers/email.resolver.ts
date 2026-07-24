import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import { requirePlatformAdmin } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import { EmailDeliveryModel } from '../models';
import { retryEmailDelivery } from '../services/email-orchestration.service';
import { audit } from './verification.resolver';

const EMAIL_ROLES = ['SUPPORT_AGENT', 'AUDITOR'] as const;

export const emailResolvers = {
  Query: {
    emailDeliveries: async (_: unknown, args: { status?: string; templateKey?: string; search?: string; limit?: number; after?: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...EMAIL_ROLES]);
      const limit = Math.min(Math.max(args.limit ?? 25, 1), 100);
      const filter: Record<string, unknown> = {};
      if (args.status) filter['status'] = args.status;
      if (args.templateKey?.trim()) filter['templateKey'] = args.templateKey.trim();
      if (args.search?.trim()) {
        const pattern = { $regex: escapeRegex(args.search.trim()), $options: 'i' };
        filter['$or'] = [{ to: pattern }, { subject: pattern }, { providerMessageId: pattern }];
      }
      if (args.after && mongoose.isValidObjectId(args.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(args.after) };
      const docs = await EmailDeliveryModel.find(filter).sort({ _id: -1 }).limit(limit + 1);
      return { edges: docs.slice(0, limit).map(mapEmail), hasNextPage: docs.length > limit, endCursor: docs[Math.min(limit, docs.length) - 1]?._id.toString() ?? null };
    },
  },
  Mutation: {
    retryEmailDelivery: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['SUPPORT_AGENT']);
      let doc;
      try { doc = await retryEmailDelivery(id); }
      catch (error) { throw new GraphQLError(error instanceof Error ? error.message : 'Email retry failed', { extensions: { code: 'SERVICE_UNAVAILABLE' } }); }
      if (!doc) throw new GraphQLError('Failed email delivery not found', { extensions: { code: 'NOT_FOUND' } });
      await audit(ctx, admin.firebaseUid, 'EMAIL_RETRY', doc._id.toString(), 'EMAIL_DELIVERY', 'Manually retried failed transactional email', 'FAILED', 'QUEUED');
      return mapEmail(doc);
    },
  },
};

function mapEmail(doc: InstanceType<typeof EmailDeliveryModel>) { return { ...doc.toObject(), id: doc._id.toString(), events: doc.events ?? [] }; }
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
