import { GraphQLError } from 'graphql';
import mongoose, { type HydratedDocument } from 'mongoose';
import { type IOrganisation } from '../models/organisation.model';
import { OrganisationModel as _OrgModel } from '../models';
import type { GraphQLContext } from '../context';

function OrganisationModel() { return _OrgModel; }

function mapOrg(doc: HydratedDocument<IOrganisation>) {
  return {
    id: doc._id.toString(),
    name: doc.name ?? '',
    description: doc.description ?? null,
    logoUrl: doc.logoUrl ?? null,
    websiteUrl: doc.websiteUrl ?? null,
    socialLinks: doc.socialLinks ?? null,
    region: doc.region ?? '',
    isVerified: doc.verificationStatus === 'VERIFIED',
    verificationTier: doc.verificationTier ?? 'NONE',
    followerCount: doc.followerCount,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

interface CreateOrgInput {
  name: string;
  description?: string;
  logoUrl?: string;
  region: string;
  websiteUrl?: string;
}

interface UpdateOrgInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  region?: string;
  websiteUrl?: string;
  socialLinks?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
}

export const organisationResolvers = {
  Query: {
    organisation: async (_: unknown, { id }: { id: string }) => {
      const doc = await OrganisationModel().findById(id);
      return doc ? mapOrg(doc) : null;
    },

    organisations: async (
      _: unknown,
      { region, limit = 20, after }: { region?: string; limit?: number; after?: string },
    ) => {
      const filter: Record<string, unknown> = { onboardingCompleted: true };
      if (region) filter['regionCode'] = region;
      if (after) filter['_id'] = { $gt: new mongoose.Types.ObjectId(after) };

      const docs = await OrganisationModel().find(filter).limit(limit + 1).sort({ _id: 1 });
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map(mapOrg);

      return {
        edges,
        hasNextPage,
        endCursor: edges.length > 0 ? edges[edges.length - 1].id : null,
      };
    },

    myOrganisations: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) return [];
      const docs = await OrganisationModel().find({ createdBy: ctx.auth.firebaseUid });
      return docs.map(mapOrg);
    },
  },

  Mutation: {
    createOrganisation: async (
      _: unknown,
      { input }: { input: CreateOrgInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const doc = await OrganisationModel().create({
        createdBy: ctx.auth.firebaseUid,
        name: input.name,
        description: input.description ?? null,
        logoUrl: input.logoUrl ?? null,
        websiteUrl: input.websiteUrl ?? null,
        region: input.region,
        onboardingCompleted: true,
      });
      return mapOrg(doc);
    },

    updateOrganisation: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateOrgInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const doc = await OrganisationModel().findOneAndUpdate(
        { _id: id, createdBy: ctx.auth.firebaseUid },
        { $set: input },
        { new: true },
      );
      if (!doc) {
        throw new GraphQLError('Organisation not found or access denied', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return mapOrg(doc);
    },

    submitVerification: async (
      _: unknown,
      { organisationId, documentUrls }: { organisationId: string; documentUrls: string[] },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const doc = await OrganisationModel().findOneAndUpdate(
        { _id: organisationId, createdBy: ctx.auth.firebaseUid },
        {
          $set: {
            'verificationDetails.documentUrls': documentUrls,
            verificationStatus: 'PENDING_REVIEW',
          },
        },
        { new: true },
      );
      if (!doc) {
        throw new GraphQLError('Organisation not found or access denied', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      // Return a VerificationRequest-shaped object for the schema
      return {
        id: doc._id.toString(),
        organisation: mapOrg(doc),
        status: 'PENDING',
        documentsUrls: documentUrls,
        submittedAt: new Date(),
        reviewedAt: null,
        rejectionReason: null,
      };
    },
  },

  Organisation: {
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await OrganisationModel().findById(id);
      return doc ? mapOrg(doc) : null;
    },
  },
};
