import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { FollowRelationshipModel, OrganisationModel } from '../models';
import type { GraphQLContext } from '../context';

function requireUid(ctx: GraphQLContext) {
  if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) throw new GraphQLError('Sign in to follow organisations', { extensions: { code: 'UNAUTHENTICATED' } });
  return ctx.auth.firebaseUid;
}

function orgShape(doc: InstanceType<typeof OrganisationModel>) {
  return { id: doc._id.toString(), name: doc.name ?? '', description: doc.description ?? null, logoUrl: doc.logoUrl ?? null, websiteUrl: doc.websiteUrl ?? null, socialLinks: doc.socialLinks ?? null, region: doc.region ?? '', isVerified: doc.verificationStatus === 'VERIFIED', verificationTier: doc.verificationTier ?? 'NONE', followerCount: doc.followerCount, createdAt: doc.createdAt, updatedAt: doc.updatedAt };
}

async function findOrg(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new GraphQLError('Organisation not found', { extensions: { code: 'NOT_FOUND' } });
  const org = await OrganisationModel.findById(id);
  if (!org) throw new GraphQLError('Organisation not found', { extensions: { code: 'NOT_FOUND' } });
  return org;
}

export const followResolvers = {
  Query: {
    myFollowingOrganisations: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const rows = await FollowRelationshipModel.find({ followerFirebaseUid: requireUid(ctx) }).sort({ createdAt: -1 });
      const docs = await OrganisationModel.find({ _id: { $in: rows.map((row) => row.organisationId) } });
      const byId = new Map(docs.map((doc) => [doc._id.toString(), doc]));
      return rows.flatMap((row) => { const doc = byId.get(row.organisationId.toString()); return doc ? [orgShape(doc)] : []; });
    },
    isFollowingOrganisation: async (_: unknown, { organisationId }: { organisationId: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid || !mongoose.isValidObjectId(organisationId)) return false;
      return Boolean(await FollowRelationshipModel.exists({ followerFirebaseUid: ctx.auth.firebaseUid, organisationId: new mongoose.Types.ObjectId(organisationId) }));
    },
  },
  Mutation: {
    followOrganisation: async (_: unknown, { organisationId }: { organisationId: string }, ctx: GraphQLContext) => {
      const uid = requireUid(ctx); const org = await findOrg(organisationId);
      const result = await FollowRelationshipModel.updateOne({ followerFirebaseUid: uid, organisationId: org._id }, { $setOnInsert: { followerFirebaseUid: uid, organisationId: org._id } }, { upsert: true });
      if (result.upsertedCount > 0) { org.followerCount += 1; await org.save(); }
      return orgShape(org);
    },
    unfollowOrganisation: async (_: unknown, { organisationId }: { organisationId: string }, ctx: GraphQLContext) => {
      const uid = requireUid(ctx); const org = await findOrg(organisationId);
      const result = await FollowRelationshipModel.deleteOne({ followerFirebaseUid: uid, organisationId: org._id });
      if (result.deletedCount > 0 && org.followerCount > 0) { org.followerCount -= 1; await org.save(); }
      return orgShape(org);
    },
  },
};
