import mongoose from 'mongoose';
import { type Connection } from 'mongoose';
import { EventSchema, type IEvent } from './event.model';
import { RsvpSchema, type IRsvp } from './rsvp.model';
import { EventOrganisationNotificationSchema, type IEventOrganisationNotification } from './organisation-notification.model';
import { EventSeriesSchema, type IEventSeries } from './event-series.model';
import { SeriesRsvpSchema, type ISeriesRsvp } from './series-rsvp.model';
import { MediaAssetSchema, type IMediaAsset } from '@christian-listings/db';

export let EventModel: mongoose.Model<IEvent>;
export let RsvpModel: mongoose.Model<IRsvp>;
export let EventOrganisationNotificationModel: mongoose.Model<IEventOrganisationNotification>;
export let EventSeriesModel: mongoose.Model<IEventSeries>;
export let SeriesRsvpModel: mongoose.Model<ISeriesRsvp>;
export let MediaAssetModel: mongoose.Model<IMediaAsset>;

export function setupModels(conn: Connection) {
  EventModel = conn.model<IEvent>('Event', EventSchema);
  RsvpModel = conn.model<IRsvp>('Rsvp', RsvpSchema);
  EventOrganisationNotificationModel = conn.model<IEventOrganisationNotification>('OrganisationNotification', EventOrganisationNotificationSchema);
  EventSeriesModel = conn.model<IEventSeries>('EventSeries', EventSeriesSchema);
  SeriesRsvpModel = conn.model<ISeriesRsvp>('SeriesRsvp', SeriesRsvpSchema);
  MediaAssetModel = conn.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
}
