import { getAuth } from 'firebase-admin/auth';
import { GraphQLError } from 'graphql';
import { OrganisationModel, UserModel } from '../models';
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
  if (existing) {
    if (!existing.name && args.input.name) {
      existing.name = args.input.name;
      await existing.save();
    }
    await setOrganisationAccess(firebaseUid, existing._id.toString());
    return existing;
  }

  const organisation = await OrganisationModel.create({
    createdBy: firebaseUid,
    name: args.input.name,
    region: args.input.region ?? null,
    regionCode: null,
    verificationStatus: 'PENDING_SUBMISSION',
    onboardingCompleted: false,
    followerCount: 0,
  });
  await setOrganisationAccess(firebaseUid, organisation._id.toString());
  return organisation;
}

async function setOrganisationAccess(firebaseUid: string, orgId: string) {
  const roles = ['master_admin'];
  await getAuth().setCustomUserClaims(firebaseUid, { accountType: 'organisation', orgId, roles });
  await UserModel.updateOne({ firebaseUid }, { $set: { orgId, roles, orgJoinedAt: new Date() } });
}
