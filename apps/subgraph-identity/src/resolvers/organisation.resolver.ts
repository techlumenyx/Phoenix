import { GraphQLError } from 'graphql';
import mongoose, { type HydratedDocument } from 'mongoose';
import { type IOrganisation } from '../models/organisation.model';
import { IdentityOrganisationNotificationModel, OrganisationModel as _OrgModel } from '../models';
import type { GraphQLContext } from '../context';
import { resolveLocationRegion } from '@christian-listings/utils';
import { canAccessOrganisation } from '@christian-listings/auth';
import { sendVerificationSubmission } from '../services/admin-verification.client';

function OrganisationModel() { return _OrgModel; }

function mapOrg(doc: HydratedDocument<IOrganisation>) {
  return {
    id: doc._id.toString(),
    name: doc.name ?? '',
    description: doc.description ?? null,
    logoUrl: doc.logoUrl ?? null,
    websiteUrl: doc.websiteUrl ?? null,
    contactEmail: doc.contactEmail ?? null,
    phoneNumber: doc.phoneNumber ?? null,
    socialLinks: doc.socialLinks ?? null,
    region: doc.region ?? '',
    isVerified: doc.verificationStatus === 'VERIFIED',
    verificationTier: doc.verificationTier ?? 'NONE',
    followerCount: doc.followerCount,
    isActive: doc.isActive !== false,
    deactivatedAt: doc.deactivatedAt ?? null,
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
  contactEmail?: string;
  phoneNumber?: string;
}

interface UpdateOrgInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  region?: string;
  websiteUrl?: string;
  contactEmail?: string;
  phoneNumber?: string;
  socialLinks?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
}

interface VerificationDetailsInput {
  officialName?: string | null;
  registrationNumber?: string | null;
  officialEmail?: string | null;
  pocName?: string | null;
  pocTitle?: string | null;
}

export const organisationResolvers = {
  Query: {
    organisation: async (_: unknown, { id }: { id: string }) => {
      const doc = await OrganisationModel().findOne({ _id: id, isActive: { $ne: false } });
      return doc ? mapOrg(doc) : null;
    },

    organisations: async (
      _: unknown,
      { region, search, limit = 20, after }: { region?: string; search?: string; limit?: number; after?: string },
    ) => {
      const filter: Record<string, unknown> = { onboardingCompleted: true, isActive: { $ne: false } };
      if (region) {
        const resolved = resolveLocationRegion(region);
        if (resolved) filter['$and'] = [{ $or: [{ region: resolved.displayName }, { regionCode: { $in: resolved.codes } }] }];
      }
      if (search?.trim()) {
        const pattern = { $regex: escapeRegex(search.trim()), $options: 'i' };
        filter['$and'] = [...((filter['$and'] as unknown[]) ?? []), { $or: [{ name: pattern }, { description: pattern }] }];
      }
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
      const region = resolveLocationRegion(input.region);
      const doc = await OrganisationModel().create({
        createdBy: ctx.auth.firebaseUid,
        name: input.name,
        description: input.description ?? null,
        logoUrl: input.logoUrl ?? null,
        websiteUrl: input.websiteUrl ?? null,
        region: region?.displayName ?? input.region.trim(),
        regionCode: region?.code ?? null,
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
      if (!canAccessOrganisation(ctx.auth, id, ['master_admin', 'site_admin'])) {
        throw new GraphQLError('Organisation settings access denied', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      const update: Record<string, unknown> = { ...input };
      if (input.region !== undefined) {
        const region = resolveLocationRegion(input.region);
        update['region'] = region?.displayName ?? input.region.trim();
        update['regionCode'] = region?.code ?? null;
      }
      const doc = await OrganisationModel().findOneAndUpdate(
        { _id: id },
        { $set: update },
        { new: true },
      );
      if (!doc) {
        throw new GraphQLError('Organisation not found or access denied', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return mapOrg(doc);
    },

    setOrganisationActive: async (
      _: unknown,
      { organisationId, active }: { organisationId: string; active: boolean },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      if (!canAccessOrganisation(ctx.auth, organisationId, ['master_admin'])) {
        throw new GraphQLError('Only an organisation owner can change its lifecycle status', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      const doc = await OrganisationModel().findByIdAndUpdate(
        organisationId,
        { $set: { isActive: active, deactivatedAt: active ? null : new Date() } },
        { new: true },
      );
      if (!doc) {
        throw new GraphQLError('Organisation not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return mapOrg(doc);
    },

    submitVerification: async (
      _: unknown,
      { organisationId, documentUrls, requestedTier = 'STANDARD', details }: { organisationId: string; documentUrls: string[]; requestedTier?: 'STANDARD' | 'CHARITY' | 'NGO'; details?: VerificationDetailsInput | null },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      if (!['STANDARD', 'CHARITY', 'NGO'].includes(requestedTier)) {
        throw new GraphQLError('Select a supported verification tier', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (documentUrls.length < 1 || documentUrls.length > 10 || documentUrls.some((url) => !isSecureDocumentUrl(url))) {
        throw new GraphQLError('Provide between 1 and 10 secure document URLs', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const doc = await OrganisationModel().findOne({ _id: organisationId, createdBy: ctx.auth.firebaseUid });
      if (!doc) {
        throw new GraphQLError('Organisation not found or access denied', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      if (details) {
        doc.verificationDetails.officialName = cleanOptional(details.officialName);
        doc.verificationDetails.registrationNumber = cleanOptional(details.registrationNumber);
        doc.verificationDetails.officialEmail = cleanOptional(details.officialEmail);
        doc.verificationDetails.pocName = cleanOptional(details.pocName);
        doc.verificationDetails.pocTitle = cleanOptional(details.pocTitle);
      }
      doc.verificationDetails.documentUrls = documentUrls;
      const submission = await sendVerificationSubmission({ organisation: doc, requestedTier, documentUrls });
      doc.verificationStatus = 'PENDING_REVIEW';
      await doc.save();
      await IdentityOrganisationNotificationModel.updateOne(
        { dedupeKey: `verification:${doc._id}:PENDING_REVIEW` },
        { $setOnInsert: { organisationId: doc._id, type: 'VERIFICATION_UPDATE', title: 'Verification submitted', message: 'Your organisation verification has been submitted for review.', href: '/org/settings', sourceId: doc._id.toString(), dedupeKey: `verification:${doc._id}:PENDING_REVIEW`, readAt: null } },
        { upsert: true },
      );
      // Return a VerificationRequest-shaped object for the schema
      return {
        id: submission.id,
        organisation: mapOrg(doc),
        status: 'PENDING',
        documentsUrls: documentUrls,
        submittedAt: new Date(submission.createdAt),
        reviewedAt: null,
        rejectionReason: null,
      };
    },
  },

  Organisation: {
    isActive: (parent: { isActive?: boolean }) => parent.isActive !== false,
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await OrganisationModel().findById(id);
      return doc ? mapOrg(doc) : null;
    },
  },
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isSecureDocumentUrl(value: string) {
  if (value.startsWith('cl-private:raw:')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (process.env['NODE_ENV'] !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch {
    return false;
  }
}

function cleanOptional(value: string | null | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned.slice(0, 500) : null;
}
