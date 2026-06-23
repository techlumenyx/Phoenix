import { OrganisationModel } from '../models/organisation.model';
import type { GraphQLContext } from '../context';

export async function myOrganisations(
  _: unknown,
  __: unknown,
  context: GraphQLContext,
) {
  if (!context.auth.isAuthenticated || !context.auth.firebaseUid) return [];
  return OrganisationModel.find({ createdBy: context.auth.firebaseUid });
}
