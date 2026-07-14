import { eventResolvers } from './event.resolver';
import { eventNotificationResolvers } from './notification.resolver';

export const resolvers = {
  Query:        { ...eventResolvers.Query, ...eventNotificationResolvers.Query },
  Mutation:     { ...eventResolvers.Mutation, ...eventNotificationResolvers.Mutation },
  Organisation: eventResolvers.Organisation,
  Event:        eventResolvers.Event,
  RSVP:         eventResolvers.RSVP,
};
