import { moderationResolvers } from './moderation.resolver';
import { verificationResolvers } from './verification.resolver';
import { directoryResolvers } from './directory.resolver';
import { stage4Resolvers } from './stage4.resolver';
import { emailResolvers } from './email.resolver';
import { riskAnalysisResolvers } from './risk-analysis.resolver';
import { reportConversationResolvers } from './report-conversation.resolver';

export const resolvers = {
  Query: { ...moderationResolvers.Query, ...verificationResolvers.Query, ...directoryResolvers.Query, ...stage4Resolvers.Query, ...emailResolvers.Query, ...riskAnalysisResolvers.Query, ...reportConversationResolvers.Query },
  Mutation: { ...moderationResolvers.Mutation, ...verificationResolvers.Mutation, ...directoryResolvers.Mutation, ...stage4Resolvers.Mutation, ...emailResolvers.Mutation, ...riskAnalysisResolvers.Mutation, ...reportConversationResolvers.Mutation },
  ModerationCase: { ...moderationResolvers.ModerationCase, ...riskAnalysisResolvers.ModerationCase },
  ReportConversation: reportConversationResolvers.ReportConversation,
  VerificationSubmission: verificationResolvers.VerificationSubmission,
  AdminTemplate: stage4Resolvers.AdminTemplate,
};
