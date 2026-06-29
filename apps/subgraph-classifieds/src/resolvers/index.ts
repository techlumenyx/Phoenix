import { marketplaceResolvers } from './marketplace.resolver';
import { jobResolvers } from './job.resolver';

export const resolvers = {
  Query: {
    ...marketplaceResolvers.Query,
    ...jobResolvers.Query,
  },
  Mutation: {
    ...marketplaceResolvers.Mutation,
    ...jobResolvers.Mutation,
  },
  MarketplaceItem: marketplaceResolvers.MarketplaceItem,
  JobListing:      jobResolvers.JobListing,
  Organisation:    jobResolvers.Organisation,
  User:            marketplaceResolvers.User,
};
