import mongoose from 'mongoose';
import { type Connection } from 'mongoose';
import { EventSchema, type IEvent } from './event.model';
import { RsvpSchema, type IRsvp } from './rsvp.model';

export let EventModel: mongoose.Model<IEvent>;
export let RsvpModel: mongoose.Model<IRsvp>;

export function setupModels(conn: Connection) {
  EventModel = conn.model<IEvent>('Event', EventSchema);
  RsvpModel = conn.model<IRsvp>('Rsvp', RsvpSchema);
}
