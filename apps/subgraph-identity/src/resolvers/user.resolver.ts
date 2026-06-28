import { GraphQLError } from 'graphql';
import { type HydratedDocument } from 'mongoose';
import { type IUser } from '../models/user.model';
import { UserModel as _UserModel } from '../models';
import type { GraphQLContext } from '../context';

function UserModel() { return _UserModel; }

function mapUser(doc: HydratedDocument<IUser>) {
  return {
    id: doc._id.toString(),
    firebaseUid: doc.firebaseUid,
    email: doc.email,
    name: doc.name,
    avatarUrl: doc.avatarUrl ?? null,
    bio: doc.bio ?? null,
    socialLinks: doc.socialLinks ?? null,
    isVerified: doc.isVerified ?? false,
    onboardingCompleted: doc.onboardingCompleted ?? false,
    preferences: doc.preferences ?? [],
    region: doc.region ?? '',
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

    user: async (_: unknown, { id }: { id: string }) => {
      const doc = await UserModel().findById(id);
      return doc ? mapUser(doc) : null;
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
      const doc = await UserModel().findOneAndUpdate(
        { firebaseUid: ctx.auth.firebaseUid },
        { $set: input },
        { new: true },
      );
      if (!doc) throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
      return mapUser(doc);
    },
  },

  User: {
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await UserModel().findById(id);
      return doc ? mapUser(doc) : null;
    },
  },
};

export type { IUser };
