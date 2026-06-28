import { userResolvers } from './user.resolver';
import { organisationResolvers } from './organisation.resolver';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...organisationResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...organisationResolvers.Mutation,
  },
  User: userResolvers.User,
  Organisation: organisationResolvers.Organisation,
};
