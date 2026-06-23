import { getAuth } from 'firebase-admin/auth';
import { GraphQLError } from 'graphql';
import { UserModel } from '../models/user.model';
import type { GraphQLContext } from '../context';

export async function createUser(
  _: unknown,
  args: { input: { name: string } },
  context: GraphQLContext,
) {
  if (!context.auth.isAuthenticated || !context.auth.firebaseUid) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  }

  const { firebaseUid, email } = context.auth;

  const existing = await UserModel.findOne({ firebaseUid });
  if (existing) return existing;

  await getAuth().setCustomUserClaims(firebaseUid, { accountType: 'user' });

  return UserModel.create({
    firebaseUid,
    email,
    name: args.input.name,
    region: null,
    regionCode: null,
    preferences: [],
    onboardingCompleted: false,
    roles: [],
    orgId: null,
    orgInvitedBy: null,
    orgJoinedAt: null,
  });
}
