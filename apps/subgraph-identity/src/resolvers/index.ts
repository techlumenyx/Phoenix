import { userResolvers } from './user.resolver';
import { organisationResolvers } from './organisation.resolver';
import { signUp } from './mutation.signUp';
import { createUser } from './mutation.createUser';
import { createOrganisation as createOrganisationResolver } from './mutation.createOrganisation';
import { myOrganisations } from './query.myOrganisations';
import { followResolvers } from './follow.resolver';
import { teamResolvers } from './team.resolver';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...organisationResolvers.Query,
    myOrganisations,
    ...followResolvers.Query,
    ...teamResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...organisationResolvers.Mutation,
    signUp,
    createUser,
    createOrganisation: createOrganisationResolver,
    ...followResolvers.Mutation,
    ...teamResolvers.Mutation,
  },
  User: userResolvers.User,
  Organisation: organisationResolvers.Organisation,
};
