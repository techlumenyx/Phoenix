import { userResolvers } from './user.resolver';
import { organisationResolvers } from './organisation.resolver';
import { signUp } from './mutation.signUp';
import { createUser } from './mutation.createUser';
import { createOrganisation as createOrganisationResolver } from './mutation.createOrganisation';
import { myOrganisations } from './query.myOrganisations';
import { followResolvers } from './follow.resolver';
import { teamResolvers } from './team.resolver';
import { identityNotificationResolvers } from './notification.resolver';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...organisationResolvers.Query,
    myOrganisations,
    ...followResolvers.Query,
    ...teamResolvers.Query,
    ...identityNotificationResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...organisationResolvers.Mutation,
    signUp,
    createUser,
    createOrganisation: createOrganisationResolver,
    ...followResolvers.Mutation,
    ...teamResolvers.Mutation,
    ...identityNotificationResolvers.Mutation,
  },
  User: userResolvers.User,
  Organisation: organisationResolvers.Organisation,
};
