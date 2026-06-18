export type EventCategory =
  | 'WORSHIP'
  | 'WELFARE'
  | 'CHARITY'
  | 'COMMUNITY'
  | 'CONFERENCE'
  | 'CULTURAL'
  | 'YOUTH';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'PAST';

export type RsvpStage = 'INTERESTED' | 'SAVED' | 'CONFIRMED';

export interface IEventLocation {
  type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  address?: string;
  city?: string;
  country?: string;
  virtualLink?: string;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: Date;
  endDate?: Date;
  location: IEventLocation;
  hostOrganisationIds: string[];
  region: string;
  rsvpCount: number;
  capacityLimit?: number;
  status: EventStatus;
  imageUrl?: string;
  isPromoted: boolean;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRsvp {
  _id: string;
  eventId: string;
  userId: string;
  stage: RsvpStage;
  createdAt: Date;
  updatedAt: Date;
}
