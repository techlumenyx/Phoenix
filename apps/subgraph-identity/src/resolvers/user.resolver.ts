import { GraphQLError } from 'graphql';
import { type HydratedDocument } from 'mongoose';
import { type IUser } from '../models/user.model';
import { UserModel as _UserModel } from '../models';
import type { GraphQLContext } from '../context';
import { resolveLocationRegion } from '@christian-listings/utils';

function UserModel() { return _UserModel; }

const DEFAULT_PRIVACY = {
  profileVisibility: 'MEMBERS_ONLY' as const,
  showAvatar: true,
  showRegion: true,
  showBio: true,
  showSocialLinks: false,
};

function mapUser(doc: HydratedDocument<IUser>, ctx?: GraphQLContext, enforcePrivacy = false) {
  const privacy = {
    profileVisibility: doc.privacySettings?.profileVisibility ?? DEFAULT_PRIVACY.profileVisibility,
    showAvatar: doc.privacySettings?.showAvatar ?? DEFAULT_PRIVACY.showAvatar,
    showRegion: doc.privacySettings?.showRegion ?? DEFAULT_PRIVACY.showRegion,
    showBio: doc.privacySettings?.showBio ?? DEFAULT_PRIVACY.showBio,
    showSocialLinks: doc.privacySettings?.showSocialLinks ?? DEFAULT_PRIVACY.showSocialLinks,
  };
  const isSelf = Boolean(ctx?.auth.firebaseUid && ctx.auth.firebaseUid === doc.firebaseUid);
  const canViewExtended = !enforcePrivacy || isSelf || privacy.profileVisibility === 'PUBLIC' ||
    (privacy.profileVisibility === 'MEMBERS_ONLY' && Boolean(ctx?.auth.isAuthenticated));
  return {
    id: doc._id.toString(),
    firebaseUid: doc.firebaseUid,
    email: doc.email,
    name: doc.name,
    avatarUrl: canViewExtended && privacy.showAvatar ? doc.avatarUrl ?? null : null,
    bio: canViewExtended && privacy.showBio ? doc.bio ?? null : null,
    socialLinks: canViewExtended && privacy.showSocialLinks ? doc.socialLinks ?? null : null,
    privacySettings: privacy,
    isVerified: doc.isVerified ?? false,
    onboardingCompleted: doc.onboardingCompleted ?? false,
    preferences: doc.preferences ?? [],
    roles: doc.roles ?? [],
    orgId: doc.orgId?.toString() ?? null,
    region: canViewExtended && privacy.showRegion ? doc.region ?? '' : '',
    regionCode: canViewExtended && privacy.showRegion ? doc.regionCode ?? null : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) return null;

      const existing = await UserModel().findOne({ firebaseUid: ctx.auth.firebaseUid });
      if (existing) return mapUser(existing);

      // First login — create the MongoDB record from Firebase token data
      const created = await UserModel().create({
        firebaseUid: ctx.auth.firebaseUid,
        email: ctx.auth.email ?? '',
        name:
          ctx.auth.decodedToken?.name ??
          ctx.auth.email?.split('@')[0] ??
          'User',
      });
      return mapUser(created);
    },

    user: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const doc = await UserModel().findById(id);
      return doc ? mapUser(doc, ctx, true) : null;
    },
  },

  Mutation: {
    updateProfile: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const update = { ...input };
      if (typeof input['region'] === 'string') {
        const resolved = resolveLocationRegion(input['region']);
        if (resolved) {
          update['region'] = resolved.displayName;
          update['regionCode'] = resolved.code;
        }
      }
      const doc = await UserModel().findOneAndUpdate(
        { firebaseUid: ctx.auth.firebaseUid },
        { $set: update },
        { new: true },
      );
      if (!doc) throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
      return mapUser(doc);
    },
  },

  User: {
    __resolveReference: async ({ id, firebaseUid }: { id?: string; firebaseUid?: string }, ctx: GraphQLContext) => {
      const doc = firebaseUid ? await UserModel().findOne({ firebaseUid }) : await UserModel().findById(id);
      return doc ? mapUser(doc, ctx, true) : null;
    },
  },
};

export type { IUser };
