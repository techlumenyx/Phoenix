import mongoose from 'mongoose';
import { OrganisationModel, UserModel } from '../models';
import type { GraphQLContext } from '../context';

export async function myOrganisations(
  _: unknown,
  __: unknown,
  context: GraphQLContext,
) {
  if (!context.auth.isAuthenticated || !context.auth.firebaseUid) return [];
  const claimedOrgId = typeof context.auth.decodedToken?.['orgId'] === 'string' ? context.auth.decodedToken['orgId'] : null;
  const user = claimedOrgId ? null : await UserModel.findOne({ firebaseUid: context.auth.firebaseUid }).select('orgId');
  const orgId = claimedOrgId || user?.orgId?.toString();
  const filters: Record<string, unknown>[] = [{ createdBy: context.auth.firebaseUid }];
  if (orgId && mongoose.isValidObjectId(orgId)) filters.push({ _id: new mongoose.Types.ObjectId(orgId) });
  return OrganisationModel.find({ $or: filters });
}
