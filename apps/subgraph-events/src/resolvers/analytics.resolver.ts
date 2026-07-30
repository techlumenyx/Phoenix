import { createHash } from 'crypto';
import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import { canAccessOrganisation, getOrganisationAccess } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import { EventAnalyticsEventModel, EventModel, RsvpModel } from '../models';

type TrackInput = { entityId: string; eventType: 'IMPRESSION' | 'DETAIL_VIEW'; surface: string; position?: number | null; sessionId: string };

function viewerHash(ctx: GraphQLContext, sessionId: string) {
  const identity = ctx.auth.firebaseUid ? `user:${ctx.auth.firebaseUid}` : `session:${sessionId}`;
  const secret = process.env['ANALYTICS_HASH_SECRET'] ?? process.env['INTERNAL_SERVICE_KEY'] ?? 'christian-listings-analytics';
  return createHash('sha256').update(`${secret}:${identity}`).digest('hex');
}

function bucketFor(type: TrackInput['eventType'], now = new Date()) {
  const size = type === 'IMPRESSION' ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return new Date(Math.floor(now.getTime() / size) * size);
}

function dates(from?: string | null, to?: string | null) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 86400000);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end || end.getTime() - start.getTime() > 90 * 86400000) {
    throw new GraphQLError('Choose a valid analytics range of up to 90 days', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return { start, end };
}

export const eventAnalyticsResolvers = {
  Mutation: {
    recordEventAnalytics: async (_: unknown, { events }: { events: TrackInput[] }, ctx: GraphQLContext) => {
      const batch = events.slice(0, 20).filter((event) => mongoose.isValidObjectId(event.entityId) && event.sessionId?.length >= 8 && event.sessionId.length <= 128 && event.surface?.length <= 64);
      if (!batch.length) return true;
      const ids = [...new Set(batch.map((event) => event.entityId))];
      const content = await EventModel.find({ _id: { $in: ids }, status: 'PUBLISHED', adminSuspended: false }).select('_id organisationId').lean();
      const byId = new Map(content.map((event) => [event._id.toString(), event]));
      const access = getOrganisationAccess(ctx.auth);
      const operations = batch.flatMap((event) => {
        const entity = byId.get(event.entityId);
        if (!entity || access?.orgId === entity.organisationId.toString()) return [];
        const hash = viewerHash(ctx, event.sessionId);
        const bucket = bucketFor(event.eventType);
        const surface = event.surface.replace(/[^A-Z0-9_-]/gi, '_').slice(0, 64).toUpperCase();
        const filter = { viewerHash: hash, entityId: entity._id, eventType: event.eventType, surface, bucket };
        return [{ updateOne: { filter, update: { $setOnInsert: { ...filter, organisationId: entity.organisationId, position: event.position ?? null, createdAt: new Date() } }, upsert: true } }];
      });
      if (operations.length) await EventAnalyticsEventModel.bulkWrite(operations, { ordered: false }).catch((error: { code?: number }) => { if (error.code !== 11000) throw error; });
      return true;
    },
  },
  Query: {
    eventOrganisationAnalytics: async (_: unknown, { organisationId, from, to }: { organisationId: string; from?: string; to?: string }, ctx: GraphQLContext) => {
      if (!canAccessOrganisation(ctx.auth, organisationId)) throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      const orgId = new mongoose.Types.ObjectId(organisationId);
      const { start, end } = dates(from, to);
      const match = { organisationId: orgId, createdAt: { $gte: start, $lt: end } };
      const [counts, daily, top, eventIds] = await Promise.all([
        EventAnalyticsEventModel.aggregate([{ $match: match }, { $group: { _id: null, impressions: { $sum: { $cond: [{ $eq: ['$eventType', 'IMPRESSION'] }, 1, 0] } }, detailViews: { $sum: { $cond: [{ $eq: ['$eventType', 'DETAIL_VIEW'] }, 1, 0] } }, viewers: { $addToSet: '$viewerHash' } } }]),
        EventAnalyticsEventModel.aggregate([{ $match: match }, { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, type: '$eventType' }, count: { $sum: 1 }, viewers: { $addToSet: '$viewerHash' } } }, { $group: { _id: '$_id.day', impressions: { $sum: { $cond: [{ $eq: ['$_id.type', 'IMPRESSION'] }, '$count', 0] } }, detailViews: { $sum: { $cond: [{ $eq: ['$_id.type', 'DETAIL_VIEW'] }, '$count', 0] } }, viewerSets: { $push: '$viewers' } } }, { $sort: { _id: 1 } }]),
        EventAnalyticsEventModel.aggregate([{ $match: match }, { $group: { _id: '$entityId', impressions: { $sum: { $cond: [{ $eq: ['$eventType', 'IMPRESSION'] }, 1, 0] } }, detailViews: { $sum: { $cond: [{ $eq: ['$eventType', 'DETAIL_VIEW'] }, 1, 0] } }, viewers: { $addToSet: '$viewerHash' } } }, { $sort: { detailViews: -1, impressions: -1 } }, { $limit: 10 }]),
        EventModel.find({ organisationId: orgId }).select('_id title status rsvpCount').lean(),
      ]);
      const ids = eventIds.map((event) => event._id);
      const outcomes = ids.length ? await RsvpModel.countDocuments({ eventId: { $in: ids }, createdAt: { $gte: start, $lt: end } }) : 0;
      const titles = new Map(eventIds.map((event) => [event._id.toString(), event.title]));
      const result = counts[0] ?? { impressions: 0, detailViews: 0, viewers: [] };
      return {
        impressions: result.impressions,
        uniqueReach: result.viewers.length,
        detailViews: result.detailViews,
        outcomes,
        activeContent: eventIds.filter((event) => event.status === 'PUBLISHED').length,
        daily: daily.map((row) => ({ date: row._id, impressions: row.impressions, detailViews: row.detailViews, uniqueReach: new Set(row.viewerSets.flat()).size })),
        topContent: top.map((row) => ({ id: row._id.toString(), title: titles.get(row._id.toString()) ?? 'Event', impressions: row.impressions, uniqueReach: row.viewers.length, detailViews: row.detailViews })),
      };
    },
  },
};
