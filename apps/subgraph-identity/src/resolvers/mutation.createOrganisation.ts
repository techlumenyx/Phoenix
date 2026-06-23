import { getAuth } from 'firebase-admin/auth';
import { GraphQLError } from 'graphql';
import { OrganisationModel } from '../models/organisation.model';
import type { GraphQLContext } from '../context';

export async function createOrganisation(
  _: unknown,
  args: { input: { name: string; region?: string | null } },
  context: GraphQLContext,
) {
  if (!context.auth.isAuthenticated || !context.auth.firebaseUid) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  }

  const { firebaseUid } = context.auth;

  const existing = await OrganisationModel.findOne({ createdBy: firebaseUid });
  if (existing) return existing;

  await getAuth().setCustomUserClaims(firebaseUid, { accountType: 'organisation' });

  return OrganisationModel.create({
    createdBy: firebaseUid,
    name: args.input.name,
    region: args.input.region ?? null,
    regionCode: null,
    verificationStatus: 'PENDING_SUBMISSION',
    onboardingCompleted: false,
    followerCount: 0,
  });
}
