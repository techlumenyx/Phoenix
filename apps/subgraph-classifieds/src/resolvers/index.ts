import { marketplaceResolvers } from './marketplace.resolver';
import { jobResolvers } from './job.resolver';
import { jobApplicationResolvers } from './job-application.resolver';
import { savedClassifiedResolvers } from './saved-classified.resolver';
import { messagingResolvers } from './messaging.resolver';

export const resolvers = {
  Query: {
    ...marketplaceResolvers.Query,
    ...jobResolvers.Query,
    ...jobApplicationResolvers.Query,
    ...savedClassifiedResolvers.Query,
    ...messagingResolvers.Query,
  },
  Mutation: {
    ...marketplaceResolvers.Mutation,
    ...jobResolvers.Mutation,
    ...jobApplicationResolvers.Mutation,
    ...savedClassifiedResolvers.Mutation,
    ...messagingResolvers.Mutation,
  },
  MarketplaceItem: marketplaceResolvers.MarketplaceItem,
  JobListing:      jobResolvers.JobListing,
  JobApplication:  jobApplicationResolvers.JobApplication,
  Organisation:    jobResolvers.Organisation,
  User:            { ...marketplaceResolvers.User, ...jobApplicationResolvers.User },
  MessageThread: messagingResolvers.MessageThread,
  Message: messagingResolvers.Message,
};
