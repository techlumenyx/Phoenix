/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export enum ApplicationStatus {
  Hired = 'HIRED',
  Rejected = 'REJECTED',
  Shortlisted = 'SHORTLISTED',
  Submitted = 'SUBMITTED',
  UnderReview = 'UNDER_REVIEW',
  Withdrawn = 'WITHDRAWN'
}

export type AuditLog = {
  __typename?: 'AuditLog';
  action: ModerationAction;
  admin: User;
  contentId: Scalars['String']['output'];
  contentType: ContentType;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  reason: Scalars['String']['output'];
};

export type AuditLogConnection = {
  __typename?: 'AuditLogConnection';
  edges: Array<AuditLog>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export enum ContentType {
  Event = 'EVENT',
  JobListing = 'JOB_LISTING',
  MarketplaceItem = 'MARKETPLACE_ITEM',
  Organisation = 'ORGANISATION',
  User = 'USER'
}

export type ConvertedPrice = {
  __typename?: 'ConvertedPrice';
  converted: Scalars['Float']['output'];
  isEstimate: Scalars['Boolean']['output'];
  original: Scalars['Float']['output'];
  originalCurrency: Scalars['String']['output'];
  toCurrency: Scalars['String']['output'];
};

export type CreateEventInput = {
  capacityLimit?: InputMaybe<Scalars['Int']['input']>;
  category: EventCategory;
  date: Scalars['DateTime']['input'];
  description: Scalars['String']['input'];
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  externalTicketUrl?: InputMaybe<Scalars['String']['input']>;
  hostOrganisationIds: Array<Scalars['ID']['input']>;
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  isRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  location: EventLocationInput;
  region: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateFlagRuleInput = {
  condition: Scalars['String']['input'];
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateJobListingInput = {
  applicationDeadline: Scalars['DateTime']['input'];
  description: Scalars['String']['input'];
  externalApplyUrl?: InputMaybe<Scalars['String']['input']>;
  faithAlignmentTag?: InputMaybe<FaithAlignmentTag>;
  organisationId: Scalars['ID']['input'];
  region: Scalars['String']['input'];
  roleType: RoleType;
  salaryRange?: InputMaybe<SalaryRangeInput>;
  skillsRequired: Array<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  workLocation: WorkLocation;
};

export type CreateMarketplaceItemInput = {
  area?: InputMaybe<Scalars['String']['input']>;
  category: MarketplaceCategory;
  condition: ItemCondition;
  currency: Scalars['String']['input'];
  description: Scalars['String']['input'];
  imageUrls: Array<Scalars['String']['input']>;
  isDonation: Scalars['Boolean']['input'];
  price: Scalars['Float']['input'];
  region: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateOrganisationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  region?: InputMaybe<Scalars['String']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserInput = {
  name: Scalars['String']['input'];
};

export type Event = {
  __typename?: 'Event';
  capacityLimit?: Maybe<Scalars['Int']['output']>;
  category: EventCategory;
  confirmedCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  endDate?: Maybe<Scalars['DateTime']['output']>;
  externalTicketUrl?: Maybe<Scalars['String']['output']>;
  hosts: Array<Organisation>;
  id: Scalars['ID']['output'];
  imageUrls: Array<Scalars['String']['output']>;
  interestedCount: Scalars['Int']['output'];
  isPromoted: Scalars['Boolean']['output'];
  isRecurring: Scalars['Boolean']['output'];
  location: EventLocation;
  region: Scalars['String']['output'];
  rsvpCount: Scalars['Int']['output'];
  savedCount: Scalars['Int']['output'];
  seriesId?: Maybe<Scalars['String']['output']>;
  status: EventStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  waitlistCount: Scalars['Int']['output'];
};

export enum EventCategory {
  BibleStudy = 'BIBLE_STUDY',
  Charity = 'CHARITY',
  Community = 'COMMUNITY',
  Conference = 'CONFERENCE',
  Cultural = 'CULTURAL',
  Music = 'MUSIC',
  Other = 'OTHER',
  Welfare = 'WELFARE',
  Worship = 'WORSHIP',
  Youth = 'YOUTH'
}

export type EventConnection = {
  __typename?: 'EventConnection';
  edges: Array<Event>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type EventLocation = {
  __typename?: 'EventLocation';
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  type: LocationType;
  virtualLink?: Maybe<Scalars['String']['output']>;
};

export type EventLocationInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  type: LocationType;
  virtualLink?: InputMaybe<Scalars['String']['input']>;
};

export enum EventStatus {
  Cancelled = 'CANCELLED',
  Draft = 'DRAFT',
  Past = 'PAST',
  Published = 'PUBLISHED'
}

export enum FaithAlignmentTag {
  FaithBackgroundPreferred = 'FAITH_BACKGROUND_PREFERRED',
  OpenToAll = 'OPEN_TO_ALL'
}

export type FollowRelationship = {
  __typename?: 'FollowRelationship';
  createdAt: Scalars['DateTime']['output'];
  follower: User;
  id: Scalars['ID']['output'];
  organisation: Organisation;
};

export enum ItemCondition {
  Fair = 'FAIR',
  Good = 'GOOD',
  LikeNew = 'LIKE_NEW',
  New = 'NEW'
}

export type JobApplication = {
  __typename?: 'JobApplication';
  applicant: User;
  createdAt: Scalars['DateTime']['output'];
  cvUrl?: Maybe<Scalars['String']['output']>;
  experience?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  listing: JobListing;
  resumeUrl?: Maybe<Scalars['String']['output']>;
  status: ApplicationStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type JobListing = {
  __typename?: 'JobListing';
  applicationDeadline: Scalars['DateTime']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  externalApplyUrl?: Maybe<Scalars['String']['output']>;
  faithAlignmentTag?: Maybe<FaithAlignmentTag>;
  id: Scalars['ID']['output'];
  isPromoted: Scalars['Boolean']['output'];
  organisation: Organisation;
  region: Scalars['String']['output'];
  roleType: RoleType;
  salaryRange?: Maybe<SalaryRange>;
  skillsRequired: Array<Scalars['String']['output']>;
  status: JobStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workLocation: WorkLocation;
};

export type JobListingConnection = {
  __typename?: 'JobListingConnection';
  edges: Array<JobListing>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export enum JobStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Closed = 'CLOSED'
}

export enum ListingStatus {
  Available = 'AVAILABLE',
  PendingReview = 'PENDING_REVIEW',
  Reserved = 'RESERVED',
  Sold = 'SOLD'
}

export enum LocationType {
  Hybrid = 'HYBRID',
  Physical = 'PHYSICAL',
  Virtual = 'VIRTUAL'
}

export enum MarketplaceCategory {
  BabyAndKids = 'BABY_AND_KIDS',
  Books = 'BOOKS',
  CharityItems = 'CHARITY_ITEMS',
  Clothing = 'CLOTHING',
  Electronics = 'ELECTRONICS',
  Food = 'FOOD',
  Furniture = 'FURNITURE',
  Other = 'OTHER'
}

export type MarketplaceItem = {
  __typename?: 'MarketplaceItem';
  area?: Maybe<Scalars['String']['output']>;
  category: MarketplaceCategory;
  condition: ItemCondition;
  convertedPrice?: Maybe<ConvertedPrice>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  description: Scalars['String']['output'];
  flagCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  imageUrls: Array<Scalars['String']['output']>;
  isDonation: Scalars['Boolean']['output'];
  isPromoted: Scalars['Boolean']['output'];
  price: Scalars['Float']['output'];
  region: Scalars['String']['output'];
  seller: User;
  status: ListingStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MarketplaceItemConnection = {
  __typename?: 'MarketplaceItemConnection';
  edges: Array<MarketplaceItem>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export enum ModerationAction {
  Approve = 'APPROVE',
  Ban = 'BAN',
  Remove = 'REMOVE',
  Suspend = 'SUSPEND',
  Warn = 'WARN'
}

export type ModerationReport = {
  __typename?: 'ModerationReport';
  contentId: Scalars['String']['output'];
  contentType: ContentType;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  reason: Scalars['String']['output'];
  reportedByUser: User;
  status: ReportStatus;
};

export type ModerationReportConnection = {
  __typename?: 'ModerationReportConnection';
  edges: Array<ModerationReport>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  archiveJobListing: JobListing;
  cancelRsvp: Scalars['Boolean']['output'];
  createEvent: Event;
  createFlagRule: SystemFlagRule;
  createJobListing: JobListing;
  createMarketplaceItem: MarketplaceItem;
  createOrganisation: Organisation;
  createUser: User;
  deleteEvent: Scalars['Boolean']['output'];
  deleteMarketplaceItem: Scalars['Boolean']['output'];
  flagContent: ModerationReport;
  reportListing: Scalars['Boolean']['output'];
  resolveReport: AuditLog;
  reviewVerification: VerificationQueueItem;
  rsvpToEvent: Rsvp;
  signUp: SignUpPayload;
  submitVerification: VerificationRequest;
  updateEvent: Event;
  updateFlagRule: SystemFlagRule;
  updateJobListing: JobListing;
  updateMarketplaceItem: MarketplaceItem;
  updateMarketplaceItemStatus: MarketplaceItem;
  updateOrganisation: Organisation;
  updateProfile: User;
};


export type MutationArchiveJobListingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCancelRsvpArgs = {
  eventId: Scalars['ID']['input'];
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateFlagRuleArgs = {
  input: CreateFlagRuleInput;
};


export type MutationCreateJobListingArgs = {
  input: CreateJobListingInput;
};


export type MutationCreateMarketplaceItemArgs = {
  input: CreateMarketplaceItemInput;
};


export type MutationCreateOrganisationArgs = {
  input: CreateOrganisationInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMarketplaceItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationFlagContentArgs = {
  contentId: Scalars['String']['input'];
  contentType: ContentType;
  reason: Scalars['String']['input'];
};


export type MutationReportListingArgs = {
  itemId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationResolveReportArgs = {
  action: ModerationAction;
  reason: Scalars['String']['input'];
  reportId: Scalars['ID']['input'];
};


export type MutationReviewVerificationArgs = {
  approved: Scalars['Boolean']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
  requestId: Scalars['ID']['input'];
};


export type MutationRsvpToEventArgs = {
  eventId: Scalars['ID']['input'];
  stage: RsvpStage;
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationSubmitVerificationArgs = {
  documentUrls: Array<Scalars['String']['input']>;
  organisationId: Scalars['ID']['input'];
};


export type MutationUpdateEventArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEventInput;
};


export type MutationUpdateFlagRuleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFlagRuleInput;
};


export type MutationUpdateJobListingArgs = {
  id: Scalars['ID']['input'];
  input: UpdateJobListingInput;
};


export type MutationUpdateMarketplaceItemArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMarketplaceItemInput;
};


export type MutationUpdateMarketplaceItemStatusArgs = {
  id: Scalars['ID']['input'];
  status: ListingStatus;
};


export type MutationUpdateOrganisationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateOrganisationInput;
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type Organisation = {
  __typename?: 'Organisation';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  events: EventConnection;
  followerCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isVerified: Scalars['Boolean']['output'];
  jobListings: Array<JobListing>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  region?: Maybe<Scalars['String']['output']>;
  socialLinks?: Maybe<SocialLinks>;
  updatedAt: Scalars['DateTime']['output'];
  verificationRequests: Array<VerificationQueueItem>;
  verificationTier: VerificationTier;
  websiteUrl?: Maybe<Scalars['String']['output']>;
};


export type OrganisationEventsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type OrganisationConnection = {
  __typename?: 'OrganisationConnection';
  edges: Array<Organisation>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type PlatformStats = {
  __typename?: 'PlatformStats';
  activeEvents: Scalars['Int']['output'];
  activeJobListings: Scalars['Int']['output'];
  activeMarketplaceItems: Scalars['Int']['output'];
  pendingModerationReports: Scalars['Int']['output'];
  pendingVerifications: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  auditLogs: AuditLogConnection;
  communityGives: Array<MarketplaceItem>;
  event?: Maybe<Event>;
  events: EventConnection;
  featuredEvents: Array<Event>;
  flagRules: Array<SystemFlagRule>;
  jobListing?: Maybe<JobListing>;
  jobListings: JobListingConnection;
  marketplaceItem?: Maybe<MarketplaceItem>;
  marketplaceItems: MarketplaceItemConnection;
  me?: Maybe<User>;
  moderationQueue: ModerationReportConnection;
  myOrganisations: Array<Organisation>;
  myRsvps: Array<Rsvp>;
  organisation?: Maybe<Organisation>;
  organisations: OrganisationConnection;
  platformStats: PlatformStats;
  user?: Maybe<User>;
  verificationQueue: Array<VerificationQueueItem>;
};


export type QueryAuditLogsArgs = {
  adminId?: InputMaybe<Scalars['ID']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCommunityGivesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<EventCategory>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  organisationId?: InputMaybe<Scalars['ID']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EventStatus>;
};


export type QueryFeaturedEventsArgs = {
  region?: InputMaybe<Scalars['String']['input']>;
};


export type QueryJobListingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryJobListingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  roleType?: InputMaybe<RoleType>;
  skillTags?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<JobStatus>;
  workLocation?: InputMaybe<WorkLocation>;
};


export type QueryMarketplaceItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMarketplaceItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<MarketplaceCategory>;
  condition?: InputMaybe<ItemCondition>;
  isDonation?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ListingStatus>;
};


export type QueryModerationQueueArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ReportStatus>;
};


export type QueryMyRsvpsArgs = {
  stage?: InputMaybe<RsvpStage>;
};


export type QueryOrganisationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganisationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVerificationQueueArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<VerificationStatus>;
};

export type Rsvp = {
  __typename?: 'RSVP';
  createdAt: Scalars['DateTime']['output'];
  event: Event;
  id: Scalars['ID']['output'];
  stage: RsvpStage;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export enum ReportStatus {
  Pending = 'PENDING',
  Resolved = 'RESOLVED'
}

export enum RoleType {
  Internship = 'INTERNSHIP',
  Paid = 'PAID',
  Volunteer = 'VOLUNTEER'
}

export enum RsvpStage {
  Confirmed = 'CONFIRMED',
  Interested = 'INTERESTED',
  Saved = 'SAVED'
}

export type SalaryRange = {
  __typename?: 'SalaryRange';
  currency: Scalars['String']['output'];
  max: Scalars['Float']['output'];
  min: Scalars['Float']['output'];
};

export type SalaryRangeInput = {
  currency: Scalars['String']['input'];
  max: Scalars['Float']['input'];
  min: Scalars['Float']['input'];
};

export type SignUpInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignUpPayload = {
  __typename?: 'SignUpPayload';
  customToken: Scalars['String']['output'];
};

export type SocialLinks = {
  __typename?: 'SocialLinks';
  facebook?: Maybe<Scalars['String']['output']>;
  instagram?: Maybe<Scalars['String']['output']>;
  twitter?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
  whatsapp?: Maybe<Scalars['String']['output']>;
};

export type SocialLinksInput = {
  facebook?: InputMaybe<Scalars['String']['input']>;
  instagram?: InputMaybe<Scalars['String']['input']>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  whatsapp?: InputMaybe<Scalars['String']['input']>;
};

export type SystemFlagRule = {
  __typename?: 'SystemFlagRule';
  condition: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UpdateEventInput = {
  capacityLimit?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<EventCategory>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  externalTicketUrl?: InputMaybe<Scalars['String']['input']>;
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  location?: InputMaybe<EventLocationInput>;
  status?: InputMaybe<EventStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFlagRuleInput = {
  condition?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateJobListingInput = {
  applicationDeadline?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  externalApplyUrl?: InputMaybe<Scalars['String']['input']>;
  roleType?: InputMaybe<RoleType>;
  salaryRange?: InputMaybe<SalaryRangeInput>;
  skillsRequired?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  workLocation?: InputMaybe<WorkLocation>;
};

export type UpdateMarketplaceItemInput = {
  condition?: InputMaybe<ItemCondition>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  isDonation?: InputMaybe<Scalars['Boolean']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganisationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  socialLinks?: InputMaybe<SocialLinksInput>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfileInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  socialLinks?: InputMaybe<SocialLinksInput>;
};

export type User = {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firebaseUid: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isVerified: Scalars['Boolean']['output'];
  jobApplications: Array<JobApplication>;
  marketplaceListings: Array<MarketplaceItem>;
  name: Scalars['String']['output'];
  region: Scalars['String']['output'];
  savedJobs: Array<JobListing>;
  socialLinks?: Maybe<SocialLinks>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<User>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type VerificationQueueItem = {
  __typename?: 'VerificationQueueItem';
  documentUrls: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  organisation: Organisation;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<User>;
  status: VerificationStatus;
  submittedAt: Scalars['DateTime']['output'];
};

export type VerificationRequest = {
  __typename?: 'VerificationRequest';
  documentsUrls: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  organisation: Organisation;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  status: VerificationStatus;
  submittedAt: Scalars['DateTime']['output'];
};

export enum VerificationStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export enum VerificationTier {
  Charity = 'CHARITY',
  Ngo = 'NGO',
  None = 'NONE',
  Standard = 'STANDARD'
}

export enum WorkLocation {
  Hybrid = 'HYBRID',
  Physical = 'PHYSICAL',
  Remote = 'REMOTE'
}

export type SignUpMutationVariables = Exact<{
  input: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'SignUpPayload', customToken: string } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, firebaseUid: string, email: string, name: string } };

export type CreateOrganisationMutationVariables = Exact<{
  input: CreateOrganisationInput;
}>;


export type CreateOrganisationMutation = { __typename?: 'Mutation', createOrganisation: { __typename?: 'Organisation', id: string, name: string } };

export type MyOrganisationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOrganisationsQuery = { __typename?: 'Query', myOrganisations: Array<{ __typename?: 'Organisation', id: string, name: string }> };


export const SignUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignUpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customToken"}}]}}]}}]} as unknown as DocumentNode<SignUpMutation, SignUpMutationVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firebaseUid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const CreateOrganisationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrganisation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganisationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganisation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateOrganisationMutation, CreateOrganisationMutationVariables>;
export const MyOrganisationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<MyOrganisationsQuery, MyOrganisationsQueryVariables>;