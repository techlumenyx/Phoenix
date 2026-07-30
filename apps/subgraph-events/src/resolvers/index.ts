import { eventResolvers } from './event.resolver';
import { eventNotificationResolvers } from './notification.resolver';
import { eventAnalyticsResolvers } from './analytics.resolver';

export const resolvers = {
  Query:        { ...eventResolvers.Query, ...eventNotificationResolvers.Query, ...eventAnalyticsResolvers.Query },
  Mutation:     { ...eventResolvers.Mutation, ...eventNotificationResolvers.Mutation, ...eventAnalyticsResolvers.Mutation },
  Organisation: eventResolvers.Organisation,
  Event:        eventResolvers.Event,
  RSVP:         eventResolvers.RSVP,
};
