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

export enum AccountAction {
  Reactivate = 'REACTIVATE',
  Suspend = 'SUSPEND',
  Warn = 'WARN'
}

export type Admin = {
  __typename?: 'Admin';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firebaseUid: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  roles: Array<AdminRole>;
  status: AdminStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminDashboardStats = {
  __typename?: 'AdminDashboardStats';
  openModerationCases: Scalars['Int']['output'];
  overdueVerifications: Scalars['Int']['output'];
  pendingVerifications: Scalars['Int']['output'];
  resolvedModerationLast7Days: Scalars['Int']['output'];
  verificationDecisionsLast7Days: Scalars['Int']['output'];
};

export type AdminDirectoryConnection = {
  __typename?: 'AdminDirectoryConnection';
  edges: Array<AdminDirectoryItem>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type AdminDirectoryItem = {
  __typename?: 'AdminDirectoryItem';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  organisationId?: Maybe<Scalars['String']['output']>;
  ownerFirebaseUid?: Maybe<Scalars['String']['output']>;
  privateSummary?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  seriesId?: Maybe<Scalars['String']['output']>;
  sourceId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: DirectoryEntityType;
};

export type AdminNotification = {
  __typename?: 'AdminNotification';
  createdAt: Scalars['DateTime']['output'];
  href?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  type: AdminNotificationType;
};

export enum AdminNotificationType {
  ActionFailed = 'ACTION_FAILED',
  Assignment = 'ASSIGNMENT',
  Escalation = 'ESCALATION',
  Mention = 'MENTION',
  SlaWarning = 'SLA_WARNING'
}

export enum AdminRole {
  Analyst = 'ANALYST',
  Auditor = 'AUDITOR',
  ContentManager = 'CONTENT_MANAGER',
  SuperAdmin = 'SUPER_ADMIN',
  SupportAgent = 'SUPPORT_AGENT',
  TrustSafety = 'TRUST_SAFETY',
  VerificationReviewer = 'VERIFICATION_REVIEWER'
}

export enum AdminStatus {
  Active = 'ACTIVE',
  Disabled = 'DISABLED'
}

export type AdminSystemHealth = {
  __typename?: 'AdminSystemHealth';
  checkedAt: Scalars['DateTime']['output'];
  dependencies: Array<SystemDependency>;
  overallStatus: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type AdminTemplate = {
  __typename?: 'AdminTemplate';
  active: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdByFirebaseUid: Scalars['String']['output'];
  history: Array<AdminTemplate>;
  id: Scalars['ID']['output'];
  internalGuidance?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  locale: Scalars['String']['output'];
  publicMessage: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: AdminTemplateType;
  updatedAt: Scalars['DateTime']['output'];
  version: Scalars['Int']['output'];
};

export enum AdminTemplateType {
  Rejection = 'REJECTION',
  Removal = 'REMOVAL',
  Suspension = 'SUSPENSION',
  Verification = 'VERIFICATION',
  Warning = 'WARNING'
}

export enum ApplicationStatus {
  Hired = 'HIRED',
  Rejected = 'REJECTED',
  Shortlisted = 'SHORTLISTED',
  Submitted = 'SUBMITTED',
  UnderReview = 'UNDER_REVIEW',
  Withdrawn = 'WITHDRAWN'
}

export enum AuditAction {
  AccessDocument = 'ACCESS_DOCUMENT',
  AccessPrivateData = 'ACCESS_PRIVATE_DATA',
  AccountReactivate = 'ACCOUNT_REACTIVATE',
  AccountSuspend = 'ACCOUNT_SUSPEND',
  AccountWarn = 'ACCOUNT_WARN',
  AddNote = 'ADD_NOTE',
  Assign = 'ASSIGN',
  Dismiss = 'DISMISS',
  DownloadAuditExport = 'DOWNLOAD_AUDIT_EXPORT',
  EventCancel = 'EVENT_CANCEL',
  EventRestore = 'EVENT_RESTORE',
  NotificationRead = 'NOTIFICATION_READ',
  PlacementCreate = 'PLACEMENT_CREATE',
  PlacementDuplicate = 'PLACEMENT_DUPLICATE',
  PlacementPause = 'PLACEMENT_PAUSE',
  PlacementReorder = 'PLACEMENT_REORDER',
  PlacementUpdate = 'PLACEMENT_UPDATE',
  Remove = 'REMOVE',
  RequestAuditExport = 'REQUEST_AUDIT_EXPORT',
  SavedViewCreate = 'SAVED_VIEW_CREATE',
  SavedViewDelete = 'SAVED_VIEW_DELETE',
  TemplateActivate = 'TEMPLATE_ACTIVATE',
  TemplateCreate = 'TEMPLATE_CREATE',
  VerificationApprove = 'VERIFICATION_APPROVE',
  VerificationAssign = 'VERIFICATION_ASSIGN',
  VerificationNeedsInformation = 'VERIFICATION_NEEDS_INFORMATION',
  VerificationReject = 'VERIFICATION_REJECT',
  Warn = 'WARN'
}

export type AuditEvent = {
  __typename?: 'AuditEvent';
  action: AuditAction;
  adminFirebaseUid: Scalars['String']['output'];
  adminRoles: Array<Scalars['String']['output']>;
  afterStatus?: Maybe<Scalars['String']['output']>;
  beforeStatus?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  reason: Scalars['String']['output'];
  requestId?: Maybe<Scalars['String']['output']>;
  result: AuditResult;
  route?: Maybe<Scalars['String']['output']>;
  targetId: Scalars['String']['output'];
  targetType: ContentType;
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type AuditEventConnection = {
  __typename?: 'AuditEventConnection';
  edges: Array<AuditEvent>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type AuditExport = {
  __typename?: 'AuditExport';
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  failureReason?: Maybe<Scalars['String']['output']>;
  from: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  requesterEmail: Scalars['String']['output'];
  requesterFirebaseUid: Scalars['String']['output'];
  rowCount: Scalars['Int']['output'];
  status: AuditExportStatus;
  to: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum AuditExportStatus {
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Ready = 'READY'
}

export enum AuditResult {
  Failed = 'FAILED',
  Success = 'SUCCESS'
}

export type CaseNote = {
  __typename?: 'CaseNote';
  authorFirebaseUid: Scalars['String']['output'];
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ClassifiedOrganisationNotification = {
  __typename?: 'ClassifiedOrganisationNotification';
  createdAt: Scalars['DateTime']['output'];
  href?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  sourceId?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export enum ContentType {
  AuditExport = 'AUDIT_EXPORT',
  Event = 'EVENT',
  FeaturedPlacement = 'FEATURED_PLACEMENT',
  Job = 'JOB',
  MarketplaceItem = 'MARKETPLACE_ITEM',
  Organisation = 'ORGANISATION',
  OrganisationVerification = 'ORGANISATION_VERIFICATION',
  SavedView = 'SAVED_VIEW',
  Template = 'TEMPLATE',
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
  recurrence?: InputMaybe<RecurrenceRuleInput>;
  region: Scalars['String']['input'];
  title: Scalars['String']['input'];
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
  organisationId?: InputMaybe<Scalars['ID']['input']>;
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

export enum DirectoryEntityType {
  Event = 'EVENT',
  Job = 'JOB',
  MarketplaceItem = 'MARKETPLACE_ITEM',
  Organisation = 'ORGANISATION',
  User = 'USER'
}

export type EducationEntry = {
  __typename?: 'EducationEntry';
  degreeType?: Maybe<Scalars['String']['output']>;
  highestQualification?: Maybe<Scalars['String']['output']>;
  institutionName?: Maybe<Scalars['String']['output']>;
  marksGrades?: Maybe<Scalars['String']['output']>;
  yearOfCompletion?: Maybe<Scalars['Int']['output']>;
  yearOfEnrollment?: Maybe<Scalars['Int']['output']>;
};

export type EducationEntryInput = {
  degreeType?: InputMaybe<Scalars['String']['input']>;
  highestQualification?: InputMaybe<Scalars['String']['input']>;
  institutionName?: InputMaybe<Scalars['String']['input']>;
  marksGrades?: InputMaybe<Scalars['String']['input']>;
  yearOfCompletion?: InputMaybe<Scalars['Int']['input']>;
  yearOfEnrollment?: InputMaybe<Scalars['Int']['input']>;
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
  isSeriesException: Scalars['Boolean']['output'];
  location: EventLocation;
  mySeriesRsvp?: Maybe<SeriesRsvp>;
  occurrenceNumber?: Maybe<Scalars['Int']['output']>;
  originalDate?: Maybe<Scalars['DateTime']['output']>;
  region: Scalars['String']['output'];
  rsvpCount: Scalars['Int']['output'];
  savedCount: Scalars['Int']['output'];
  series?: Maybe<EventSeries>;
  seriesId?: Maybe<Scalars['String']['output']>;
  status: EventStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  waitlistCount: Scalars['Int']['output'];
};

export enum EventActionScope {
  Occurrence = 'OCCURRENCE',
  Series = 'SERIES'
}

export enum EventAdminAction {
  Cancel = 'CANCEL',
  Restore = 'RESTORE'
}

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

export type EventOrganisationNotification = {
  __typename?: 'EventOrganisationNotification';
  createdAt: Scalars['DateTime']['output'];
  href?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  sourceId?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type EventSeries = {
  __typename?: 'EventSeries';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  occurrences: EventConnection;
  recurrence: RecurrenceRule;
  status: EventStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};


export type EventSeriesOccurrencesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export enum EventSort {
  DateAsc = 'DATE_ASC',
  Newest = 'NEWEST',
  Popular = 'POPULAR'
}

export enum EventStatus {
  Cancelled = 'CANCELLED',
  Draft = 'DRAFT',
  Past = 'PAST',
  Published = 'PUBLISHED'
}

export enum EventUpdateScope {
  EntireSeries = 'ENTIRE_SERIES',
  ThisAndFuture = 'THIS_AND_FUTURE',
  ThisOccurrence = 'THIS_OCCURRENCE'
}

export enum FaithAlignmentTag {
  FaithBackgroundPreferred = 'FAITH_BACKGROUND_PREFERRED',
  OpenToAll = 'OPEN_TO_ALL'
}

export type FeaturedPlacement = {
  __typename?: 'FeaturedPlacement';
  createdAt: Scalars['DateTime']['output'];
  createdByFirebaseUid: Scalars['String']['output'];
  destinationUrl: Scalars['String']['output'];
  endsAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  imageAlt?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  placementSource: PlacementSource;
  rank: Scalars['Int']['output'];
  regions: Array<Scalars['String']['output']>;
  startsAt: Scalars['DateTime']['output'];
  status: PlacementStatus;
  targetId?: Maybe<Scalars['String']['output']>;
  targetType: PlacementTargetType;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedByFirebaseUid: Scalars['String']['output'];
};

export type FeaturedPlacementInput = {
  destinationUrl: Scalars['String']['input'];
  endsAt: Scalars['DateTime']['input'];
  imageAlt?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  placementSource?: InputMaybe<PlacementSource>;
  rank: Scalars['Int']['input'];
  regions: Array<Scalars['String']['input']>;
  startsAt: Scalars['DateTime']['input'];
  targetId?: InputMaybe<Scalars['String']['input']>;
  targetType: PlacementTargetType;
  title: Scalars['String']['input'];
};

export type FollowRelationship = {
  __typename?: 'FollowRelationship';
  createdAt: Scalars['DateTime']['output'];
  follower: User;
  id: Scalars['ID']['output'];
  organisation: Organisation;
};

export type IdentityOrganisationNotification = {
  __typename?: 'IdentityOrganisationNotification';
  createdAt: Scalars['DateTime']['output'];
  href?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  sourceId?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export enum ItemCondition {
  Fair = 'FAIR',
  Good = 'GOOD',
  LikeNew = 'LIKE_NEW',
  New = 'NEW'
}

export type JobApplication = {
  __typename?: 'JobApplication';
  acknowledged: Scalars['Boolean']['output'];
  applicant: User;
  createdAt: Scalars['DateTime']['output'];
  currentSalary?: Maybe<Scalars['String']['output']>;
  cvUrl?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['DateTime']['output']>;
  education: Array<EducationEntry>;
  email: Scalars['String']['output'];
  expectedSalary?: Maybe<Scalars['String']['output']>;
  experience?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  linkedInProfile?: Maybe<Scalars['String']['output']>;
  listing: JobListing;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  portfolioUrl?: Maybe<Scalars['String']['output']>;
  resumeUrl?: Maybe<Scalars['String']['output']>;
  status: ApplicationStatus;
  updatedAt: Scalars['DateTime']['output'];
  yearsOfExperience?: Maybe<Scalars['Float']['output']>;
};

export type JobListing = {
  __typename?: 'JobListing';
  applicationCount: Scalars['Int']['output'];
  applicationDeadline: Scalars['DateTime']['output'];
  certifications?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  educationalRequirement?: Maybe<Scalars['String']['output']>;
  experience?: Maybe<Scalars['String']['output']>;
  externalApplyUrl?: Maybe<Scalars['String']['output']>;
  faithAlignmentTag?: Maybe<FaithAlignmentTag>;
  faithDescription?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPromoted: Scalars['Boolean']['output'];
  keyFaithRequirements: Array<Scalars['String']['output']>;
  organisation: Organisation;
  otherSkills?: Maybe<Scalars['String']['output']>;
  region: Scalars['String']['output'];
  responsibilities: Array<Scalars['String']['output']>;
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

export enum JobSort {
  Deadline = 'DEADLINE',
  Newest = 'NEWEST',
  Popular = 'POPULAR',
  SalaryAsc = 'SALARY_ASC',
  SalaryDesc = 'SALARY_DESC'
}

export enum JobStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Closed = 'CLOSED'
}

export enum ListingStatus {
  Available = 'AVAILABLE',
  PendingReview = 'PENDING_REVIEW',
  Removed = 'REMOVED',
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
  contactInfo?: Maybe<Scalars['String']['output']>;
  convertedPrice?: Maybe<ConvertedPrice>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  description: Scalars['String']['output'];
  dimensions?: Maybe<Scalars['String']['output']>;
  flagCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  imageUrls: Array<Scalars['String']['output']>;
  isDonation: Scalars['Boolean']['output'];
  isPromoted: Scalars['Boolean']['output'];
  maxRetailPrice?: Maybe<Scalars['Float']['output']>;
  otherAttributes?: Maybe<Scalars['String']['output']>;
  price: Scalars['Float']['output'];
  region: Scalars['String']['output'];
  seller: User;
  showContactOnOffer: Scalars['Boolean']['output'];
  status: ListingStatus;
  subCategory?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MarketplaceItemConnection = {
  __typename?: 'MarketplaceItemConnection';
  edges: Array<MarketplaceItem>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export enum MarketplaceSort {
  Newest = 'NEWEST',
  Popular = 'POPULAR',
  PriceAsc = 'PRICE_ASC',
  PriceDesc = 'PRICE_DESC'
}

export type Message = {
  __typename?: 'Message';
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  sender: User;
  thread: MessageThread;
  type: MessageType;
};

export type MessageConnection = {
  __typename?: 'MessageConnection';
  edges: Array<Message>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export enum MessageParticipantRole {
  Buyer = 'BUYER',
  Seller = 'SELLER'
}

export type MessageThread = {
  __typename?: 'MessageThread';
  buyer: User;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lastMessage?: Maybe<Scalars['String']['output']>;
  lastMessageAt?: Maybe<Scalars['DateTime']['output']>;
  listing: MarketplaceItem;
  messages: MessageConnection;
  organisation?: Maybe<Organisation>;
  seller: User;
  status: MessageThreadStatus;
  unreadCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};


export type MessageThreadMessagesArgs = {
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type MessageThreadConnection = {
  __typename?: 'MessageThreadConnection';
  edges: Array<MessageThread>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export enum MessageThreadStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Blocked = 'BLOCKED'
}

export enum MessageType {
  Offer = 'OFFER',
  System = 'SYSTEM',
  Text = 'TEXT'
}

export enum ModerationAction {
  Dismiss = 'DISMISS',
  Remove = 'REMOVE',
  Warn = 'WARN'
}

export type ModerationCase = {
  __typename?: 'ModerationCase';
  assigneeFirebaseUid?: Maybe<Scalars['String']['output']>;
  auditTimeline: Array<AuditEvent>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  notes: Array<CaseNote>;
  organisationId?: Maybe<Scalars['String']['output']>;
  ownerFirebaseUid: Scalars['String']['output'];
  previousStatus?: Maybe<Scalars['String']['output']>;
  priority: ModerationPriority;
  reasonCodes: Array<ReportReasonCode>;
  reportCount: Scalars['Int']['output'];
  reports: Array<ModerationReport>;
  resolutionAction?: Maybe<ModerationAction>;
  resolutionReason?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  resolvedByFirebaseUid?: Maybe<Scalars['String']['output']>;
  status: ModerationCaseStatus;
  targetId: Scalars['String']['output'];
  targetStatus: Scalars['String']['output'];
  targetType: ContentType;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  version: Scalars['Int']['output'];
};

export type ModerationCaseConnection = {
  __typename?: 'ModerationCaseConnection';
  edges: Array<ModerationCase>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export enum ModerationCaseStatus {
  Open = 'OPEN',
  PendingReview = 'PENDING_REVIEW',
  Resolved = 'RESOLVED'
}

export enum ModerationPriority {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Normal = 'NORMAL'
}

export type ModerationReport = {
  __typename?: 'ModerationReport';
  createdAt: Scalars['DateTime']['output'];
  details?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  reasonCode: ReportReasonCode;
  reporterFirebaseUid: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptOrganisationInvite: Organisation;
  accessDirectoryPrivateData: Scalars['String']['output'];
  accessVerificationDocument: Scalars['String']['output'];
  activateAdminTemplate: AdminTemplate;
  addModerationCaseNote: CaseNote;
  applyAccountAction: AdminDirectoryItem;
  applyEventAction: Scalars['Boolean']['output'];
  archiveJobListing: JobListing;
  archiveThread: MessageThread;
  assignModerationCase: ModerationCase;
  assignVerificationSubmission: VerificationSubmission;
  cancelEvent: Scalars['Boolean']['output'];
  cancelRsvp: Scalars['Boolean']['output'];
  cancelSeriesRsvp: Scalars['Boolean']['output'];
  createAdminTemplate: AdminTemplate;
  createEvent: Event;
  createFeaturedPlacement: FeaturedPlacement;
  createJobListing: JobListing;
  createMarketplaceItem: MarketplaceItem;
  createOrganisation: Organisation;
  createUser: User;
  decideVerificationSubmission: VerificationSubmission;
  deleteEvent: Scalars['Boolean']['output'];
  deleteMarketplaceItem: Scalars['Boolean']['output'];
  deleteSavedAdminView: Scalars['Boolean']['output'];
  duplicateFeaturedPlacement: FeaturedPlacement;
  followOrganisation: Organisation;
  inviteOrganisationMember: OrganisationInvite;
  markAdminNotificationRead: AdminNotification;
  markAllAdminNotificationsRead: Scalars['Boolean']['output'];
  markAllClassifiedOrganisationNotificationsRead: Scalars['Boolean']['output'];
  markAllEventOrganisationNotificationsRead: Scalars['Boolean']['output'];
  markAllIdentityOrganisationNotificationsRead: Scalars['Boolean']['output'];
  markClassifiedOrganisationNotificationRead: ClassifiedOrganisationNotification;
  markEventOrganisationNotificationRead: EventOrganisationNotification;
  markIdentityOrganisationNotificationRead: IdentityOrganisationNotification;
  markThreadRead: Scalars['Boolean']['output'];
  pauseFeaturedPlacement: FeaturedPlacement;
  removeOrganisationMember: Scalars['Boolean']['output'];
  reorderFeaturedPlacement: FeaturedPlacement;
  reportListing: Scalars['Boolean']['output'];
  requestAuditExport: AuditExport;
  resendOrganisationInvite: OrganisationInvite;
  resolveModerationCase: ModerationCase;
  revokeOrganisationInvite: OrganisationInvite;
  rsvpToEvent: Rsvp;
  rsvpToSeries: SeriesRsvp;
  saveAdminView: SavedAdminView;
  saveJob: Scalars['Boolean']['output'];
  saveMarketplaceItem: Scalars['Boolean']['output'];
  sendMessage: Message;
  setOrganisationActive: Organisation;
  signUp: SignUpPayload;
  startListingConversation: MessageThread;
  submitJobApplication: JobApplication;
  submitVerification: VerificationRequest;
  unfollowOrganisation: Organisation;
  unsaveJob: Scalars['Boolean']['output'];
  unsaveMarketplaceItem: Scalars['Boolean']['output'];
  updateEvent: Event;
  updateFeaturedPlacement: FeaturedPlacement;
  updateJobApplicationStatus: JobApplication;
  updateJobListing: JobListing;
  updateMarketplaceItem: MarketplaceItem;
  updateMarketplaceItemStatus: MarketplaceItem;
  updateOrganisation: Organisation;
  updateOrganisationMemberRoles: OrganisationTeamMember;
  updateProfile: User;
};


export type MutationAcceptOrganisationInviteArgs = {
  token: Scalars['String']['input'];
};


export type MutationAccessDirectoryPrivateDataArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  type: DirectoryEntityType;
};


export type MutationAccessVerificationDocumentArgs = {
  documentIndex: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
};


export type MutationActivateAdminTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAddModerationCaseNoteArgs = {
  body: Scalars['String']['input'];
  caseId: Scalars['ID']['input'];
};


export type MutationApplyAccountActionArgs = {
  action: AccountAction;
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  type: DirectoryEntityType;
};


export type MutationApplyEventActionArgs = {
  action: EventAdminAction;
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  scope: EventActionScope;
};


export type MutationArchiveJobListingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveThreadArgs = {
  threadId: Scalars['ID']['input'];
};


export type MutationAssignModerationCaseArgs = {
  assigneeFirebaseUid?: InputMaybe<Scalars['String']['input']>;
  expectedVersion: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
};


export type MutationAssignVerificationSubmissionArgs = {
  assigneeFirebaseUid?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationCancelEventArgs = {
  id: Scalars['ID']['input'];
  scope?: InputMaybe<EventUpdateScope>;
};


export type MutationCancelRsvpArgs = {
  eventId: Scalars['ID']['input'];
};


export type MutationCancelSeriesRsvpArgs = {
  seriesId: Scalars['ID']['input'];
};


export type MutationCreateAdminTemplateArgs = {
  internalGuidance?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  publicMessage: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: AdminTemplateType;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateFeaturedPlacementArgs = {
  input: FeaturedPlacementInput;
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


export type MutationDecideVerificationSubmissionArgs = {
  action: VerificationDecision;
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  tier?: InputMaybe<VerificationTier>;
};


export type MutationDeleteEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMarketplaceItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSavedAdminViewArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDuplicateFeaturedPlacementArgs = {
  endsAt: Scalars['DateTime']['input'];
  id: Scalars['ID']['input'];
  rank: Scalars['Int']['input'];
  startsAt: Scalars['DateTime']['input'];
};


export type MutationFollowOrganisationArgs = {
  organisationId: Scalars['ID']['input'];
};


export type MutationInviteOrganisationMemberArgs = {
  email: Scalars['String']['input'];
  organisationId: Scalars['ID']['input'];
  roles: Array<Scalars['String']['input']>;
};


export type MutationMarkAdminNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkAllClassifiedOrganisationNotificationsReadArgs = {
  organisationId: Scalars['ID']['input'];
};


export type MutationMarkAllEventOrganisationNotificationsReadArgs = {
  organisationId: Scalars['ID']['input'];
};


export type MutationMarkAllIdentityOrganisationNotificationsReadArgs = {
  organisationId: Scalars['ID']['input'];
};


export type MutationMarkClassifiedOrganisationNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkEventOrganisationNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkIdentityOrganisationNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkThreadReadArgs = {
  threadId: Scalars['ID']['input'];
};


export type MutationPauseFeaturedPlacementArgs = {
  id: Scalars['ID']['input'];
  paused: Scalars['Boolean']['input'];
};


export type MutationRemoveOrganisationMemberArgs = {
  organisationId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationReorderFeaturedPlacementArgs = {
  id: Scalars['ID']['input'];
  rank: Scalars['Int']['input'];
};


export type MutationReportListingArgs = {
  itemId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRequestAuditExportArgs = {
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
};


export type MutationResendOrganisationInviteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationResolveModerationCaseArgs = {
  action: ModerationAction;
  expectedVersion: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRevokeOrganisationInviteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRsvpToEventArgs = {
  eventId: Scalars['ID']['input'];
  stage: RsvpStage;
};


export type MutationRsvpToSeriesArgs = {
  seriesId: Scalars['ID']['input'];
  stage: RsvpStage;
};


export type MutationSaveAdminViewArgs = {
  filtersJson: Scalars['String']['input'];
  module: SavedViewModule;
  name: Scalars['String']['input'];
};


export type MutationSaveJobArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSaveMarketplaceItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSendMessageArgs = {
  body: Scalars['String']['input'];
  threadId: Scalars['ID']['input'];
};


export type MutationSetOrganisationActiveArgs = {
  active: Scalars['Boolean']['input'];
  organisationId: Scalars['ID']['input'];
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationStartListingConversationArgs = {
  listingId: Scalars['ID']['input'];
  message: Scalars['String']['input'];
};


export type MutationSubmitJobApplicationArgs = {
  input: SubmitJobApplicationInput;
};


export type MutationSubmitVerificationArgs = {
  documentUrls: Array<Scalars['String']['input']>;
  organisationId: Scalars['ID']['input'];
  requestedTier?: InputMaybe<VerificationTier>;
};


export type MutationUnfollowOrganisationArgs = {
  organisationId: Scalars['ID']['input'];
};


export type MutationUnsaveJobArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnsaveMarketplaceItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateEventArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEventInput;
  scope?: InputMaybe<EventUpdateScope>;
};


export type MutationUpdateFeaturedPlacementArgs = {
  id: Scalars['ID']['input'];
  input: FeaturedPlacementInput;
};


export type MutationUpdateJobApplicationStatusArgs = {
  id: Scalars['ID']['input'];
  status: ApplicationStatus;
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


export type MutationUpdateOrganisationMemberRolesArgs = {
  organisationId: Scalars['ID']['input'];
  roles: Array<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type Organisation = {
  __typename?: 'Organisation';
  contactEmail?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deactivatedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  events: EventConnection;
  followerCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  jobListings: Array<JobListing>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  marketplaceListings: Array<MarketplaceItem>;
  name: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  socialLinks?: Maybe<SocialLinks>;
  updatedAt: Scalars['DateTime']['output'];
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

export type OrganisationInvite = {
  __typename?: 'OrganisationInvite';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  organisation: Organisation;
  roles: Array<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type OrganisationTeamMember = {
  __typename?: 'OrganisationTeamMember';
  joinedAt?: Maybe<Scalars['DateTime']['output']>;
  roles: Array<Scalars['String']['output']>;
  user: User;
};

export enum PlacementSource {
  Editorial = 'EDITORIAL',
  Promotion = 'PROMOTION'
}

export enum PlacementStatus {
  Active = 'ACTIVE',
  Expired = 'EXPIRED',
  Paused = 'PAUSED',
  Scheduled = 'SCHEDULED'
}

export enum PlacementTargetType {
  Announcement = 'ANNOUNCEMENT',
  Event = 'EVENT',
  Job = 'JOB',
  MarketplaceItem = 'MARKETPLACE_ITEM',
  Organisation = 'ORGANISATION'
}

export type ProfilePrivacySettings = {
  __typename?: 'ProfilePrivacySettings';
  profileVisibility: ProfileVisibility;
  showAvatar: Scalars['Boolean']['output'];
  showBio: Scalars['Boolean']['output'];
  showRegion: Scalars['Boolean']['output'];
  showSocialLinks: Scalars['Boolean']['output'];
};

export type ProfilePrivacySettingsInput = {
  profileVisibility?: InputMaybe<ProfileVisibility>;
  showAvatar?: InputMaybe<Scalars['Boolean']['input']>;
  showBio?: InputMaybe<Scalars['Boolean']['input']>;
  showRegion?: InputMaybe<Scalars['Boolean']['input']>;
  showSocialLinks?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum ProfileVisibility {
  MembersOnly = 'MEMBERS_ONLY',
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type Query = {
  __typename?: 'Query';
  adminDashboardStats: AdminDashboardStats;
  adminDirectory: AdminDirectoryConnection;
  adminMe?: Maybe<Admin>;
  adminNotificationUnreadCount: Scalars['Int']['output'];
  adminNotifications: Array<AdminNotification>;
  adminSystemHealth: AdminSystemHealth;
  adminTemplates: Array<AdminTemplate>;
  auditEvents: AuditEventConnection;
  auditExportContent: Scalars['String']['output'];
  auditExports: Array<AuditExport>;
  classifiedOrganisationNotifications: Array<ClassifiedOrganisationNotification>;
  classifiedOrganisationUnreadCount: Scalars['Int']['output'];
  communityGives: Array<MarketplaceItem>;
  event?: Maybe<Event>;
  eventOrganisationNotifications: Array<EventOrganisationNotification>;
  eventOrganisationUnreadCount: Scalars['Int']['output'];
  eventSeries?: Maybe<EventSeries>;
  events: EventConnection;
  featuredEvents: Array<Event>;
  featuredPlacements: Array<FeaturedPlacement>;
  identityOrganisationNotifications: Array<IdentityOrganisationNotification>;
  identityOrganisationUnreadCount: Scalars['Int']['output'];
  isFollowingOrganisation: Scalars['Boolean']['output'];
  isJobSaved: Scalars['Boolean']['output'];
  isMarketplaceItemSaved: Scalars['Boolean']['output'];
  jobListing?: Maybe<JobListing>;
  jobListings: JobListingConnection;
  marketplaceItem?: Maybe<MarketplaceItem>;
  marketplaceItems: MarketplaceItemConnection;
  me?: Maybe<User>;
  messageThread?: Maybe<MessageThread>;
  moderationCase?: Maybe<ModerationCase>;
  moderationCases: ModerationCaseConnection;
  myFollowingOrganisations: Array<Organisation>;
  myJobApplication?: Maybe<JobApplication>;
  myMessageThreads: MessageThreadConnection;
  myOrganisations: Array<Organisation>;
  myRsvps: Array<Rsvp>;
  mySavedJobs: Array<JobListing>;
  mySavedMarketplaceItems: Array<MarketplaceItem>;
  mySeriesRsvp?: Maybe<SeriesRsvp>;
  organisation?: Maybe<Organisation>;
  organisationInvite?: Maybe<OrganisationInvite>;
  organisationInvites: Array<OrganisationInvite>;
  organisationJobApplications: Array<JobApplication>;
  organisationTeam: Array<OrganisationTeamMember>;
  organisations: OrganisationConnection;
  savedAdminViews: Array<SavedAdminView>;
  unreadMessageCount: Scalars['Int']['output'];
  user?: Maybe<User>;
  verificationSubmission?: Maybe<VerificationSubmission>;
  verificationSubmissions: VerificationSubmissionConnection;
};


export type QueryAdminDirectoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  type: DirectoryEntityType;
};


export type QueryAdminNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryAdminTemplatesArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<AdminTemplateType>;
};


export type QueryAuditEventsArgs = {
  action?: InputMaybe<AuditAction>;
  adminFirebaseUid?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  caseId?: InputMaybe<Scalars['ID']['input']>;
  from?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  result?: InputMaybe<AuditResult>;
  targetType?: InputMaybe<ContentType>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryAuditExportContentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClassifiedOrganisationNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  organisationId: Scalars['ID']['input'];
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryClassifiedOrganisationUnreadCountArgs = {
  organisationId: Scalars['ID']['input'];
};


export type QueryCommunityGivesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventOrganisationNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  organisationId: Scalars['ID']['input'];
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryEventOrganisationUnreadCountArgs = {
  organisationId: Scalars['ID']['input'];
};


export type QueryEventSeriesArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<EventCategory>;
  collapseSeries?: InputMaybe<Scalars['Boolean']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  locationType?: InputMaybe<LocationType>;
  organisationId?: InputMaybe<Scalars['ID']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<EventSort>;
  status?: InputMaybe<EventStatus>;
  ticketed?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryFeaturedEventsArgs = {
  region?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFeaturedPlacementsArgs = {
  region?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PlacementStatus>;
};


export type QueryIdentityOrganisationNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  organisationId: Scalars['ID']['input'];
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryIdentityOrganisationUnreadCountArgs = {
  organisationId: Scalars['ID']['input'];
};


export type QueryIsFollowingOrganisationArgs = {
  organisationId: Scalars['ID']['input'];
};


export type QueryIsJobSavedArgs = {
  id: Scalars['ID']['input'];
};


export type QueryIsMarketplaceItemSavedArgs = {
  id: Scalars['ID']['input'];
};


export type QueryJobListingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryJobListingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxSalary?: InputMaybe<Scalars['Float']['input']>;
  minSalary?: InputMaybe<Scalars['Float']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  roleType?: InputMaybe<RoleType>;
  search?: InputMaybe<Scalars['String']['input']>;
  skillTags?: InputMaybe<Array<Scalars['String']['input']>>;
  sort?: InputMaybe<JobSort>;
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
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<MarketplaceSort>;
  status?: InputMaybe<ListingStatus>;
  subCategory?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMessageThreadArgs = {
  id: Scalars['ID']['input'];
};


export type QueryModerationCaseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryModerationCasesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  assigneeFirebaseUid?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<ModerationPriority>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ModerationCaseStatus>;
};


export type QueryMyJobApplicationArgs = {
  jobId: Scalars['ID']['input'];
};


export type QueryMyMessageThreadsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<MessageParticipantRole>;
};


export type QueryMyRsvpsArgs = {
  stage?: InputMaybe<RsvpStage>;
};


export type QueryMySeriesRsvpArgs = {
  seriesId: Scalars['ID']['input'];
};


export type QueryOrganisationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganisationInviteArgs = {
  token: Scalars['String']['input'];
};


export type QueryOrganisationInvitesArgs = {
  organisationId: Scalars['ID']['input'];
};


export type QueryOrganisationJobApplicationsArgs = {
  jobId?: InputMaybe<Scalars['ID']['input']>;
  organisationId: Scalars['ID']['input'];
  status?: InputMaybe<ApplicationStatus>;
};


export type QueryOrganisationTeamArgs = {
  organisationId: Scalars['ID']['input'];
};


export type QueryOrganisationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySavedAdminViewsArgs = {
  module?: InputMaybe<SavedViewModule>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVerificationSubmissionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVerificationSubmissionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  assigneeFirebaseUid?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<VerificationReviewStatus>;
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

export enum RecurrenceFrequency {
  Monthly = 'MONTHLY',
  Weekly = 'WEEKLY'
}

export type RecurrenceRule = {
  __typename?: 'RecurrenceRule';
  dayOfMonth?: Maybe<Scalars['Int']['output']>;
  daysOfWeek: Array<Scalars['Int']['output']>;
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  frequency: RecurrenceFrequency;
  interval: Scalars['Int']['output'];
  occurrenceCount?: Maybe<Scalars['Int']['output']>;
  timezone: Scalars['String']['output'];
};

export type RecurrenceRuleInput = {
  dayOfMonth?: InputMaybe<Scalars['Int']['input']>;
  daysOfWeek?: InputMaybe<Array<Scalars['Int']['input']>>;
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  frequency: RecurrenceFrequency;
  interval?: InputMaybe<Scalars['Int']['input']>;
  occurrenceCount?: InputMaybe<Scalars['Int']['input']>;
  timezone: Scalars['String']['input'];
};

export enum ReportReasonCode {
  Duplicate = 'DUPLICATE',
  FraudScam = 'FRAUD_SCAM',
  Inappropriate = 'INAPPROPRIATE',
  Other = 'OTHER',
  ProhibitedUnsafe = 'PROHIBITED_UNSAFE',
  SpamMisleading = 'SPAM_MISLEADING'
}

export enum RoleType {
  Internship = 'INTERNSHIP',
  Paid = 'PAID',
  Volunteer = 'VOLUNTEER'
}

export enum RsvpStage {
  Confirmed = 'CONFIRMED',
  Interested = 'INTERESTED',
  Saved = 'SAVED',
  Waitlisted = 'WAITLISTED'
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

export type SavedAdminView = {
  __typename?: 'SavedAdminView';
  createdAt: Scalars['DateTime']['output'];
  filtersJson: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  module: SavedViewModule;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum SavedViewModule {
  Audit = 'AUDIT',
  Curation = 'CURATION',
  Directory = 'DIRECTORY',
  Moderation = 'MODERATION',
  Verification = 'VERIFICATION'
}

export type SeriesRsvp = {
  __typename?: 'SeriesRSVP';
  createdAt: Scalars['DateTime']['output'];
  excludedEventIds: Array<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  series: EventSeries;
  stage: RsvpStage;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
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

export type SubmitJobApplicationInput = {
  acknowledged: Scalars['Boolean']['input'];
  currentSalary?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  education: Array<EducationEntryInput>;
  email: Scalars['String']['input'];
  expectedSalary?: InputMaybe<Scalars['String']['input']>;
  experienceDescription?: InputMaybe<Scalars['String']['input']>;
  fullName: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  jobId: Scalars['ID']['input'];
  linkedInProfile?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  portfolioUrl?: InputMaybe<Scalars['String']['input']>;
  yearsOfExperience?: InputMaybe<Scalars['Float']['input']>;
};

export type SystemDependency = {
  __typename?: 'SystemDependency';
  category: Scalars['String']['output'];
  checkedAt: Scalars['DateTime']['output'];
  detail: Scalars['String']['output'];
  latencyMs?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
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
  category?: InputMaybe<MarketplaceCategory>;
  condition?: InputMaybe<ItemCondition>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  isDonation?: InputMaybe<Scalars['Boolean']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganisationInput = {
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  socialLinks?: InputMaybe<SocialLinksInput>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfileInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  onboardingCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  preferences?: InputMaybe<Array<Scalars['String']['input']>>;
  privacySettings?: InputMaybe<ProfilePrivacySettingsInput>;
  region?: InputMaybe<Scalars['String']['input']>;
  regionCode?: InputMaybe<Scalars['String']['input']>;
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
  onboardingCompleted: Scalars['Boolean']['output'];
  orgId?: Maybe<Scalars['ID']['output']>;
  preferences: Array<Scalars['String']['output']>;
  privacySettings: ProfilePrivacySettings;
  region: Scalars['String']['output'];
  regionCode?: Maybe<Scalars['String']['output']>;
  roles: Array<Scalars['String']['output']>;
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

export enum VerificationDecision {
  Approve = 'APPROVE',
  NeedsInformation = 'NEEDS_INFORMATION',
  Reject = 'REJECT'
}

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

export enum VerificationReviewStatus {
  Approved = 'APPROVED',
  NeedsInformation = 'NEEDS_INFORMATION',
  PendingReview = 'PENDING_REVIEW',
  Rejected = 'REJECTED'
}

export enum VerificationStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type VerificationSubmission = {
  __typename?: 'VerificationSubmission';
  approvedTier?: Maybe<VerificationTier>;
  assigneeFirebaseUid?: Maybe<Scalars['String']['output']>;
  auditTimeline: Array<AuditEvent>;
  createdAt: Scalars['DateTime']['output'];
  decisionReason?: Maybe<Scalars['String']['output']>;
  documentLabels: Array<Scalars['String']['output']>;
  dueAt: Scalars['DateTime']['output'];
  history: Array<VerificationSubmission>;
  id: Scalars['ID']['output'];
  officialEmail?: Maybe<Scalars['String']['output']>;
  officialName?: Maybe<Scalars['String']['output']>;
  organisationId: Scalars['String']['output'];
  organisationName: Scalars['String']['output'];
  organisationType?: Maybe<Scalars['String']['output']>;
  ownerFirebaseUid: Scalars['String']['output'];
  pocName?: Maybe<Scalars['String']['output']>;
  pocTitle?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  registrationNumber?: Maybe<Scalars['String']['output']>;
  requestedTier: VerificationTier;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedByFirebaseUid?: Maybe<Scalars['String']['output']>;
  status: VerificationReviewStatus;
  updatedAt: Scalars['DateTime']['output'];
  version: Scalars['Int']['output'];
};

export type VerificationSubmissionConnection = {
  __typename?: 'VerificationSubmissionConnection';
  edges: Array<VerificationSubmission>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

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

export type OrganisationSidebarNotificationCountsQueryVariables = Exact<{
  organisationId: Scalars['ID']['input'];
}>;


export type OrganisationSidebarNotificationCountsQuery = { __typename?: 'Query', identityOrganisationUnreadCount: number, eventOrganisationUnreadCount: number, classifiedOrganisationUnreadCount: number };

export type OrganisationRouteAccessQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganisationRouteAccessQuery = { __typename?: 'Query', myOrganisations: Array<{ __typename?: 'Organisation', id: string }> };

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

export type CreateMarketplaceItemMutationVariables = Exact<{
  input: CreateMarketplaceItemInput;
}>;


export type CreateMarketplaceItemMutation = { __typename?: 'Mutation', createMarketplaceItem: { __typename?: 'MarketplaceItem', id: string, title: string, status: ListingStatus } };

export type CreateJobListingMutationVariables = Exact<{
  input: CreateJobListingInput;
}>;


export type CreateJobListingMutation = { __typename?: 'Mutation', createJobListing: { __typename?: 'JobListing', id: string, title: string, status: JobStatus } };

export type CreateEventMutationVariables = Exact<{
  input: CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'Event', id: string, title: string, date: any, status: EventStatus } };

export type UpdateOrganisationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateOrganisationInput;
}>;


export type UpdateOrganisationMutation = { __typename?: 'Mutation', updateOrganisation: { __typename?: 'Organisation', id: string, name: string, description?: string | null, region?: string | null, websiteUrl?: string | null, logoUrl?: string | null, contactEmail?: string | null, phoneNumber?: string | null, isActive: boolean, deactivatedAt?: any | null, socialLinks?: { __typename?: 'SocialLinks', whatsapp?: string | null, instagram?: string | null, facebook?: string | null, twitter?: string | null, website?: string | null } | null } };

export type MyOrgJobListingsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOrgJobListingsQuery = { __typename?: 'Query', myOrganisations: Array<{ __typename?: 'Organisation', id: string, jobListings: Array<{ __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, applicationDeadline: any, status: JobStatus, isPromoted: boolean, faithAlignmentTag?: FaithAlignmentTag | null, createdAt: any }> }> };

export type MyMarketplaceListingsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyMarketplaceListingsQuery = { __typename?: 'Query', myOrganisations: Array<{ __typename?: 'Organisation', id: string, marketplaceListings: Array<{ __typename?: 'MarketplaceItem', id: string, title: string, description: string, category: MarketplaceCategory, price: number, currency: string, condition: ItemCondition, region: string, imageUrls: Array<string>, status: ListingStatus, isDonation: boolean, createdAt: any, updatedAt: any }> }> };

export type SetOrganisationActiveMutationVariables = Exact<{
  organisationId: Scalars['ID']['input'];
  active: Scalars['Boolean']['input'];
}>;


export type SetOrganisationActiveMutation = { __typename?: 'Mutation', setOrganisationActive: { __typename?: 'Organisation', id: string, isActive: boolean, deactivatedAt?: any | null } };

export type UpdateMarketplaceItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateMarketplaceItemInput;
}>;


export type UpdateMarketplaceItemMutation = { __typename?: 'Mutation', updateMarketplaceItem: { __typename?: 'MarketplaceItem', id: string, title: string, description: string, category: MarketplaceCategory, price: number, currency: string, condition: ItemCondition, region: string, imageUrls: Array<string>, status: ListingStatus, isDonation: boolean, createdAt: any, updatedAt: any } };

export type UpdateMarketplaceItemStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: ListingStatus;
}>;


export type UpdateMarketplaceItemStatusMutation = { __typename?: 'Mutation', updateMarketplaceItemStatus: { __typename?: 'MarketplaceItem', id: string, status: ListingStatus, updatedAt: any } };

export type DeleteMarketplaceItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMarketplaceItemMutation = { __typename?: 'Mutation', deleteMarketplaceItem: boolean };

export type MyOrgEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOrgEventsQuery = { __typename?: 'Query', myOrganisations: Array<{ __typename?: 'Organisation', id: string, events: { __typename?: 'EventConnection', edges: Array<{ __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, rsvpCount: number, capacityLimit?: number | null, status: EventStatus, isRecurring: boolean, seriesId?: string | null, occurrenceNumber?: number | null, isSeriesException: boolean, location: { __typename?: 'EventLocation', type: LocationType, city?: string | null, country?: string | null }, series?: { __typename?: 'EventSeries', recurrence: { __typename?: 'RecurrenceRule', frequency: RecurrenceFrequency, interval: number, daysOfWeek: Array<number>, dayOfMonth?: number | null, timezone: string, endsAt?: any | null, occurrenceCount?: number | null } } | null }> } }> };

export type CancelManagedEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  scope: EventUpdateScope;
}>;


export type CancelManagedEventMutation = { __typename?: 'Mutation', cancelEvent: boolean };

export type UpdateManagedEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  scope: EventUpdateScope;
  input: UpdateEventInput;
}>;


export type UpdateManagedEventMutation = { __typename?: 'Mutation', updateEvent: { __typename?: 'Event', id: string, title: string, description: string, date: any, status: EventStatus, isSeriesException: boolean } };

export type MyOrganisationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOrganisationsQuery = { __typename?: 'Query', myOrganisations: Array<{ __typename?: 'Organisation', id: string, name: string, description?: string | null, logoUrl?: string | null, websiteUrl?: string | null, contactEmail?: string | null, phoneNumber?: string | null, isActive: boolean, deactivatedAt?: any | null, region?: string | null, isVerified: boolean, followerCount: number, socialLinks?: { __typename?: 'SocialLinks', whatsapp?: string | null, instagram?: string | null, facebook?: string | null, twitter?: string | null, website?: string | null } | null }> };

export type DiscoveryQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  hasRegion: Scalars['Boolean']['input'];
}>;


export type DiscoveryQuery = { __typename?: 'Query', regionalEvents?: { __typename?: 'EventConnection', edges: Array<{ __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, region: string, rsvpCount: number, imageUrls: Array<string>, location: { __typename?: 'EventLocation', city?: string | null, country?: string | null, type: LocationType } }> }, globalEvents: { __typename?: 'EventConnection', edges: Array<{ __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, region: string, rsvpCount: number, imageUrls: Array<string>, location: { __typename?: 'EventLocation', city?: string | null, country?: string | null, type: LocationType } }> }, regionalJobs?: { __typename?: 'JobListingConnection', edges: Array<{ __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, skillsRequired: Array<string>, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null, organisation: { __typename?: 'Organisation', id: string, name: string, isVerified: boolean } }> }, globalJobs: { __typename?: 'JobListingConnection', edges: Array<{ __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, skillsRequired: Array<string>, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null, organisation: { __typename?: 'Organisation', id: string, name: string, isVerified: boolean } }> }, regionalListings?: { __typename?: 'MarketplaceItemConnection', edges: Array<{ __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, condition: ItemCondition, region: string, area?: string | null, imageUrls: Array<string>, isDonation: boolean }> }, globalListings: { __typename?: 'MarketplaceItemConnection', edges: Array<{ __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, condition: ItemCondition, region: string, area?: string | null, imageUrls: Array<string>, isDonation: boolean }> }, regionalOrganisations?: { __typename?: 'OrganisationConnection', edges: Array<{ __typename?: 'Organisation', id: string, name: string, description?: string | null, region?: string | null, logoUrl?: string | null, isVerified: boolean }> }, globalOrganisations: { __typename?: 'OrganisationConnection', edges: Array<{ __typename?: 'Organisation', id: string, name: string, description?: string | null, region?: string | null, logoUrl?: string | null, isVerified: boolean }> } };

export type GlobalSearchQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  eventAfter?: InputMaybe<Scalars['String']['input']>;
  eventCategory?: InputMaybe<EventCategory>;
  eventDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  jobAfter?: InputMaybe<Scalars['String']['input']>;
  jobRoleType?: InputMaybe<RoleType>;
  jobWorkLocation?: InputMaybe<WorkLocation>;
  listingAfter?: InputMaybe<Scalars['String']['input']>;
  listingCategory?: InputMaybe<MarketplaceCategory>;
  listingCondition?: InputMaybe<ItemCondition>;
  organisationAfter?: InputMaybe<Scalars['String']['input']>;
}>;


export type GlobalSearchQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', hasNextPage: boolean, endCursor?: string | null, edges: Array<{ __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, region: string, rsvpCount: number, imageUrls: Array<string>, location: { __typename?: 'EventLocation', city?: string | null, country?: string | null, type: LocationType } }> }, jobListings: { __typename?: 'JobListingConnection', hasNextPage: boolean, endCursor?: string | null, edges: Array<{ __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, skillsRequired: Array<string>, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null, organisation: { __typename?: 'Organisation', id: string, name: string, isVerified: boolean } }> }, marketplaceItems: { __typename?: 'MarketplaceItemConnection', hasNextPage: boolean, endCursor?: string | null, edges: Array<{ __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, condition: ItemCondition, region: string, area?: string | null, imageUrls: Array<string>, isDonation: boolean, seller: { __typename?: 'User', id: string, isVerified: boolean } }> }, organisations: { __typename?: 'OrganisationConnection', hasNextPage: boolean, endCursor?: string | null, edges: Array<{ __typename?: 'Organisation', id: string, name: string, description?: string | null, region?: string | null, logoUrl?: string | null, isVerified: boolean }> } };

export type HomepageContentQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  hasRegion: Scalars['Boolean']['input'];
  now: Scalars['DateTime']['input'];
  weekEnd: Scalars['DateTime']['input'];
  monthEnd: Scalars['DateTime']['input'];
}>;


export type HomepageContentQuery = { __typename?: 'Query', regionalFeaturedEvents?: Array<(
    { __typename?: 'Event' }
    & { ' $fragmentRefs'?: { 'HomepageEventFragment': HomepageEventFragment } }
  )>, globalFeaturedEvents: Array<(
    { __typename?: 'Event' }
    & { ' $fragmentRefs'?: { 'HomepageEventFragment': HomepageEventFragment } }
  )>, regionalWeeklyEvents?: { __typename?: 'EventConnection', edges: Array<(
      { __typename?: 'Event' }
      & { ' $fragmentRefs'?: { 'HomepageEventFragment': HomepageEventFragment } }
    )> }, globalWeeklyEvents: { __typename?: 'EventConnection', edges: Array<(
      { __typename?: 'Event' }
      & { ' $fragmentRefs'?: { 'HomepageEventFragment': HomepageEventFragment } }
    )> }, regionalUpcomingEvents?: { __typename?: 'EventConnection', edges: Array<(
      { __typename?: 'Event' }
      & { ' $fragmentRefs'?: { 'HomepageEventFragment': HomepageEventFragment } }
    )> }, globalUpcomingEvents: { __typename?: 'EventConnection', edges: Array<(
      { __typename?: 'Event' }
      & { ' $fragmentRefs'?: { 'HomepageEventFragment': HomepageEventFragment } }
    )> }, regionalJobs?: { __typename?: 'JobListingConnection', edges: Array<(
      { __typename?: 'JobListing' }
      & { ' $fragmentRefs'?: { 'HomepageJobFragment': HomepageJobFragment } }
    )> }, globalJobs: { __typename?: 'JobListingConnection', edges: Array<(
      { __typename?: 'JobListing' }
      & { ' $fragmentRefs'?: { 'HomepageJobFragment': HomepageJobFragment } }
    )> }, regionalListings?: { __typename?: 'MarketplaceItemConnection', edges: Array<(
      { __typename?: 'MarketplaceItem' }
      & { ' $fragmentRefs'?: { 'HomepageListingFragment': HomepageListingFragment } }
    )> }, globalListings: { __typename?: 'MarketplaceItemConnection', edges: Array<(
      { __typename?: 'MarketplaceItem' }
      & { ' $fragmentRefs'?: { 'HomepageListingFragment': HomepageListingFragment } }
    )> } };

export type HomepageEventFragment = { __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, endDate?: any | null, region: string, rsvpCount: number, imageUrls: Array<string>, isPromoted: boolean, location: { __typename?: 'EventLocation', type: LocationType, city?: string | null, country?: string | null }, hosts: Array<{ __typename?: 'Organisation', id: string, name: string, isVerified: boolean }> } & { ' $fragmentName'?: 'HomepageEventFragment' };

export type HomepageJobFragment = { __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, isPromoted: boolean, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null, organisation: { __typename?: 'Organisation', id: string, name: string, isVerified: boolean } } & { ' $fragmentName'?: 'HomepageJobFragment' };

export type HomepageListingFragment = { __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, condition: ItemCondition, region: string, area?: string | null, imageUrls: Array<string>, isDonation: boolean, isPromoted: boolean } & { ' $fragmentName'?: 'HomepageListingFragment' };

export type AllEventsDirectoryQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<EventCategory>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  locationType?: InputMaybe<LocationType>;
  ticketed?: InputMaybe<Scalars['Boolean']['input']>;
  sort?: InputMaybe<EventSort>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type AllEventsDirectoryQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', hasNextPage: boolean, endCursor?: string | null, edges: Array<{ __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, region: string, rsvpCount: number, imageUrls: Array<string>, isPromoted: boolean, location: { __typename?: 'EventLocation', type: LocationType, city?: string | null, country?: string | null } }> } };

export type AllJobsDirectoryQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  roleType?: InputMaybe<RoleType>;
  workLocation?: InputMaybe<WorkLocation>;
  skillTags?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  minSalary?: InputMaybe<Scalars['Float']['input']>;
  maxSalary?: InputMaybe<Scalars['Float']['input']>;
  sort?: InputMaybe<JobSort>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type AllJobsDirectoryQuery = { __typename?: 'Query', jobListings: { __typename?: 'JobListingConnection', hasNextPage: boolean, endCursor?: string | null, edges: Array<{ __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, skillsRequired: Array<string>, applicationDeadline: any, isPromoted: boolean, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null, organisation: { __typename?: 'Organisation', id: string, name: string, isVerified: boolean } }> } };

export type AllMarketplaceListingsQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<MarketplaceCategory>;
  condition?: InputMaybe<ItemCondition>;
  subCategory?: InputMaybe<Scalars['String']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  isDonation?: InputMaybe<Scalars['Boolean']['input']>;
  sort?: InputMaybe<MarketplaceSort>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type AllMarketplaceListingsQuery = { __typename?: 'Query', marketplaceItems: { __typename?: 'MarketplaceItemConnection', hasNextPage: boolean, endCursor?: string | null, edges: Array<{ __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, condition: ItemCondition, category: MarketplaceCategory, region: string, imageUrls: Array<string>, isDonation: boolean, isPromoted: boolean, seller: { __typename?: 'User', id: string, isVerified: boolean } }> } };

export type EventDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type EventDetailsQuery = { __typename?: 'Query', event?: { __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, endDate?: any | null, region: string, rsvpCount: number, interestedCount: number, savedCount: number, confirmedCount: number, capacityLimit?: number | null, waitlistCount: number, status: EventStatus, imageUrls: Array<string>, isPromoted: boolean, externalTicketUrl?: string | null, isRecurring: boolean, seriesId?: string | null, occurrenceNumber?: number | null, isSeriesException: boolean, location: { __typename?: 'EventLocation', type: LocationType, address?: string | null, city?: string | null, country?: string | null, virtualLink?: string | null }, hosts: Array<{ __typename?: 'Organisation', id: string, name: string, description?: string | null, logoUrl?: string | null, region?: string | null, isVerified: boolean, verificationTier: VerificationTier, websiteUrl?: string | null }>, mySeriesRsvp?: { __typename?: 'SeriesRSVP', id: string, stage: RsvpStage } | null, series?: { __typename?: 'EventSeries', id: string, recurrence: { __typename?: 'RecurrenceRule', frequency: RecurrenceFrequency, interval: number, daysOfWeek: Array<number>, dayOfMonth?: number | null, timezone: string, endsAt?: any | null, occurrenceCount?: number | null }, occurrences: { __typename?: 'EventConnection', edges: Array<{ __typename?: 'Event', id: string, date: any, status: EventStatus, rsvpCount: number, capacityLimit?: number | null }> } } | null } | null, relatedEvents: { __typename?: 'EventConnection', edges: Array<{ __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, region: string, rsvpCount: number, imageUrls: Array<string>, location: { __typename?: 'EventLocation', city?: string | null, country?: string | null, type: LocationType } }> }, myRsvps: Array<{ __typename?: 'RSVP', id: string, stage: RsvpStage, event: { __typename?: 'Event', id: string } }> };

export type EventDetailsRsvpMutationVariables = Exact<{
  eventId: Scalars['ID']['input'];
  stage: RsvpStage;
}>;


export type EventDetailsRsvpMutation = { __typename?: 'Mutation', rsvpToEvent: { __typename?: 'RSVP', id: string, stage: RsvpStage } };

export type EventDetailsCancelRsvpMutationVariables = Exact<{
  eventId: Scalars['ID']['input'];
}>;


export type EventDetailsCancelRsvpMutation = { __typename?: 'Mutation', cancelRsvp: boolean };

export type EventDetailsSeriesRsvpMutationVariables = Exact<{
  seriesId: Scalars['ID']['input'];
  stage: RsvpStage;
}>;


export type EventDetailsSeriesRsvpMutation = { __typename?: 'Mutation', rsvpToSeries: { __typename?: 'SeriesRSVP', id: string, stage: RsvpStage } };

export type EventDetailsCancelSeriesRsvpMutationVariables = Exact<{
  seriesId: Scalars['ID']['input'];
}>;


export type EventDetailsCancelSeriesRsvpMutation = { __typename?: 'Mutation', cancelSeriesRsvp: boolean };

export type EventsHomeQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  hasRegion: Scalars['Boolean']['input'];
}>;


export type EventsHomeQuery = { __typename?: 'Query', regionalTrending?: { __typename?: 'EventConnection', edges: Array<(
      { __typename?: 'Event' }
      & { ' $fragmentRefs'?: { 'HomeEventFragment': HomeEventFragment } }
    )> }, globalTrending: { __typename?: 'EventConnection', edges: Array<(
      { __typename?: 'Event' }
      & { ' $fragmentRefs'?: { 'HomeEventFragment': HomeEventFragment } }
    )> }, regionalUpcoming?: { __typename?: 'EventConnection', edges: Array<(
      { __typename?: 'Event' }
      & { ' $fragmentRefs'?: { 'HomeEventFragment': HomeEventFragment } }
    )> }, globalUpcoming: { __typename?: 'EventConnection', edges: Array<(
      { __typename?: 'Event' }
      & { ' $fragmentRefs'?: { 'HomeEventFragment': HomeEventFragment } }
    )> } };

export type HomeEventFragment = { __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, region: string, rsvpCount: number, imageUrls: Array<string>, isPromoted: boolean, location: { __typename?: 'EventLocation', type: LocationType, city?: string | null, country?: string | null } } & { ' $fragmentName'?: 'HomeEventFragment' };

export type MyFollowingHubQueryVariables = Exact<{ [key: string]: never; }>;


export type MyFollowingHubQuery = { __typename?: 'Query', myFollowingOrganisations: Array<{ __typename?: 'Organisation', id: string, name: string, description?: string | null, logoUrl?: string | null, region?: string | null, isVerified: boolean, followerCount: number, events: { __typename?: 'EventConnection', edges: Array<{ __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, region: string, rsvpCount: number, imageUrls: Array<string>, status: EventStatus }> }, jobListings: Array<{ __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, status: JobStatus, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null }>, marketplaceListings: Array<{ __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, region: string, imageUrls: Array<string>, status: ListingStatus, isDonation: boolean }> }> };

export type JobApplicationContextQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type JobApplicationContextQuery = { __typename?: 'Query', jobListing?: { __typename?: 'JobListing', id: string, title: string, status: JobStatus, applicationDeadline: any, organisation: { __typename?: 'Organisation', id: string, name: string } } | null, myJobApplication?: { __typename?: 'JobApplication', id: string, status: ApplicationStatus, createdAt: any } | null };

export type SubmitInternalJobApplicationMutationVariables = Exact<{
  input: SubmitJobApplicationInput;
}>;


export type SubmitInternalJobApplicationMutation = { __typename?: 'Mutation', submitJobApplication: { __typename?: 'JobApplication', id: string, status: ApplicationStatus, createdAt: any } };

export type JobDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type JobDetailsQuery = { __typename?: 'Query', jobListing?: { __typename?: 'JobListing', id: string, title: string, description: string, roleType: RoleType, workLocation: WorkLocation, skillsRequired: Array<string>, region: string, applicationDeadline: any, externalApplyUrl?: string | null, status: JobStatus, faithAlignmentTag?: FaithAlignmentTag | null, responsibilities: Array<string>, educationalRequirement?: string | null, experience?: string | null, certifications?: string | null, otherSkills?: string | null, faithDescription?: string | null, keyFaithRequirements: Array<string>, applicationCount: number, createdAt: any, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null, organisation: { __typename?: 'Organisation', id: string, name: string, isVerified: boolean, description?: string | null, logoUrl?: string | null, region?: string | null, verificationTier: VerificationTier, websiteUrl?: string | null } } | null };

export type JobSavedStateQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type JobSavedStateQuery = { __typename?: 'Query', isJobSaved: boolean };

export type SaveJobDetailsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SaveJobDetailsMutation = { __typename?: 'Mutation', saveJob: boolean };

export type UnsaveJobDetailsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnsaveJobDetailsMutation = { __typename?: 'Mutation', unsaveJob: boolean };

export type JobsHomeQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  hasRegion: Scalars['Boolean']['input'];
}>;


export type JobsHomeQuery = { __typename?: 'Query', regionalTrending?: { __typename?: 'JobListingConnection', edges: Array<(
      { __typename?: 'JobListing' }
      & { ' $fragmentRefs'?: { 'HomeJobFragment': HomeJobFragment } }
    )> }, globalTrending: { __typename?: 'JobListingConnection', edges: Array<(
      { __typename?: 'JobListing' }
      & { ' $fragmentRefs'?: { 'HomeJobFragment': HomeJobFragment } }
    )> }, regionalNewest?: { __typename?: 'JobListingConnection', edges: Array<(
      { __typename?: 'JobListing' }
      & { ' $fragmentRefs'?: { 'HomeJobFragment': HomeJobFragment } }
    )> }, globalNewest: { __typename?: 'JobListingConnection', edges: Array<(
      { __typename?: 'JobListing' }
      & { ' $fragmentRefs'?: { 'HomeJobFragment': HomeJobFragment } }
    )> }, regionalVolunteering?: { __typename?: 'JobListingConnection', edges: Array<(
      { __typename?: 'JobListing' }
      & { ' $fragmentRefs'?: { 'HomeJobFragment': HomeJobFragment } }
    )> }, globalVolunteering: { __typename?: 'JobListingConnection', edges: Array<(
      { __typename?: 'JobListing' }
      & { ' $fragmentRefs'?: { 'HomeJobFragment': HomeJobFragment } }
    )> } };

export type HomeJobFragment = { __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, skillsRequired: Array<string>, isPromoted: boolean, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null, organisation: { __typename?: 'Organisation', id: string, name: string, isVerified: boolean } } & { ' $fragmentName'?: 'HomeJobFragment' };

export type MarketplaceDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  region?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<MarketplaceCategory>;
}>;


export type MarketplaceDetailsQuery = { __typename?: 'Query', marketplaceItem?: { __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, condition: ItemCondition, category: MarketplaceCategory, area?: string | null, region: string, imageUrls: Array<string>, status: ListingStatus, isDonation: boolean, isPromoted: boolean, flagCount: number, subCategory?: string | null, dimensions?: string | null, otherAttributes?: string | null, maxRetailPrice?: number | null, contactInfo?: string | null, showContactOnOffer: boolean, createdAt: any, seller: { __typename?: 'User', id: string, name: string, avatarUrl?: string | null, bio?: string | null, isVerified: boolean, region: string, socialLinks?: { __typename?: 'SocialLinks', whatsapp?: string | null, instagram?: string | null, facebook?: string | null, website?: string | null } | null } } | null, marketplaceItems: { __typename?: 'MarketplaceItemConnection', edges: Array<{ __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, condition: ItemCondition, region: string, imageUrls: Array<string>, isDonation: boolean, seller: { __typename?: 'User', id: string, isVerified: boolean } }> } };

export type MarketplaceDetailsReportMutationVariables = Exact<{
  itemId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type MarketplaceDetailsReportMutation = { __typename?: 'Mutation', reportListing: boolean };

export type MarketplaceSavedStateQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarketplaceSavedStateQuery = { __typename?: 'Query', isMarketplaceItemSaved: boolean };

export type SaveMarketplaceDetailsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SaveMarketplaceDetailsMutation = { __typename?: 'Mutation', saveMarketplaceItem: boolean };

export type UnsaveMarketplaceDetailsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnsaveMarketplaceDetailsMutation = { __typename?: 'Mutation', unsaveMarketplaceItem: boolean };

export type StartListingConversationMutationVariables = Exact<{
  listingId: Scalars['ID']['input'];
  message: Scalars['String']['input'];
}>;


export type StartListingConversationMutation = { __typename?: 'Mutation', startListingConversation: { __typename?: 'MessageThread', id: string } };

export type MarketplaceHomeQueryVariables = Exact<{
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  hasRegion: Scalars['Boolean']['input'];
}>;


export type MarketplaceHomeQuery = { __typename?: 'Query', regionalPromoted?: { __typename?: 'MarketplaceItemConnection', edges: Array<(
      { __typename?: 'MarketplaceItem' }
      & { ' $fragmentRefs'?: { 'HomeListingFragment': HomeListingFragment } }
    )> }, globalPromoted: { __typename?: 'MarketplaceItemConnection', edges: Array<(
      { __typename?: 'MarketplaceItem' }
      & { ' $fragmentRefs'?: { 'HomeListingFragment': HomeListingFragment } }
    )> }, regionalNewest?: { __typename?: 'MarketplaceItemConnection', edges: Array<(
      { __typename?: 'MarketplaceItem' }
      & { ' $fragmentRefs'?: { 'HomeListingFragment': HomeListingFragment } }
    )> }, globalNewest: { __typename?: 'MarketplaceItemConnection', edges: Array<(
      { __typename?: 'MarketplaceItem' }
      & { ' $fragmentRefs'?: { 'HomeListingFragment': HomeListingFragment } }
    )> }, regionalDonations?: { __typename?: 'MarketplaceItemConnection', edges: Array<(
      { __typename?: 'MarketplaceItem' }
      & { ' $fragmentRefs'?: { 'HomeListingFragment': HomeListingFragment } }
    )> }, globalDonations: { __typename?: 'MarketplaceItemConnection', edges: Array<(
      { __typename?: 'MarketplaceItem' }
      & { ' $fragmentRefs'?: { 'HomeListingFragment': HomeListingFragment } }
    )> } };

export type HomeListingFragment = { __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, condition: ItemCondition, category: MarketplaceCategory, region: string, imageUrls: Array<string>, isDonation: boolean, isPromoted: boolean, seller: { __typename?: 'User', id: string, isVerified: boolean } } & { ' $fragmentName'?: 'HomeListingFragment' };

export type MessagingThreadsQueryVariables = Exact<{
  role?: InputMaybe<MessageParticipantRole>;
}>;


export type MessagingThreadsQuery = { __typename?: 'Query', unreadMessageCount: number, myMessageThreads: { __typename?: 'MessageThreadConnection', edges: Array<{ __typename?: 'MessageThread', id: string, status: MessageThreadStatus, lastMessage?: string | null, lastMessageAt?: any | null, unreadCount: number, buyer: { __typename?: 'User', id: string, firebaseUid: string, name: string, avatarUrl?: string | null }, seller: { __typename?: 'User', id: string, firebaseUid: string, name: string, avatarUrl?: string | null }, listing: { __typename?: 'MarketplaceItem', id: string, title: string, imageUrls: Array<string>, status: ListingStatus } }> } };

export type MessagingThreadQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MessagingThreadQuery = { __typename?: 'Query', messageThread?: { __typename?: 'MessageThread', id: string, status: MessageThreadStatus, buyer: { __typename?: 'User', id: string, firebaseUid: string, name: string, avatarUrl?: string | null }, seller: { __typename?: 'User', id: string, firebaseUid: string, name: string, avatarUrl?: string | null }, listing: { __typename?: 'MarketplaceItem', id: string, title: string, imageUrls: Array<string>, status: ListingStatus, price: number, currency: string }, messages: { __typename?: 'MessageConnection', edges: Array<{ __typename?: 'Message', id: string, type: MessageType, body: string, readAt?: any | null, createdAt: any, sender: { __typename?: 'User', id: string, firebaseUid: string, name: string, avatarUrl?: string | null } }> } } | null };

export type SendThreadMessageMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  body: Scalars['String']['input'];
}>;


export type SendThreadMessageMutation = { __typename?: 'Mutation', sendMessage: { __typename?: 'Message', id: string } };

export type ReadThreadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ReadThreadMutation = { __typename?: 'Mutation', markThreadRead: boolean };

export type ArchiveMessageThreadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ArchiveMessageThreadMutation = { __typename?: 'Mutation', archiveThread: { __typename?: 'MessageThread', id: string, status: MessageThreadStatus } };

export type MyApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyApplicationsQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, jobApplications: Array<{ __typename?: 'JobApplication', id: string, status: ApplicationStatus, createdAt: any, updatedAt: any, listing: { __typename?: 'JobListing', id: string, title: string, organisation: { __typename?: 'Organisation', id: string, name: string, isVerified: boolean } } }> } | null };

export type OrganisationInvitationQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type OrganisationInvitationQuery = { __typename?: 'Query', organisationInvite?: { __typename?: 'OrganisationInvite', id: string, email: string, roles: Array<string>, status: string, expiresAt: any, organisation: { __typename?: 'Organisation', id: string, name: string, logoUrl?: string | null } } | null };

export type AcceptOrganisationInvitationMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type AcceptOrganisationInvitationMutation = { __typename?: 'Mutation', acceptOrganisationInvite: { __typename?: 'Organisation', id: string, name: string } };

export type PublicOrganisationProfileQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PublicOrganisationProfileQuery = { __typename?: 'Query', isFollowingOrganisation: boolean, organisation?: { __typename?: 'Organisation', id: string, name: string, description?: string | null, logoUrl?: string | null, region?: string | null, isVerified: boolean, verificationTier: VerificationTier, followerCount: number, websiteUrl?: string | null, contactEmail?: string | null, phoneNumber?: string | null, createdAt: any, socialLinks?: { __typename?: 'SocialLinks', whatsapp?: string | null, instagram?: string | null, facebook?: string | null, twitter?: string | null, website?: string | null } | null, events: { __typename?: 'EventConnection', edges: Array<{ __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, region: string, rsvpCount: number, imageUrls: Array<string>, status: EventStatus }> }, jobListings: Array<{ __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, status: JobStatus, isPromoted: boolean, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null }>, marketplaceListings: Array<{ __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, region: string, imageUrls: Array<string>, status: ListingStatus, isDonation: boolean, isPromoted: boolean }> } | null };

export type FollowPublicOrganisationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FollowPublicOrganisationMutation = { __typename?: 'Mutation', followOrganisation: { __typename?: 'Organisation', id: string, followerCount: number } };

export type UnfollowPublicOrganisationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnfollowPublicOrganisationMutation = { __typename?: 'Mutation', unfollowOrganisation: { __typename?: 'Organisation', id: string, followerCount: number } };

export type EditableMemberProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type EditableMemberProfileQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, name: string, email: string, region: string, bio?: string | null, avatarUrl?: string | null, preferences: Array<string>, socialLinks?: { __typename?: 'SocialLinks', whatsapp?: string | null, instagram?: string | null, facebook?: string | null, twitter?: string | null, website?: string | null } | null, privacySettings: { __typename?: 'ProfilePrivacySettings', profileVisibility: ProfileVisibility, showAvatar: boolean, showRegion: boolean, showBio: boolean, showSocialLinks: boolean } } | null };

export type EditMemberProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type EditMemberProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', id: string, name: string, email: string, region: string, bio?: string | null, avatarUrl?: string | null, preferences: Array<string>, socialLinks?: { __typename?: 'SocialLinks', whatsapp?: string | null, instagram?: string | null, facebook?: string | null, twitter?: string | null, website?: string | null } | null, privacySettings: { __typename?: 'ProfilePrivacySettings', profileVisibility: ProfileVisibility, showAvatar: boolean, showRegion: boolean, showBio: boolean, showSocialLinks: boolean } } };

export type SavedItemsHubQueryVariables = Exact<{ [key: string]: never; }>;


export type SavedItemsHubQuery = { __typename?: 'Query', myRsvps: Array<{ __typename?: 'RSVP', id: string, event: { __typename?: 'Event', id: string, title: string, description: string, category: EventCategory, date: any, region: string, rsvpCount: number, imageUrls: Array<string>, hosts: Array<{ __typename?: 'Organisation', isVerified: boolean }> } }>, mySavedJobs: Array<{ __typename?: 'JobListing', id: string, title: string, roleType: RoleType, workLocation: WorkLocation, region: string, salaryRange?: { __typename?: 'SalaryRange', min: number, max: number, currency: string } | null, organisation: { __typename?: 'Organisation', name: string, isVerified: boolean } }>, mySavedMarketplaceItems: Array<{ __typename?: 'MarketplaceItem', id: string, title: string, description: string, price: number, currency: string, region: string, imageUrls: Array<string>, isDonation: boolean, seller: { __typename?: 'User', isVerified: boolean } }> };

export type RemoveSavedEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemoveSavedEventMutation = { __typename?: 'Mutation', cancelRsvp: boolean };

export type RemoveSavedJobMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemoveSavedJobMutation = { __typename?: 'Mutation', unsaveJob: boolean };

export type RemoveSavedMarketplaceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemoveSavedMarketplaceMutation = { __typename?: 'Mutation', unsaveMarketplaceItem: boolean };

export type UpdatePreferencesProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdatePreferencesProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', id: string, preferences: Array<string>, onboardingCompleted: boolean } };

export type UpdateRegionProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateRegionProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', id: string, region: string } };

export type SubmitVerificationMutationVariables = Exact<{
  organisationId: Scalars['ID']['input'];
  documentUrls: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type SubmitVerificationMutation = { __typename?: 'Mutation', submitVerification: { __typename?: 'VerificationRequest', id: string, status: VerificationStatus } };

export type OrganisationApplicationsInboxQueryVariables = Exact<{
  organisationId: Scalars['ID']['input'];
}>;


export type OrganisationApplicationsInboxQuery = { __typename?: 'Query', organisationJobApplications: Array<{ __typename?: 'JobApplication', id: string, status: ApplicationStatus, fullName: string, email: string, phoneNumber?: string | null, gender?: string | null, dateOfBirth?: any | null, experience?: string | null, yearsOfExperience?: number | null, currentSalary?: string | null, expectedSalary?: string | null, portfolioUrl?: string | null, linkedInProfile?: string | null, createdAt: any, education: Array<{ __typename?: 'EducationEntry', highestQualification?: string | null, institutionName?: string | null, yearOfEnrollment?: number | null, yearOfCompletion?: number | null, marksGrades?: string | null, degreeType?: string | null }>, listing: { __typename?: 'JobListing', id: string, title: string } }> };

export type UpdateOrganisationApplicationStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: ApplicationStatus;
}>;


export type UpdateOrganisationApplicationStatusMutation = { __typename?: 'Mutation', updateJobApplicationStatus: { __typename?: 'JobApplication', id: string, status: ApplicationStatus } };

export type OrganisationNotificationsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganisationNotificationsQuery = { __typename?: 'Query', myOrganisations: Array<{ __typename?: 'Organisation', id: string, name: string }> };

export type ApplicationNotificationsQueryVariables = Exact<{
  organisationId: Scalars['ID']['input'];
}>;


export type ApplicationNotificationsQuery = { __typename?: 'Query', organisationJobApplications: Array<{ __typename?: 'JobApplication', id: string, fullName: string, status: ApplicationStatus, createdAt: any, listing: { __typename?: 'JobListing', id: string, title: string } }> };

export type OrganisationNotificationCentreQueryVariables = Exact<{
  organisationId: Scalars['ID']['input'];
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrganisationNotificationCentreQuery = { __typename?: 'Query', identityOrganisationUnreadCount: number, eventOrganisationUnreadCount: number, classifiedOrganisationUnreadCount: number, identityOrganisationNotifications: Array<{ __typename?: 'IdentityOrganisationNotification', id: string, type: string, title: string, message: string, href?: string | null, sourceId?: string | null, readAt?: any | null, createdAt: any }>, eventOrganisationNotifications: Array<{ __typename?: 'EventOrganisationNotification', id: string, type: string, title: string, message: string, href?: string | null, sourceId?: string | null, readAt?: any | null, createdAt: any }>, classifiedOrganisationNotifications: Array<{ __typename?: 'ClassifiedOrganisationNotification', id: string, type: string, title: string, message: string, href?: string | null, sourceId?: string | null, readAt?: any | null, createdAt: any }> };

export type MarkIdentityNotificationReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkIdentityNotificationReadMutation = { __typename?: 'Mutation', markIdentityOrganisationNotificationRead: { __typename?: 'IdentityOrganisationNotification', id: string, readAt?: any | null } };

export type MarkEventNotificationReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkEventNotificationReadMutation = { __typename?: 'Mutation', markEventOrganisationNotificationRead: { __typename?: 'EventOrganisationNotification', id: string, readAt?: any | null } };

export type MarkClassifiedNotificationReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkClassifiedNotificationReadMutation = { __typename?: 'Mutation', markClassifiedOrganisationNotificationRead: { __typename?: 'ClassifiedOrganisationNotification', id: string, readAt?: any | null } };

export type MarkAllOrganisationNotificationsReadMutationVariables = Exact<{
  organisationId: Scalars['ID']['input'];
}>;


export type MarkAllOrganisationNotificationsReadMutation = { __typename?: 'Mutation', identity: boolean, events: boolean, classified: boolean };

export type TeamOrgIdQueryVariables = Exact<{ [key: string]: never; }>;


export type TeamOrgIdQuery = { __typename?: 'Query', myOrganisations: Array<{ __typename?: 'Organisation', id: string }> };

export type OrganisationTeamPageQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type OrganisationTeamPageQuery = { __typename?: 'Query', organisationTeam: Array<{ __typename?: 'OrganisationTeamMember', roles: Array<string>, joinedAt?: any | null, user: { __typename?: 'User', id: string, name: string, email: string, avatarUrl?: string | null } }>, organisationInvites: Array<{ __typename?: 'OrganisationInvite', id: string, email: string, roles: Array<string>, status: string, token: string, expiresAt: any, createdAt: any }> };

export type InviteTeamMemberMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  email: Scalars['String']['input'];
  roles: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type InviteTeamMemberMutation = { __typename?: 'Mutation', inviteOrganisationMember: { __typename?: 'OrganisationInvite', id: string, email: string, token: string, status: string, expiresAt: any, roles: Array<string> } };

export type RevokeTeamInviteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RevokeTeamInviteMutation = { __typename?: 'Mutation', revokeOrganisationInvite: { __typename?: 'OrganisationInvite', id: string, status: string } };

export type ResendTeamInviteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ResendTeamInviteMutation = { __typename?: 'Mutation', resendOrganisationInvite: { __typename?: 'OrganisationInvite', id: string, token: string, status: string, expiresAt: any } };

export type UpdateTeamRolesMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  roles: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type UpdateTeamRolesMutation = { __typename?: 'Mutation', updateOrganisationMemberRoles: { __typename?: 'OrganisationTeamMember', roles: Array<string>, user: { __typename?: 'User', id: string } } };

export type RemoveTeamMemberMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type RemoveTeamMemberMutation = { __typename?: 'Mutation', removeOrganisationMember: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, name: string, email: string, avatarUrl?: string | null, isVerified: boolean, onboardingCompleted: boolean, region: string, preferences: Array<string>, roles: Array<string>, orgId?: string | null } | null };

export const HomepageEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomepageEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hosts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]} as unknown as DocumentNode<HomepageEventFragment, unknown>;
export const HomepageJobFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomepageJob"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JobListing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]} as unknown as DocumentNode<HomepageJobFragment, unknown>;
export const HomepageListingFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomepageListing"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MarketplaceItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"area"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}}]}}]} as unknown as DocumentNode<HomepageListingFragment, unknown>;
export const HomeEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomeEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}}]}}]} as unknown as DocumentNode<HomeEventFragment, unknown>;
export const HomeJobFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomeJob"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JobListing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"skillsRequired"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]} as unknown as DocumentNode<HomeJobFragment, unknown>;
export const HomeListingFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomeListing"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MarketplaceItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]} as unknown as DocumentNode<HomeListingFragment, unknown>;
export const OrganisationSidebarNotificationCountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganisationSidebarNotificationCounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"identityOrganisationUnreadCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}]},{"kind":"Field","name":{"kind":"Name","value":"eventOrganisationUnreadCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}]},{"kind":"Field","name":{"kind":"Name","value":"classifiedOrganisationUnreadCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}]}]}}]} as unknown as DocumentNode<OrganisationSidebarNotificationCountsQuery, OrganisationSidebarNotificationCountsQueryVariables>;
export const OrganisationRouteAccessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganisationRouteAccess"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<OrganisationRouteAccessQuery, OrganisationRouteAccessQueryVariables>;
export const SignUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignUpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customToken"}}]}}]}}]} as unknown as DocumentNode<SignUpMutation, SignUpMutationVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firebaseUid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const CreateOrganisationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrganisation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganisationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganisation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateOrganisationMutation, CreateOrganisationMutationVariables>;
export const CreateMarketplaceItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMarketplaceItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMarketplaceItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMarketplaceItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateMarketplaceItemMutation, CreateMarketplaceItemMutationVariables>;
export const CreateJobListingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateJobListing"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateJobListingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createJobListing"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateJobListingMutation, CreateJobListingMutationVariables>;
export const CreateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateEventMutation, CreateEventMutationVariables>;
export const UpdateOrganisationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganisation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateOrganisationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganisation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"deactivatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"whatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"instagram"}},{"kind":"Field","name":{"kind":"Name","value":"facebook"}},{"kind":"Field","name":{"kind":"Name","value":"twitter"}},{"kind":"Field","name":{"kind":"Name","value":"website"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateOrganisationMutation, UpdateOrganisationMutationVariables>;
export const MyOrgJobListingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrgJobListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"applicationDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"faithAlignmentTag"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<MyOrgJobListingsQuery, MyOrgJobListingsQueryVariables>;
export const MyMarketplaceListingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyMarketplaceListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"marketplaceListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<MyMarketplaceListingsQuery, MyMarketplaceListingsQueryVariables>;
export const SetOrganisationActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetOrganisationActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"active"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setOrganisationActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"active"},"value":{"kind":"Variable","name":{"kind":"Name","value":"active"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"deactivatedAt"}}]}}]}}]} as unknown as DocumentNode<SetOrganisationActiveMutation, SetOrganisationActiveMutationVariables>;
export const UpdateMarketplaceItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMarketplaceItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMarketplaceItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMarketplaceItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMarketplaceItemMutation, UpdateMarketplaceItemMutationVariables>;
export const UpdateMarketplaceItemStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMarketplaceItemStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ListingStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMarketplaceItemStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMarketplaceItemStatusMutation, UpdateMarketplaceItemStatusMutationVariables>;
export const DeleteMarketplaceItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMarketplaceItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMarketplaceItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMarketplaceItemMutation, DeleteMarketplaceItemMutationVariables>;
export const MyOrgEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrgEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"capacityLimit"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isRecurring"}},{"kind":"Field","name":{"kind":"Name","value":"seriesId"}},{"kind":"Field","name":{"kind":"Name","value":"occurrenceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isSeriesException"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recurrence"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"interval"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfMonth"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"occurrenceCount"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyOrgEventsQuery, MyOrgEventsQueryVariables>;
export const CancelManagedEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelManagedEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scope"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EventUpdateScope"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"scope"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scope"}}}]}]}}]} as unknown as DocumentNode<CancelManagedEventMutation, CancelManagedEventMutationVariables>;
export const UpdateManagedEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateManagedEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scope"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EventUpdateScope"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"scope"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scope"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isSeriesException"}}]}}]}}]} as unknown as DocumentNode<UpdateManagedEventMutation, UpdateManagedEventMutationVariables>;
export const MyOrganisationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"deactivatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"whatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"instagram"}},{"kind":"Field","name":{"kind":"Name","value":"facebook"}},{"kind":"Field","name":{"kind":"Name","value":"twitter"}},{"kind":"Field","name":{"kind":"Name","value":"website"}}]}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}},{"kind":"Field","name":{"kind":"Name","value":"followerCount"}}]}}]}}]} as unknown as DocumentNode<MyOrganisationsQuery, MyOrganisationsQueryVariables>;
export const DiscoveryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Discovery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"regionalEvents"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalEvents"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalJobs"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"skillsRequired"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalJobs"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"skillsRequired"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalListings"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"area"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalListings"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"area"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalOrganisations"},"name":{"kind":"Name","value":"organisations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalOrganisations"},"name":{"kind":"Name","value":"organisations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]}}]} as unknown as DocumentNode<DiscoveryQuery, DiscoveryQueryVariables>;
export const GlobalSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GlobalSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventCategory"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventCategory"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventDateFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobRoleType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"RoleType"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobWorkLocation"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLocation"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"listingAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"listingCategory"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MarketplaceCategory"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"listingCondition"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ItemCondition"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organisationAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventCategory"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventDateFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"DATE_ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventAfter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"roleType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobRoleType"}}},{"kind":"Argument","name":{"kind":"Name","value":"workLocation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobWorkLocation"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobAfter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"skillsRequired"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"listingCategory"}}},{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"Variable","name":{"kind":"Name","value":"listingCondition"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"listingAfter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"area"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organisations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationAfter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]} as unknown as DocumentNode<GlobalSearchQuery, GlobalSearchQueryVariables>;
export const HomepageContentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HomepageContent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekEnd"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"monthEnd"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"regionalFeaturedEvents"},"name":{"kind":"Name","value":"featuredEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageEvent"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalFeaturedEvents"},"name":{"kind":"Name","value":"featuredEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageEvent"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalWeeklyEvents"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekEnd"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"collapseSeries"},"value":{"kind":"BooleanValue","value":true}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageEvent"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalWeeklyEvents"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekEnd"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"collapseSeries"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageEvent"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalUpcomingEvents"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"monthEnd"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"DATE_ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"12"}},{"kind":"Argument","name":{"kind":"Name","value":"collapseSeries"},"value":{"kind":"BooleanValue","value":true}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageEvent"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalUpcomingEvents"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"monthEnd"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"DATE_ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"12"}},{"kind":"Argument","name":{"kind":"Name","value":"collapseSeries"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageEvent"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalJobs"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"6"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageJob"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalJobs"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"6"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageJob"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalListings"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"6"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageListing"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalListings"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"6"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomepageListing"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomepageEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hosts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomepageJob"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JobListing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomepageListing"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MarketplaceItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"area"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}}]}}]} as unknown as DocumentNode<HomepageContentQuery, HomepageContentQueryVariables>;
export const AllEventsDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllEventsDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventCategory"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locationType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LocationType"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ticketed"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventSort"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"locationType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locationType"}}},{"kind":"Argument","name":{"kind":"Name","value":"ticketed"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ticketed"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]} as unknown as DocumentNode<AllEventsDirectoryQuery, AllEventsDirectoryQueryVariables>;
export const AllJobsDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllJobsDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"RoleType"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workLocation"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkLocation"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skillTags"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"minSalary"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxSalary"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JobSort"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleType"}}},{"kind":"Argument","name":{"kind":"Name","value":"workLocation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workLocation"}}},{"kind":"Argument","name":{"kind":"Name","value":"skillTags"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skillTags"}}},{"kind":"Argument","name":{"kind":"Name","value":"minSalary"},"value":{"kind":"Variable","name":{"kind":"Name","value":"minSalary"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxSalary"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxSalary"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"skillsRequired"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"applicationDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]} as unknown as DocumentNode<AllJobsDirectoryQuery, AllJobsDirectoryQueryVariables>;
export const AllMarketplaceListingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllMarketplaceListings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MarketplaceCategory"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"condition"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ItemCondition"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subCategory"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"minPrice"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxPrice"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isDonation"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MarketplaceSort"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"condition"},"value":{"kind":"Variable","name":{"kind":"Name","value":"condition"}}},{"kind":"Argument","name":{"kind":"Name","value":"subCategory"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subCategory"}}},{"kind":"Argument","name":{"kind":"Name","value":"minPrice"},"value":{"kind":"Variable","name":{"kind":"Name","value":"minPrice"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxPrice"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxPrice"}}},{"kind":"Argument","name":{"kind":"Name","value":"isDonation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isDonation"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]} as unknown as DocumentNode<AllMarketplaceListingsQuery, AllMarketplaceListingsQueryVariables>;
export const EventDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"interestedCount"}},{"kind":"Field","name":{"kind":"Name","value":"savedCount"}},{"kind":"Field","name":{"kind":"Name","value":"confirmedCount"}},{"kind":"Field","name":{"kind":"Name","value":"capacityLimit"}},{"kind":"Field","name":{"kind":"Name","value":"waitlistCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"externalTicketUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isRecurring"}},{"kind":"Field","name":{"kind":"Name","value":"seriesId"}},{"kind":"Field","name":{"kind":"Name","value":"occurrenceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isSeriesException"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"virtualLink"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hosts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}},{"kind":"Field","name":{"kind":"Name","value":"verificationTier"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mySeriesRsvp"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recurrence"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"interval"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfMonth"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}},{"kind":"Field","name":{"kind":"Name","value":"occurrenceCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"occurrences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"capacityLimit"}}]}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"relatedEvents"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"myRsvps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stage"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<EventDetailsQuery, EventDetailsQueryVariables>;
export const EventDetailsRsvpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EventDetailsRsvp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stage"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RsvpStage"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rsvpToEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}},{"kind":"Argument","name":{"kind":"Name","value":"stage"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stage"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stage"}}]}}]}}]} as unknown as DocumentNode<EventDetailsRsvpMutation, EventDetailsRsvpMutationVariables>;
export const EventDetailsCancelRsvpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EventDetailsCancelRsvp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelRsvp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}]}]}}]} as unknown as DocumentNode<EventDetailsCancelRsvpMutation, EventDetailsCancelRsvpMutationVariables>;
export const EventDetailsSeriesRsvpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EventDetailsSeriesRsvp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seriesId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stage"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RsvpStage"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rsvpToSeries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seriesId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seriesId"}}},{"kind":"Argument","name":{"kind":"Name","value":"stage"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stage"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stage"}}]}}]}}]} as unknown as DocumentNode<EventDetailsSeriesRsvpMutation, EventDetailsSeriesRsvpMutationVariables>;
export const EventDetailsCancelSeriesRsvpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EventDetailsCancelSeriesRsvp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seriesId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelSeriesRsvp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"seriesId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seriesId"}}}]}]}}]} as unknown as DocumentNode<EventDetailsCancelSeriesRsvpMutation, EventDetailsCancelSeriesRsvpMutationVariables>;
export const EventsHomeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventsHome"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"regionalTrending"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"6"}},{"kind":"Argument","name":{"kind":"Name","value":"collapseSeries"},"value":{"kind":"BooleanValue","value":true}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeEvent"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalTrending"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"6"}},{"kind":"Argument","name":{"kind":"Name","value":"collapseSeries"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeEvent"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalUpcoming"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"DATE_ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"collapseSeries"},"value":{"kind":"BooleanValue","value":true}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeEvent"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalUpcoming"},"name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"PUBLISHED"}},{"kind":"Argument","name":{"kind":"Name","value":"dateFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"DATE_ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"collapseSeries"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeEvent"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomeEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}}]}}]}}]} as unknown as DocumentNode<EventsHomeQuery, EventsHomeQueryVariables>;
export const MyFollowingHubDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyFollowingHub"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myFollowingOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}},{"kind":"Field","name":{"kind":"Name","value":"followerCount"}},{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"4"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"jobListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"marketplaceListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}}]}}]}}]}}]} as unknown as DocumentNode<MyFollowingHubQuery, MyFollowingHubQueryVariables>;
export const JobApplicationContextDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"JobApplicationContext"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobListing"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"applicationDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"myJobApplication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<JobApplicationContextQuery, JobApplicationContextQueryVariables>;
export const SubmitInternalJobApplicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitInternalJobApplication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitJobApplicationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitJobApplication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<SubmitInternalJobApplicationMutation, SubmitInternalJobApplicationMutationVariables>;
export const JobDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"JobDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobListing"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"skillsRequired"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"applicationDeadline"}},{"kind":"Field","name":{"kind":"Name","value":"externalApplyUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"faithAlignmentTag"}},{"kind":"Field","name":{"kind":"Name","value":"responsibilities"}},{"kind":"Field","name":{"kind":"Name","value":"educationalRequirement"}},{"kind":"Field","name":{"kind":"Name","value":"experience"}},{"kind":"Field","name":{"kind":"Name","value":"certifications"}},{"kind":"Field","name":{"kind":"Name","value":"otherSkills"}},{"kind":"Field","name":{"kind":"Name","value":"faithDescription"}},{"kind":"Field","name":{"kind":"Name","value":"keyFaithRequirements"}},{"kind":"Field","name":{"kind":"Name","value":"applicationCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"verificationTier"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}}]}}]}}]}}]} as unknown as DocumentNode<JobDetailsQuery, JobDetailsQueryVariables>;
export const JobSavedStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"JobSavedState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isJobSaved"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<JobSavedStateQuery, JobSavedStateQueryVariables>;
export const SaveJobDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveJobDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<SaveJobDetailsMutation, SaveJobDetailsMutationVariables>;
export const UnsaveJobDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnsaveJobDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsaveJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<UnsaveJobDetailsMutation, UnsaveJobDetailsMutationVariables>;
export const JobsHomeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"JobsHome"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"regionalTrending"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"8"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeJob"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalTrending"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"8"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeJob"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalNewest"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeJob"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalNewest"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeJob"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalVolunteering"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"roleType"},"value":{"kind":"EnumValue","value":"VOLUNTEER"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"8"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeJob"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalVolunteering"},"name":{"kind":"Name","value":"jobListings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"ACTIVE"}},{"kind":"Argument","name":{"kind":"Name","value":"roleType"},"value":{"kind":"EnumValue","value":"VOLUNTEER"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"8"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeJob"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomeJob"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JobListing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"skillsRequired"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]} as unknown as DocumentNode<JobsHomeQuery, JobsHomeQueryVariables>;
export const MarketplaceDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MarketplaceDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MarketplaceCategory"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketplaceItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"area"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"flagCount"}},{"kind":"Field","name":{"kind":"Name","value":"subCategory"}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"}},{"kind":"Field","name":{"kind":"Name","value":"otherAttributes"}},{"kind":"Field","name":{"kind":"Name","value":"maxRetailPrice"}},{"kind":"Field","name":{"kind":"Name","value":"contactInfo"}},{"kind":"Field","name":{"kind":"Name","value":"showContactOnOffer"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"whatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"instagram"}},{"kind":"Field","name":{"kind":"Name","value":"facebook"}},{"kind":"Field","name":{"kind":"Name","value":"website"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MarketplaceDetailsQuery, MarketplaceDetailsQueryVariables>;
export const MarketplaceDetailsReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarketplaceDetailsReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportListing"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}]}]}}]} as unknown as DocumentNode<MarketplaceDetailsReportMutation, MarketplaceDetailsReportMutationVariables>;
export const MarketplaceSavedStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MarketplaceSavedState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isMarketplaceItemSaved"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<MarketplaceSavedStateQuery, MarketplaceSavedStateQueryVariables>;
export const SaveMarketplaceDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveMarketplaceDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveMarketplaceItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<SaveMarketplaceDetailsMutation, SaveMarketplaceDetailsMutationVariables>;
export const UnsaveMarketplaceDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnsaveMarketplaceDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsaveMarketplaceItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<UnsaveMarketplaceDetailsMutation, UnsaveMarketplaceDetailsMutationVariables>;
export const StartListingConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartListingConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"listingId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startListingConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"listingId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"listingId"}}},{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<StartListingConversationMutation, StartListingConversationMutationVariables>;
export const MarketplaceHomeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MarketplaceHome"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"region"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"regionalPromoted"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"8"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeListing"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalPromoted"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"POPULAR"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"8"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeListing"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalNewest"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeListing"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalNewest"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeListing"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"regionalDonations"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"region"},"value":{"kind":"Variable","name":{"kind":"Name","value":"region"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"isDonation"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"8"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasRegion"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeListing"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"globalDonations"},"name":{"kind":"Name","value":"marketplaceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"AVAILABLE"}},{"kind":"Argument","name":{"kind":"Name","value":"isDonation"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"EnumValue","value":"NEWEST"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"8"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"HomeListing"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"HomeListing"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MarketplaceItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]} as unknown as DocumentNode<MarketplaceHomeQuery, MarketplaceHomeQueryVariables>;
export const MessagingThreadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MessagingThreads"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MessageParticipantRole"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myMessageThreads"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastMessage"}},{"kind":"Field","name":{"kind":"Name","value":"lastMessageAt"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"buyer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firebaseUid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firebaseUid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unreadMessageCount"}}]}}]} as unknown as DocumentNode<MessagingThreadsQuery, MessagingThreadsQueryVariables>;
export const MessagingThreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MessagingThread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messageThread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"buyer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firebaseUid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firebaseUid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firebaseUid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MessagingThreadQuery, MessagingThreadQueryVariables>;
export const SendThreadMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendThreadMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"body"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"body"},"value":{"kind":"Variable","name":{"kind":"Name","value":"body"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SendThreadMessageMutation, SendThreadMessageMutationVariables>;
export const ReadThreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReadThread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markThreadRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<ReadThreadMutation, ReadThreadMutationVariables>;
export const ArchiveMessageThreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveMessageThread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveThread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ArchiveMessageThreadMutation, ArchiveMessageThreadMutationVariables>;
export const MyApplicationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyApplications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobApplications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"listing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyApplicationsQuery, MyApplicationsQueryVariables>;
export const OrganisationInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganisationInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organisationInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}}]}}]}}]}}]} as unknown as DocumentNode<OrganisationInvitationQuery, OrganisationInvitationQueryVariables>;
export const AcceptOrganisationInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptOrganisationInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptOrganisationInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AcceptOrganisationInvitationMutation, AcceptOrganisationInvitationMutationVariables>;
export const PublicOrganisationProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PublicOrganisationProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organisation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}},{"kind":"Field","name":{"kind":"Name","value":"verificationTier"}},{"kind":"Field","name":{"kind":"Name","value":"followerCount"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"whatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"instagram"}},{"kind":"Field","name":{"kind":"Name","value":"facebook"}},{"kind":"Field","name":{"kind":"Name","value":"twitter"}},{"kind":"Field","name":{"kind":"Name","value":"website"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"8"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"jobListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"marketplaceListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"isPromoted"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isFollowingOrganisation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<PublicOrganisationProfileQuery, PublicOrganisationProfileQueryVariables>;
export const FollowPublicOrganisationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FollowPublicOrganisation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"followOrganisation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"followerCount"}}]}}]}}]} as unknown as DocumentNode<FollowPublicOrganisationMutation, FollowPublicOrganisationMutationVariables>;
export const UnfollowPublicOrganisationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnfollowPublicOrganisation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unfollowOrganisation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"followerCount"}}]}}]}}]} as unknown as DocumentNode<UnfollowPublicOrganisationMutation, UnfollowPublicOrganisationMutationVariables>;
export const EditableMemberProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EditableMemberProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"whatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"instagram"}},{"kind":"Field","name":{"kind":"Name","value":"facebook"}},{"kind":"Field","name":{"kind":"Name","value":"twitter"}},{"kind":"Field","name":{"kind":"Name","value":"website"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privacySettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profileVisibility"}},{"kind":"Field","name":{"kind":"Name","value":"showAvatar"}},{"kind":"Field","name":{"kind":"Name","value":"showRegion"}},{"kind":"Field","name":{"kind":"Name","value":"showBio"}},{"kind":"Field","name":{"kind":"Name","value":"showSocialLinks"}}]}}]}}]}}]} as unknown as DocumentNode<EditableMemberProfileQuery, EditableMemberProfileQueryVariables>;
export const EditMemberProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditMemberProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"whatsapp"}},{"kind":"Field","name":{"kind":"Name","value":"instagram"}},{"kind":"Field","name":{"kind":"Name","value":"facebook"}},{"kind":"Field","name":{"kind":"Name","value":"twitter"}},{"kind":"Field","name":{"kind":"Name","value":"website"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privacySettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profileVisibility"}},{"kind":"Field","name":{"kind":"Name","value":"showAvatar"}},{"kind":"Field","name":{"kind":"Name","value":"showRegion"}},{"kind":"Field","name":{"kind":"Name","value":"showBio"}},{"kind":"Field","name":{"kind":"Name","value":"showSocialLinks"}}]}}]}}]}}]} as unknown as DocumentNode<EditMemberProfileMutation, EditMemberProfileMutationVariables>;
export const SavedItemsHubDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SavedItemsHub"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myRsvps"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"stage"},"value":{"kind":"EnumValue","value":"SAVED"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"rsvpCount"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"hosts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"mySavedJobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"roleType"}},{"kind":"Field","name":{"kind":"Name","value":"workLocation"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"salaryRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organisation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"mySavedMarketplaceItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"isDonation"}},{"kind":"Field","name":{"kind":"Name","value":"seller"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]}}]} as unknown as DocumentNode<SavedItemsHubQuery, SavedItemsHubQueryVariables>;
export const RemoveSavedEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveSavedEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelRsvp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RemoveSavedEventMutation, RemoveSavedEventMutationVariables>;
export const RemoveSavedJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveSavedJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsaveJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RemoveSavedJobMutation, RemoveSavedJobMutationVariables>;
export const RemoveSavedMarketplaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveSavedMarketplace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsaveMarketplaceItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RemoveSavedMarketplaceMutation, RemoveSavedMarketplaceMutationVariables>;
export const UpdatePreferencesProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePreferencesProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"}},{"kind":"Field","name":{"kind":"Name","value":"onboardingCompleted"}}]}}]}}]} as unknown as DocumentNode<UpdatePreferencesProfileMutation, UpdatePreferencesProfileMutationVariables>;
export const UpdateRegionProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRegionProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"region"}}]}}]}}]} as unknown as DocumentNode<UpdateRegionProfileMutation, UpdateRegionProfileMutationVariables>;
export const SubmitVerificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitVerification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentUrls"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitVerification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"documentUrls"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentUrls"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<SubmitVerificationMutation, SubmitVerificationMutationVariables>;
export const OrganisationApplicationsInboxDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganisationApplicationsInbox"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organisationJobApplications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"experience"}},{"kind":"Field","name":{"kind":"Name","value":"yearsOfExperience"}},{"kind":"Field","name":{"kind":"Name","value":"currentSalary"}},{"kind":"Field","name":{"kind":"Name","value":"expectedSalary"}},{"kind":"Field","name":{"kind":"Name","value":"portfolioUrl"}},{"kind":"Field","name":{"kind":"Name","value":"linkedInProfile"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"education"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"highestQualification"}},{"kind":"Field","name":{"kind":"Name","value":"institutionName"}},{"kind":"Field","name":{"kind":"Name","value":"yearOfEnrollment"}},{"kind":"Field","name":{"kind":"Name","value":"yearOfCompletion"}},{"kind":"Field","name":{"kind":"Name","value":"marksGrades"}},{"kind":"Field","name":{"kind":"Name","value":"degreeType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]}}]} as unknown as DocumentNode<OrganisationApplicationsInboxQuery, OrganisationApplicationsInboxQueryVariables>;
export const UpdateOrganisationApplicationStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganisationApplicationStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ApplicationStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateJobApplicationStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UpdateOrganisationApplicationStatusMutation, UpdateOrganisationApplicationStatusMutationVariables>;
export const OrganisationNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganisationNotifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<OrganisationNotificationsQuery, OrganisationNotificationsQueryVariables>;
export const ApplicationNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ApplicationNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organisationJobApplications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"listing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]}}]} as unknown as DocumentNode<ApplicationNotificationsQuery, ApplicationNotificationsQueryVariables>;
export const OrganisationNotificationCentreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganisationNotificationCentre"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"identityOrganisationNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"href"}},{"kind":"Field","name":{"kind":"Name","value":"sourceId"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"eventOrganisationNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"href"}},{"kind":"Field","name":{"kind":"Name","value":"sourceId"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"classifiedOrganisationNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"href"}},{"kind":"Field","name":{"kind":"Name","value":"sourceId"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"identityOrganisationUnreadCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}]},{"kind":"Field","name":{"kind":"Name","value":"eventOrganisationUnreadCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}]},{"kind":"Field","name":{"kind":"Name","value":"classifiedOrganisationUnreadCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}]}]}}]} as unknown as DocumentNode<OrganisationNotificationCentreQuery, OrganisationNotificationCentreQueryVariables>;
export const MarkIdentityNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkIdentityNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markIdentityOrganisationNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]}}]} as unknown as DocumentNode<MarkIdentityNotificationReadMutation, MarkIdentityNotificationReadMutationVariables>;
export const MarkEventNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkEventNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markEventOrganisationNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]}}]} as unknown as DocumentNode<MarkEventNotificationReadMutation, MarkEventNotificationReadMutationVariables>;
export const MarkClassifiedNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkClassifiedNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markClassifiedOrganisationNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]}}]} as unknown as DocumentNode<MarkClassifiedNotificationReadMutation, MarkClassifiedNotificationReadMutationVariables>;
export const MarkAllOrganisationNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllOrganisationNotificationsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"identity"},"name":{"kind":"Name","value":"markAllIdentityOrganisationNotificationsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}]},{"kind":"Field","alias":{"kind":"Name","value":"events"},"name":{"kind":"Name","value":"markAllEventOrganisationNotificationsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}]},{"kind":"Field","alias":{"kind":"Name","value":"classified"},"name":{"kind":"Name","value":"markAllClassifiedOrganisationNotificationsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organisationId"}}}]}]}}]} as unknown as DocumentNode<MarkAllOrganisationNotificationsReadMutation, MarkAllOrganisationNotificationsReadMutationVariables>;
export const TeamOrgIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamOrgId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganisations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TeamOrgIdQuery, TeamOrgIdQueryVariables>;
export const OrganisationTeamPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganisationTeamPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organisationTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organisationInvites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<OrganisationTeamPageQuery, OrganisationTeamPageQueryVariables>;
export const InviteTeamMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteTeamMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roles"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteOrganisationMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"roles"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roles"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}}]}}]}}]} as unknown as DocumentNode<InviteTeamMemberMutation, InviteTeamMemberMutationVariables>;
export const RevokeTeamInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeTeamInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeOrganisationInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RevokeTeamInviteMutation, RevokeTeamInviteMutationVariables>;
export const ResendTeamInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendTeamInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendOrganisationInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}}]}}]} as unknown as DocumentNode<ResendTeamInviteMutation, ResendTeamInviteMutationVariables>;
export const UpdateTeamRolesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTeamRoles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roles"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganisationMemberRoles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"roles"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roles"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateTeamRolesMutation, UpdateTeamRolesMutationVariables>;
export const RemoveTeamMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveTeamMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeOrganisationMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organisationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<RemoveTeamMemberMutation, RemoveTeamMemberMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}},{"kind":"Field","name":{"kind":"Name","value":"onboardingCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"}},{"kind":"Field","name":{"kind":"Name","value":"roles"}},{"kind":"Field","name":{"kind":"Name","value":"orgId"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;