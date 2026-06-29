import { eventResolvers } from './event.resolver';

export const resolvers = {
  Query:        eventResolvers.Query,
  Mutation:     eventResolvers.Mutation,
  Organisation: eventResolvers.Organisation,
  Event:        eventResolvers.Event,
  RSVP:         eventResolvers.RSVP,
};
