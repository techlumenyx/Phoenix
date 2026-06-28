import { getAuth } from 'firebase-admin/auth';
import { GraphQLError } from 'graphql';
import { UserModel } from '../models';
import type { GraphQLContext } from '../context';

export async function createUser(
  _: unknown,
  args: { input: { name: string } },
  context: GraphQLContext,
) {
  console.log('[createUser] auth state:', {
    isAuthenticated: context.auth.isAuthenticated,
    firebaseUid: context.auth.firebaseUid,
    email: context.auth.email,
  });

  if (!context.auth.isAuthenticated || !context.auth.firebaseUid) {
    console.warn('[createUser] rejected: unauthenticated');
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  }

  const { firebaseUid, email } = context.auth;

  console.log('[createUser] checking for existing user, uid:', firebaseUid);
  const existing = await UserModel.findOne({ firebaseUid });
  if (existing) {
    console.log('[createUser] existing user found, returning early');
    return existing;
  }

  console.log('[createUser] setting custom claims...');
  await getAuth().setCustomUserClaims(firebaseUid, { accountType: 'user' });
  console.log('[createUser] custom claims set');

  const safeName = (args.input.name ?? '').trim() || context.auth.email?.split('@')[0] || 'User';
  console.log('[createUser] creating user document, name:', safeName);

  const user = await UserModel.create({
    firebaseUid,
    email,
    name: safeName,
    region: null,
    regionCode: null,
    preferences: [],
    onboardingCompleted: false,
    roles: [],
    orgId: null,
    orgInvitedBy: null,
    orgJoinedAt: null,
  });

  console.log('[createUser] user document created, id:', user._id);
  return user;
}
