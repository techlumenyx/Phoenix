import { userResolvers } from './user.resolver';
import { organisationResolvers } from './organisation.resolver';
import { signUp } from './mutation.signUp';
import { createUser } from './mutation.createUser';
import { createOrganisation as createOrganisationResolver } from './mutation.createOrganisation';
import { myOrganisations } from './query.myOrganisations';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...organisationResolvers.Query,
    myOrganisations,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...organisationResolvers.Mutation,
    signUp,
    createUser,
    createOrganisation: createOrganisationResolver,
  },
  User: userResolvers.User,
  Organisation: organisationResolvers.Organisation,
};
