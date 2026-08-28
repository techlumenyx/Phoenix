import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import { requirePlatformAdmin } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import { EmailDeliveryModel } from '../models';
import { retryEmailDelivery } from '../services/email-orchestration.service';
import { acceptEmailIntent } from '../services/email-orchestration.service';
import { audit } from './verification.resolver';
import { adminPage, pageResult, type AdminPageArgs } from './admin-pagination';

const EMAIL_ROLES = ['SUPPORT_AGENT', 'AUDITOR'] as const;

export const emailResolvers = {
  Query: {
    emailDeliveries: async (_: unknown, args: AdminPageArgs & { status?: string; templateKey?: string; search?: string; after?: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...EMAIL_ROLES]);
      const page = adminPage(args, 'createdAt', ['createdAt', 'updatedAt', 'status', 'to', 'templateKey', 'attemptCount']);
      const filter: Record<string, unknown> = {};
      if (args.status) filter['status'] = args.status;
      if (args.templateKey?.trim()) filter['templateKey'] = args.templateKey.trim();
      if (args.search?.trim()) {
        const pattern = { $regex: escapeRegex(args.search.trim()), $options: 'i' };
        filter['$or'] = [{ to: pattern }, { subject: pattern }, { providerMessageId: pattern }];
      }
      if (args.offset == null && args.after && mongoose.isValidObjectId(args.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(args.after) };
      const [docs, totalCount] = await Promise.all([
        EmailDeliveryModel.find(filter).sort(page.sort).skip(page.offset).limit(page.limit),
        EmailDeliveryModel.countDocuments(filter),
      ]);
      return pageResult(docs.map(mapEmail), totalCount, page.limit, page.offset);
    },
    emailDeliveryConfiguration: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, [...EMAIL_ROLES]);
      const provider = process.env['EMAIL_PROVIDER'] ?? 'sendgrid';
      return {
        enabled: emailDeliveryEnabled(),
        provider,
        webhookConfigured: provider === 'ses'
          ? Boolean(process.env['SQS_EVENT_QUEUE_URL'])
          : provider === 'brevo'
            ? Boolean(process.env['BREVO_WEBHOOK_TOKEN'])
            : Boolean(process.env['SENDGRID_WEBHOOK_PUBLIC_KEY']),
      };
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
    sendTestEmail: async (_: unknown, { to }: { to: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['SUPPORT_AGENT']);
      const recipient = to.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(recipient) || recipient.length > 320) {
        throw new GraphQLError('Enter a valid test recipient email address', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (!emailDeliveryEnabled()) {
        throw new GraphQLError('Email delivery is disabled. Configure the email provider and enable delivery before sending a test.', { extensions: { code: 'SERVICE_UNAVAILABLE' } });
      }
      const requestedAt = new Date();
      const doc = await acceptEmailIntent({
        templateKey: 'SENDGRID_TEST',
        to: recipient,
        variables: { requestedBy: admin.email ?? admin.firebaseUid, sentAt: requestedAt.toISOString() },
        idempotencyKey: `sendgrid-test:${admin.firebaseUid}:${requestedAt.getTime()}`,
        source: { service: 'admin', entityType: 'EMAIL_DELIVERY', entityId: admin.firebaseUid },
      });
      await audit(ctx, admin.firebaseUid, 'EMAIL_TEST', doc._id.toString(), 'EMAIL_DELIVERY', `Queued controlled test email to ${recipient}`, null, doc.status);
      return mapEmail(doc as InstanceType<typeof EmailDeliveryModel>);
    },
  },
};

function mapEmail(doc: InstanceType<typeof EmailDeliveryModel>) { return { ...doc.toObject(), id: doc._id.toString(), events: doc.events ?? [] }; }
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function emailDeliveryEnabled() { return process.env['EMAIL_ENABLED'] === 'true' && ['sendgrid', 'ses', 'brevo'].includes(process.env['EMAIL_PROVIDER'] ?? 'sendgrid'); }
