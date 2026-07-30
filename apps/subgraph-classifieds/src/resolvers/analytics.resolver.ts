import { createHash } from 'crypto';
import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import { canAccessOrganisation, getOrganisationAccess } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import { ClassifiedAnalyticsEventModel, JobApplicationModel, JobListingModel, MarketplaceItemModel, MessageThreadModel } from '../models';

type EntityType = 'JOB' | 'MARKETPLACE';
type TrackInput = { entityId: string; entityType: EntityType; eventType: 'IMPRESSION' | 'DETAIL_VIEW'; surface: string; position?: number | null; sessionId: string };

function hashViewer(ctx: GraphQLContext, sessionId: string) {
  const identity = ctx.auth.firebaseUid ? `user:${ctx.auth.firebaseUid}` : `session:${sessionId}`;
  const secret = process.env['ANALYTICS_HASH_SECRET'] ?? process.env['INTERNAL_SERVICE_KEY'] ?? 'christian-listings-analytics';
  return createHash('sha256').update(`${secret}:${identity}`).digest('hex');
}
function bucket(type: TrackInput['eventType']) { const size = type === 'IMPRESSION' ? 1800000 : 86400000; return new Date(Math.floor(Date.now() / size) * size); }
function range(from?: string | null, to?: string | null) { const end = to ? new Date(to) : new Date(); const start = from ? new Date(from) : new Date(end.getTime() - 30 * 86400000); if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end || end.getTime() - start.getTime() > 90 * 86400000) throw new GraphQLError('Choose a valid analytics range of up to 90 days', { extensions: { code: 'BAD_USER_INPUT' } }); return { start, end }; }

export const classifiedAnalyticsResolvers = {
  Mutation: {
    recordClassifiedAnalytics: async (_: unknown, { events }: { events: TrackInput[] }, ctx: GraphQLContext) => {
      const batch = events.slice(0, 20).filter((e) => mongoose.isValidObjectId(e.entityId) && e.sessionId?.length >= 8 && e.sessionId.length <= 128 && e.surface?.length <= 64);
      if (!batch.length) return true;
      const jobIds = batch.filter((e) => e.entityType === 'JOB').map((e) => e.entityId);
      const listingIds = batch.filter((e) => e.entityType === 'MARKETPLACE').map((e) => e.entityId);
      const [jobs, listings] = await Promise.all([
        JobListingModel.find({ _id: { $in: jobIds }, status: 'ACTIVE', adminSuspended: false }).select('_id organisationId').lean(),
        MarketplaceItemModel.find({ _id: { $in: listingIds }, status: { $in: ['AVAILABLE', 'RESERVED'] }, adminSuspended: false, organisationId: { $ne: null } }).select('_id organisationId').lean(),
      ]);
      const content = new Map<string, { _id: mongoose.Types.ObjectId; organisationId: mongoose.Types.ObjectId; entityType: EntityType }>();
      jobs.forEach((row) => content.set(`JOB:${row._id}`, { _id: row._id, organisationId: row.organisationId, entityType: 'JOB' }));
      listings.forEach((row) => { if (row.organisationId) content.set(`MARKETPLACE:${row._id}`, { _id: row._id, organisationId: row.organisationId, entityType: 'MARKETPLACE' }); });
      const access = getOrganisationAccess(ctx.auth);
      const operations = batch.flatMap((event) => {
        const entity = content.get(`${event.entityType}:${event.entityId}`); if (!entity || access?.orgId === entity.organisationId.toString()) return [];
        const viewerHash = hashViewer(ctx, event.sessionId); const timeBucket = bucket(event.eventType); const surface = event.surface.replace(/[^A-Z0-9_-]/gi, '_').slice(0, 64).toUpperCase();
        const filter = { viewerHash, entityId: entity._id, eventType: event.eventType, surface, bucket: timeBucket };
        return [{ updateOne: { filter, update: { $setOnInsert: { ...filter, organisationId: entity.organisationId, entityType: entity.entityType, position: event.position ?? null, createdAt: new Date() } }, upsert: true } }];
      });
      if (operations.length) await ClassifiedAnalyticsEventModel.bulkWrite(operations, { ordered: false }).catch((error: { code?: number }) => { if (error.code !== 11000) throw error; });
      return true;
    },
  },
  Query: {
    classifiedOrganisationAnalytics: async (_: unknown, { organisationId, from, to }: { organisationId: string; from?: string; to?: string }, ctx: GraphQLContext) => {
      if (!canAccessOrganisation(ctx.auth, organisationId)) throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      const organisationObjectId = new mongoose.Types.ObjectId(organisationId); const { start, end } = range(from, to);
      const match = { organisationId: organisationObjectId, createdAt: { $gte: start, $lt: end } };
      const [counts, daily, top, jobs, listings, applications, conversations] = await Promise.all([
        ClassifiedAnalyticsEventModel.aggregate([{ $match: match }, { $group: { _id: '$entityType', impressions: { $sum: { $cond: [{ $eq: ['$eventType', 'IMPRESSION'] }, 1, 0] } }, detailViews: { $sum: { $cond: [{ $eq: ['$eventType', 'DETAIL_VIEW'] }, 1, 0] } }, viewers: { $addToSet: '$viewerHash' } } }]),
        ClassifiedAnalyticsEventModel.aggregate([{ $match: match }, { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, type: '$eventType', entityType: '$entityType' }, count: { $sum: 1 }, viewers: { $addToSet: '$viewerHash' } } }, { $sort: { '_id.day': 1 } }]),
        ClassifiedAnalyticsEventModel.aggregate([{ $match: match }, { $group: { _id: { entityId: '$entityId', entityType: '$entityType' }, impressions: { $sum: { $cond: [{ $eq: ['$eventType', 'IMPRESSION'] }, 1, 0] } }, detailViews: { $sum: { $cond: [{ $eq: ['$eventType', 'DETAIL_VIEW'] }, 1, 0] } }, viewers: { $addToSet: '$viewerHash' } } }, { $sort: { detailViews: -1, impressions: -1 } }, { $limit: 15 }]),
        JobListingModel.find({ organisationId: organisationObjectId }).select('_id title status').lean(),
        MarketplaceItemModel.find({ organisationId: organisationObjectId }).select('_id title status').lean(),
        JobApplicationModel.countDocuments({ organisationId: organisationObjectId, createdAt: { $gte: start, $lt: end } }),
        MessageThreadModel.countDocuments({ organisationId: organisationObjectId, createdAt: { $gte: start, $lt: end } }),
      ]);
      const titleMap = new Map<string, string>([...jobs.map((x): [string, string] => [x._id.toString(), x.title]), ...listings.map((x): [string, string] => [x._id.toString(), x.title])]);
      const summarize = (kind: EntityType, outcomes: number, activeContent: number) => {
        const count = counts.find((x) => x._id === kind) ?? { impressions: 0, detailViews: 0, viewers: [] };
        const rows = daily.filter((x) => x._id.entityType === kind);
        const days = [...new Set(rows.map((x) => x._id.day))];
        return { impressions: count.impressions, uniqueReach: count.viewers.length, detailViews: count.detailViews, outcomes, activeContent,
          daily: days.map((date) => { const matches = rows.filter((x) => x._id.day === date); return { date, impressions: matches.filter((x) => x._id.type === 'IMPRESSION').reduce((s, x) => s + x.count, 0), detailViews: matches.filter((x) => x._id.type === 'DETAIL_VIEW').reduce((s, x) => s + x.count, 0), uniqueReach: new Set(matches.flatMap((x) => x.viewers)).size }; }),
          topContent: top.filter((x) => x._id.entityType === kind).slice(0, 10).map((x) => ({ id: x._id.entityId.toString(), title: titleMap.get(x._id.entityId.toString()) ?? (kind === 'JOB' ? 'Job' : 'Listing'), impressions: x.impressions, uniqueReach: x.viewers.length, detailViews: x.detailViews })) };
      };
      return { jobs: summarize('JOB', applications, jobs.filter((x) => x.status === 'ACTIVE').length), marketplace: summarize('MARKETPLACE', conversations, listings.filter((x) => ['AVAILABLE', 'RESERVED'].includes(x.status)).length) };
    },
  },
};
