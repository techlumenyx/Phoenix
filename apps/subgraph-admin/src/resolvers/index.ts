import { moderationResolvers } from './moderation.resolver';
import { verificationResolvers } from './verification.resolver';
import { directoryResolvers } from './directory.resolver';
import { stage4Resolvers } from './stage4.resolver';

export const resolvers = {
  Query: { ...moderationResolvers.Query, ...verificationResolvers.Query, ...directoryResolvers.Query, ...stage4Resolvers.Query },
  Mutation: { ...moderationResolvers.Mutation, ...verificationResolvers.Mutation, ...directoryResolvers.Mutation, ...stage4Resolvers.Mutation },
  ModerationCase: moderationResolvers.ModerationCase,
  VerificationSubmission: verificationResolvers.VerificationSubmission,
  AdminTemplate: stage4Resolvers.AdminTemplate,
};
