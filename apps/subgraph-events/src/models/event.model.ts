import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const EVENT_CATEGORIES = [
  'WORSHIP',
  'BIBLE_STUDY',
  'YOUTH',
  'COMMUNITY',
  'CHARITY',
  'WELFARE',
  'CONFERENCE',
  'CULTURAL',
  'MUSIC',
  'OTHER',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'CANCELLED',
  'COMPLETED',
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface IEventLocation {
  address: string | null;
  city:    string | null;
  country: string | null;
}

export interface IEvent {
  _id: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  createdBy: string;   // firebaseUid of the org member who created this event

  title:       string;
  description: string;
  category:    EventCategory;

  // Format & location
  eventType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  location:  IEventLocation | null;   // null for ONLINE events
  onlineUrl: string | null;           // null for IN_PERSON events

  // Region
  region:     string | null;   // display  — "London, UK"
  regionCode: string | null;   // filter   — "GB-LND"

  // Scheduling
  startDate: Date;
  endDate:   Date | null;

  // Capacity — null = unlimited; resolver rejects CONFIRMED when full
  capacity: number | null;

  // Media — coverImageUrl: Phase 1; imageUrls + videoEmbedUrl: Phase 2
  coverImageUrl:  string | null;
  imageUrls:      string[];         // up to 10, populated in Phase 2
  videoEmbedUrl:  string | null;    // YouTube embed URL, Phase 2

  // Ticketing — field stored now, logic wired in Phase 2
  isTicketed: boolean;
  ticketUrl:  string | null;

  // Notifications
  notifyAttendees: boolean;

  // Platform state
  status:        EventStatus;
  isPromoted:    boolean;
  promotedUntil: Date | null;

  // Denormalized counter — updated with $inc on CONFIRMED rsvp changes
  rsvpCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

const EventLocationSchema = new Schema<IEventLocation>(
  {
    address: { type: String, default: null },
    city:    { type: String, default: null },
    country: { type: String, default: null },
  },
  { _id: false },
);

export const EventSchema = new Schema<IEvent>(
  {
    organisationId: { type: Schema.Types.ObjectId, required: true },
    createdBy:      { type: String,                required: true },

    title:       { type: String, required: true },
    description: { type: String, required: true },
    category:    { type: String, enum: EVENT_CATEGORIES, required: true },

    eventType: {
      type:     String,
      enum:     ['PHYSICAL', 'VIRTUAL', 'HYBRID'],
      required: true,
    },
    location:  { type: EventLocationSchema, default: null },
    onlineUrl: { type: String, default: null },

    region:     { type: String, default: null },
    regionCode: { type: String, default: null },

    startDate: { type: Date, required: true },
    endDate:   { type: Date, default: null },

    capacity: { type: Number, default: null },

    coverImageUrl: { type: String, default: null },
    imageUrls:     [{ type: String }],
    videoEmbedUrl: { type: String, default: null },

    isTicketed: { type: Boolean, default: false },
    ticketUrl:  { type: String,  default: null },

    notifyAttendees: { type: Boolean, default: false },

    status:        { type: String, enum: EVENT_STATUSES, default: 'DRAFT' },
    isPromoted:    { type: Boolean, default: false },
    promotedUntil: { type: Date,    default: null },

    rsvpCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Main discovery query — region + published + upcoming
EventSchema.index({ regionCode: 1, status: 1, startDate: 1 });
// Org's own events list
EventSchema.index({ organisationId: 1, status: 1 });
// Category filter on discovery page
EventSchema.index({ category: 1, status: 1 });
// Promoted strip query
EventSchema.index({ isPromoted: 1, promotedUntil: 1 });
