import { getAuth } from 'firebase-admin/auth';
import { GraphQLError } from 'graphql';
import { UserModel } from '../models';
import type { GraphQLContext } from '../context';

export async function signUp(
  _: unknown,
  args: { input: { email: string; password: string; name: string } },
  _context: GraphQLContext,
) {
  const { email, password, name } = args.input;
  const safeName = name.trim() || email.split('@')[0];

  let uid: string;
  try {
    const fbUser = await getAuth().createUser({ email, password, displayName: safeName });
    uid = fbUser.uid;
  } catch (err: unknown) {
    const msg = (err as { message?: string }).message ?? 'Failed to create account';
    throw new GraphQLError(msg, { extensions: { code: 'BAD_USER_INPUT' } });
  }

  try {
    await getAuth().setCustomUserClaims(uid, { accountType: 'user' });

    await UserModel.create({
      firebaseUid: uid,
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

    // Embed accountType so the initial ID token already has the claim (no client-side refresh needed)
    const customToken = await getAuth().createCustomToken(uid, { accountType: 'user' });
    return { customToken };
  } catch (err) {
    // Clean up Firebase user if MongoDB write fails to avoid orphaned accounts
    await getAuth().deleteUser(uid).catch(() => undefined);
    throw new GraphQLError('Account creation failed — please try again.', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
}
