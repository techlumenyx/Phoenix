import { signUp } from './mutation.signUp';
import { createUser } from './mutation.createUser';
import { createOrganisation } from './mutation.createOrganisation';
import { myOrganisations } from './query.myOrganisations';

export const resolvers = {
  Query: {
    myOrganisations,
  },
  Mutation: {
    signUp,
    createUser,
    createOrganisation,
  },
};
