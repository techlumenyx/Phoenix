import mongoose, { Schema, type HydratedDocument } from 'mongoose';
import type { EventCategory, EventStatus, IEventLocation } from './event.model';

export const RECURRENCE_FREQUENCIES = ['WEEKLY', 'MONTHLY'] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

export interface IRecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek: number[];
  dayOfMonth: number | null;
  timezone: string;
  endsAt: Date | null;
  occurrenceCount: number | null;
}

export interface IEventSeries {
  _id: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  createdBy: string;
  title: string;
  description: string;
  category: EventCategory;
  eventType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  location: IEventLocation | null;
  onlineUrl: string | null;
  region: string | null;
  startDate: Date;
  endDate: Date | null;
  capacity: number | null;
  imageUrls: string[];
  ticketUrl: string | null;
  status: EventStatus;
  recurrence: IRecurrenceRule;
  createdAt: Date;
  updatedAt: Date;
}

export type EventSeriesDocument = HydratedDocument<IEventSeries>;

const EventLocationSchema = new Schema<IEventLocation>({
  address: { type: String, default: null },
  city: { type: String, default: null },
  country: { type: String, default: null },
}, { _id: false });

const RecurrenceRuleSchema = new Schema<IRecurrenceRule>({
  frequency: { type: String, enum: RECURRENCE_FREQUENCIES, required: true },
  interval: { type: Number, min: 1, max: 52, default: 1 },
  daysOfWeek: [{ type: Number, min: 0, max: 6 }],
  dayOfMonth: { type: Number, min: 1, max: 31, default: null },
  timezone: { type: String, required: true },
  endsAt: { type: Date, default: null },
  occurrenceCount: { type: Number, min: 1, max: 100, default: null },
}, { _id: false });

export const EventSeriesSchema = new Schema<IEventSeries>({
  organisationId: { type: Schema.Types.ObjectId, required: true },
  createdBy: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  eventType: { type: String, enum: ['PHYSICAL', 'VIRTUAL', 'HYBRID'], required: true },
  location: { type: EventLocationSchema, default: null },
  onlineUrl: { type: String, default: null },
  region: { type: String, default: null },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  capacity: { type: Number, default: null },
  imageUrls: [{ type: String }],
  ticketUrl: { type: String, default: null },
  status: { type: String, default: 'PUBLISHED' },
  recurrence: { type: RecurrenceRuleSchema, required: true },
}, { timestamps: true });

EventSeriesSchema.index({ organisationId: 1, status: 1 });
