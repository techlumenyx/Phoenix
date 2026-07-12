import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { JobListingModel, MarketplaceItemModel, SavedClassifiedModel } from '../models';
import type { GraphQLContext } from '../context';
import { mapJob } from './job.resolver';
import { mapItem } from './marketplace.resolver';

function uid(ctx: GraphQLContext) {
  if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) throw new GraphQLError('Sign in to save items', { extensions: { code: 'UNAUTHENTICATED' } });
  return ctx.auth.firebaseUid;
}

async function savedIds(userFirebaseUid: string, kind: 'JOB' | 'MARKETPLACE') {
  const rows = await SavedClassifiedModel.find({ userFirebaseUid, kind }).sort({ createdAt: -1 }).lean();
  return rows.map((row) => row.targetId);
}

async function save(ctx: GraphQLContext, kind: 'JOB' | 'MARKETPLACE', id: string) {
  const userFirebaseUid = uid(ctx);
  const targetId = new mongoose.Types.ObjectId(id);
  const exists = kind === 'JOB' ? await JobListingModel.exists({ _id: targetId }) : await MarketplaceItemModel.exists({ _id: targetId });
  if (!exists) throw new GraphQLError('Item not found', { extensions: { code: 'NOT_FOUND' } });
  await SavedClassifiedModel.updateOne({ userFirebaseUid, kind, targetId }, { $setOnInsert: { userFirebaseUid, kind, targetId } }, { upsert: true });
  return true;
}

async function unsave(ctx: GraphQLContext, kind: 'JOB' | 'MARKETPLACE', id: string) {
  await SavedClassifiedModel.deleteOne({ userFirebaseUid: uid(ctx), kind, targetId: new mongoose.Types.ObjectId(id) });
  return true;
}

export const savedClassifiedResolvers = {
  Query: {
    mySavedJobs: async (_: unknown, __: unknown, ctx: GraphQLContext) => (await JobListingModel.find({ _id: { $in: await savedIds(uid(ctx), 'JOB') } })).map(mapJob),
    mySavedMarketplaceItems: async (_: unknown, __: unknown, ctx: GraphQLContext) => (await MarketplaceItemModel.find({ _id: { $in: await savedIds(uid(ctx), 'MARKETPLACE') } })).map(mapItem),
    isJobSaved: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => Boolean(await SavedClassifiedModel.exists({ userFirebaseUid: uid(ctx), kind: 'JOB', targetId: new mongoose.Types.ObjectId(id) })),
    isMarketplaceItemSaved: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => Boolean(await SavedClassifiedModel.exists({ userFirebaseUid: uid(ctx), kind: 'MARKETPLACE', targetId: new mongoose.Types.ObjectId(id) })),
  },
  Mutation: {
    saveJob: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => save(ctx, 'JOB', id),
    unsaveJob: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => unsave(ctx, 'JOB', id),
    saveMarketplaceItem: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => save(ctx, 'MARKETPLACE', id),
    unsaveMarketplaceItem: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => unsave(ctx, 'MARKETPLACE', id),
  },
};
