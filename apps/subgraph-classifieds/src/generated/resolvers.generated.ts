import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { GraphQLContext } from '../context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  _FieldSet: { input: any; output: any; }
};

export const ApplicationStatus = {
  Hired: 'HIRED',
  Rejected: 'REJECTED',
  Shortlisted: 'SHORTLISTED',
  Submitted: 'SUBMITTED',
  UnderReview: 'UNDER_REVIEW',
  Withdrawn: 'WITHDRAWN'
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];
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

export type ConvertedPrice = {
  __typename?: 'ConvertedPrice';
  converted: Scalars['Float']['output'];
  isEstimate: Scalars['Boolean']['output'];
  original: Scalars['Float']['output'];
  originalCurrency: Scalars['String']['output'];
  toCurrency: Scalars['String']['output'];
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
  videoPosterUrl?: InputMaybe<Scalars['String']['input']>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
};

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

export const FaithAlignmentTag = {
  FaithBackgroundPreferred: 'FAITH_BACKGROUND_PREFERRED',
  OpenToAll: 'OPEN_TO_ALL'
} as const;

export type FaithAlignmentTag = typeof FaithAlignmentTag[keyof typeof FaithAlignmentTag];
export const ItemCondition = {
  Fair: 'FAIR',
  Good: 'GOOD',
  LikeNew: 'LIKE_NEW',
  New: 'NEW'
} as const;

export type ItemCondition = typeof ItemCondition[keyof typeof ItemCondition];
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

export const JobSort = {
  Deadline: 'DEADLINE',
  Newest: 'NEWEST',
  Popular: 'POPULAR',
  SalaryAsc: 'SALARY_ASC',
  SalaryDesc: 'SALARY_DESC'
} as const;

export type JobSort = typeof JobSort[keyof typeof JobSort];
export const JobStatus = {
  Active: 'ACTIVE',
  Archived: 'ARCHIVED',
  Closed: 'CLOSED'
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];
export const ListingStatus = {
  Available: 'AVAILABLE',
  PendingReview: 'PENDING_REVIEW',
  Removed: 'REMOVED',
  Reserved: 'RESERVED',
  Sold: 'SOLD'
} as const;

export type ListingStatus = typeof ListingStatus[keyof typeof ListingStatus];
export const MarketplaceCategory = {
  BabyAndKids: 'BABY_AND_KIDS',
  Books: 'BOOKS',
  CharityItems: 'CHARITY_ITEMS',
  Clothing: 'CLOTHING',
  Electronics: 'ELECTRONICS',
  Food: 'FOOD',
  Furniture: 'FURNITURE',
  Other: 'OTHER'
} as const;

export type MarketplaceCategory = typeof MarketplaceCategory[keyof typeof MarketplaceCategory];
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
  videoPosterUrl?: Maybe<Scalars['String']['output']>;
  videoUrl?: Maybe<Scalars['String']['output']>;
};

export type MarketplaceItemConnection = {
  __typename?: 'MarketplaceItemConnection';
  edges: Array<MarketplaceItem>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export const MarketplaceSort = {
  Newest: 'NEWEST',
  Popular: 'POPULAR',
  PriceAsc: 'PRICE_ASC',
  PriceDesc: 'PRICE_DESC'
} as const;

export type MarketplaceSort = typeof MarketplaceSort[keyof typeof MarketplaceSort];
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

export const MessageParticipantRole = {
  Buyer: 'BUYER',
  Seller: 'SELLER'
} as const;

export type MessageParticipantRole = typeof MessageParticipantRole[keyof typeof MessageParticipantRole];
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

export const MessageThreadStatus = {
  Active: 'ACTIVE',
  Archived: 'ARCHIVED',
  Blocked: 'BLOCKED'
} as const;

export type MessageThreadStatus = typeof MessageThreadStatus[keyof typeof MessageThreadStatus];
export const MessageType = {
  Offer: 'OFFER',
  System: 'SYSTEM',
  Text: 'TEXT'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];
export type Mutation = {
  __typename?: 'Mutation';
  archiveJobListing: JobListing;
  archiveThread: MessageThread;
  createJobListing: JobListing;
  createMarketplaceItem: MarketplaceItem;
  deleteMarketplaceItem: Scalars['Boolean']['output'];
  markAllClassifiedOrganisationNotificationsRead: Scalars['Boolean']['output'];
  markClassifiedOrganisationNotificationRead: ClassifiedOrganisationNotification;
  markThreadRead: Scalars['Boolean']['output'];
  reportListing: Scalars['Boolean']['output'];
  saveJob: Scalars['Boolean']['output'];
  saveMarketplaceItem: Scalars['Boolean']['output'];
  sendMessage: Message;
  startListingConversation: MessageThread;
  submitJobApplication: JobApplication;
  unsaveJob: Scalars['Boolean']['output'];
  unsaveMarketplaceItem: Scalars['Boolean']['output'];
  updateJobApplicationStatus: JobApplication;
  updateJobListing: JobListing;
  updateMarketplaceItem: MarketplaceItem;
  updateMarketplaceItemStatus: MarketplaceItem;
};


export type MutationArchiveJobListingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveThreadArgs = {
  threadId: Scalars['ID']['input'];
};


export type MutationCreateJobListingArgs = {
  input: CreateJobListingInput;
};


export type MutationCreateMarketplaceItemArgs = {
  input: CreateMarketplaceItemInput;
};


export type MutationDeleteMarketplaceItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkAllClassifiedOrganisationNotificationsReadArgs = {
  organisationId: Scalars['ID']['input'];
};


export type MutationMarkClassifiedOrganisationNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkThreadReadArgs = {
  threadId: Scalars['ID']['input'];
};


export type MutationReportListingArgs = {
  itemId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
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


export type MutationStartListingConversationArgs = {
  listingId: Scalars['ID']['input'];
  message: Scalars['String']['input'];
};


export type MutationSubmitJobApplicationArgs = {
  input: SubmitJobApplicationInput;
};


export type MutationUnsaveJobArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnsaveMarketplaceItemArgs = {
  id: Scalars['ID']['input'];
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

export type Organisation = {
  __typename?: 'Organisation';
  id: Scalars['ID']['output'];
  jobListings: Array<JobListing>;
  marketplaceListings: Array<MarketplaceItem>;
};

export type Query = {
  __typename?: 'Query';
  classifiedOrganisationNotifications: Array<ClassifiedOrganisationNotification>;
  classifiedOrganisationUnreadCount: Scalars['Int']['output'];
  communityGives: Array<MarketplaceItem>;
  isJobSaved: Scalars['Boolean']['output'];
  isMarketplaceItemSaved: Scalars['Boolean']['output'];
  jobListing?: Maybe<JobListing>;
  jobListings: JobListingConnection;
  marketplaceItem?: Maybe<MarketplaceItem>;
  marketplaceItems: MarketplaceItemConnection;
  messageThread?: Maybe<MessageThread>;
  myJobApplication?: Maybe<JobApplication>;
  myMessageThreads: MessageThreadConnection;
  mySavedJobs: Array<JobListing>;
  mySavedMarketplaceItems: Array<MarketplaceItem>;
  organisationJobApplications: Array<JobApplication>;
  unreadMessageCount: Scalars['Int']['output'];
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


export type QueryMyJobApplicationArgs = {
  jobId: Scalars['ID']['input'];
};


export type QueryMyMessageThreadsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<MessageParticipantRole>;
};


export type QueryOrganisationJobApplicationsArgs = {
  jobId?: InputMaybe<Scalars['ID']['input']>;
  organisationId: Scalars['ID']['input'];
  status?: InputMaybe<ApplicationStatus>;
};

export const RoleType = {
  Internship: 'INTERNSHIP',
  Paid: 'PAID',
  Volunteer: 'VOLUNTEER'
} as const;

export type RoleType = typeof RoleType[keyof typeof RoleType];
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

export type SubmitJobApplicationInput = {
  acknowledged: Scalars['Boolean']['input'];
  currentSalary?: InputMaybe<Scalars['String']['input']>;
  cvUrl?: InputMaybe<Scalars['String']['input']>;
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
  videoPosterUrl?: InputMaybe<Scalars['String']['input']>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  firebaseUid: Scalars['String']['output'];
  jobApplications: Array<JobApplication>;
  marketplaceListings: Array<MarketplaceItem>;
  savedJobs: Array<JobListing>;
};

export const WorkLocation = {
  Hybrid: 'HYBRID',
  Physical: 'PHYSICAL',
  Remote: 'REMOTE'
} as const;

export type WorkLocation = typeof WorkLocation[keyof typeof WorkLocation];
export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ReferenceResolver<TResult, TReference, TContext> = (
      reference: TReference,
      context: TContext,
      info: GraphQLResolveInfo
    ) => Promise<TResult> | TResult;

      type ScalarCheck<T, S> = S extends true ? T : NullableCheck<T, S>;
      type NullableCheck<T, S> = Maybe<T> extends T ? Maybe<ListCheck<NonNullable<T>, S>> : ListCheck<T, S>;
      type ListCheck<T, S> = T extends (infer U)[] ? NullableCheck<U, S>[] : GraphQLRecursivePick<T, S>;
      export type GraphQLRecursivePick<T, S> = { [K in keyof T & keyof S]: ScalarCheck<T[K], S[K]> };
    

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  ApplicationStatus: ApplicationStatus;
  ClassifiedOrganisationNotification: ResolverTypeWrapper<ClassifiedOrganisationNotification>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  ConvertedPrice: ResolverTypeWrapper<ConvertedPrice>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateJobListingInput: CreateJobListingInput;
  CreateMarketplaceItemInput: CreateMarketplaceItemInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  EducationEntry: ResolverTypeWrapper<EducationEntry>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  EducationEntryInput: EducationEntryInput;
  FaithAlignmentTag: FaithAlignmentTag;
  ItemCondition: ItemCondition;
  JobApplication: ResolverTypeWrapper<JobApplication>;
  JobListing: ResolverTypeWrapper<JobListing>;
  JobListingConnection: ResolverTypeWrapper<JobListingConnection>;
  JobSort: JobSort;
  JobStatus: JobStatus;
  ListingStatus: ListingStatus;
  MarketplaceCategory: MarketplaceCategory;
  MarketplaceItem: ResolverTypeWrapper<MarketplaceItem>;
  MarketplaceItemConnection: ResolverTypeWrapper<MarketplaceItemConnection>;
  MarketplaceSort: MarketplaceSort;
  Message: ResolverTypeWrapper<Message>;
  MessageConnection: ResolverTypeWrapper<MessageConnection>;
  MessageParticipantRole: MessageParticipantRole;
  MessageThread: ResolverTypeWrapper<MessageThread>;
  MessageThreadConnection: ResolverTypeWrapper<MessageThreadConnection>;
  MessageThreadStatus: MessageThreadStatus;
  MessageType: MessageType;
  Mutation: ResolverTypeWrapper<{}>;
  Organisation: ResolverTypeWrapper<Organisation>;
  Query: ResolverTypeWrapper<{}>;
  RoleType: RoleType;
  SalaryRange: ResolverTypeWrapper<SalaryRange>;
  SalaryRangeInput: SalaryRangeInput;
  SubmitJobApplicationInput: SubmitJobApplicationInput;
  UpdateJobListingInput: UpdateJobListingInput;
  UpdateMarketplaceItemInput: UpdateMarketplaceItemInput;
  User: ResolverTypeWrapper<User>;
  WorkLocation: WorkLocation;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ClassifiedOrganisationNotification: ClassifiedOrganisationNotification;
  String: Scalars['String']['output'];
  ID: Scalars['ID']['output'];
  ConvertedPrice: ConvertedPrice;
  Float: Scalars['Float']['output'];
  Boolean: Scalars['Boolean']['output'];
  CreateJobListingInput: CreateJobListingInput;
  CreateMarketplaceItemInput: CreateMarketplaceItemInput;
  DateTime: Scalars['DateTime']['output'];
  EducationEntry: EducationEntry;
  Int: Scalars['Int']['output'];
  EducationEntryInput: EducationEntryInput;
  JobApplication: JobApplication;
  JobListing: JobListing;
  JobListingConnection: JobListingConnection;
  MarketplaceItem: MarketplaceItem;
  MarketplaceItemConnection: MarketplaceItemConnection;
  Message: Message;
  MessageConnection: MessageConnection;
  MessageThread: MessageThread;
  MessageThreadConnection: MessageThreadConnection;
  Mutation: {};
  Organisation: Organisation;
  Query: {};
  SalaryRange: SalaryRange;
  SalaryRangeInput: SalaryRangeInput;
  SubmitJobApplicationInput: SubmitJobApplicationInput;
  UpdateJobListingInput: UpdateJobListingInput;
  UpdateMarketplaceItemInput: UpdateMarketplaceItemInput;
  User: User;
}>;

export type ClassifiedOrganisationNotificationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ClassifiedOrganisationNotification'] = ResolversParentTypes['ClassifiedOrganisationNotification']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  href?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sourceId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ConvertedPriceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ConvertedPrice'] = ResolversParentTypes['ConvertedPrice']> = ResolversObject<{
  converted?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  isEstimate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  original?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  originalCurrency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  toCurrency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EducationEntryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['EducationEntry'] = ResolversParentTypes['EducationEntry']> = ResolversObject<{
  degreeType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  highestQualification?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  institutionName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  marksGrades?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  yearOfCompletion?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  yearOfEnrollment?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type JobApplicationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JobApplication'] = ResolversParentTypes['JobApplication']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['JobApplication']>, { __typename: 'JobApplication' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  acknowledged?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  applicant?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currentSalary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cvUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateOfBirth?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  education?: Resolver<Array<ResolversTypes['EducationEntry']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expectedSalary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  experience?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fullName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  linkedInProfile?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  listing?: Resolver<ResolversTypes['JobListing'], ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  portfolioUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resumeUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ApplicationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  yearsOfExperience?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type JobListingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JobListing'] = ResolversParentTypes['JobListing']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['JobListing']>, { __typename: 'JobListing' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  applicationCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  applicationDeadline?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  certifications?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  educationalRequirement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  experience?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  externalApplyUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  faithAlignmentTag?: Resolver<Maybe<ResolversTypes['FaithAlignmentTag']>, ParentType, ContextType>;
  faithDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isPromoted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  keyFaithRequirements?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  organisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType>;
  otherSkills?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  responsibilities?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  roleType?: Resolver<ResolversTypes['RoleType'], ParentType, ContextType>;
  salaryRange?: Resolver<Maybe<ResolversTypes['SalaryRange']>, ParentType, ContextType>;
  skillsRequired?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['JobStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  workLocation?: Resolver<ResolversTypes['WorkLocation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type JobListingConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JobListingConnection'] = ResolversParentTypes['JobListingConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['JobListing']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MarketplaceItemResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MarketplaceItem'] = ResolversParentTypes['MarketplaceItem']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['MarketplaceItem']>, { __typename: 'MarketplaceItem' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  area?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['MarketplaceCategory'], ParentType, ContextType>;
  condition?: Resolver<ResolversTypes['ItemCondition'], ParentType, ContextType>;
  contactInfo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  convertedPrice?: Resolver<Maybe<ResolversTypes['ConvertedPrice']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dimensions?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  flagCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrls?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  isDonation?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPromoted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  maxRetailPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  otherAttributes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  seller?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  showContactOnOffer?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ListingStatus'], ParentType, ContextType>;
  subCategory?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  videoPosterUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  videoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MarketplaceItemConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MarketplaceItemConnection'] = ResolversParentTypes['MarketplaceItemConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['MarketplaceItem']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MessageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Message'] = ResolversParentTypes['Message']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Message']>, { __typename: 'Message' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  readAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  thread?: Resolver<ResolversTypes['MessageThread'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['MessageType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MessageConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MessageConnection'] = ResolversParentTypes['MessageConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['Message']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MessageThreadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MessageThread'] = ResolversParentTypes['MessageThread']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['MessageThread']>, { __typename: 'MessageThread' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  buyer?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastMessageAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  listing?: Resolver<ResolversTypes['MarketplaceItem'], ParentType, ContextType>;
  messages?: Resolver<ResolversTypes['MessageConnection'], ParentType, ContextType, Partial<MessageThreadMessagesArgs>>;
  organisation?: Resolver<Maybe<ResolversTypes['Organisation']>, ParentType, ContextType>;
  seller?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['MessageThreadStatus'], ParentType, ContextType>;
  unreadCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MessageThreadConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MessageThreadConnection'] = ResolversParentTypes['MessageThreadConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['MessageThread']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  archiveJobListing?: Resolver<ResolversTypes['JobListing'], ParentType, ContextType, RequireFields<MutationArchiveJobListingArgs, 'id'>>;
  archiveThread?: Resolver<ResolversTypes['MessageThread'], ParentType, ContextType, RequireFields<MutationArchiveThreadArgs, 'threadId'>>;
  createJobListing?: Resolver<ResolversTypes['JobListing'], ParentType, ContextType, RequireFields<MutationCreateJobListingArgs, 'input'>>;
  createMarketplaceItem?: Resolver<ResolversTypes['MarketplaceItem'], ParentType, ContextType, RequireFields<MutationCreateMarketplaceItemArgs, 'input'>>;
  deleteMarketplaceItem?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteMarketplaceItemArgs, 'id'>>;
  markAllClassifiedOrganisationNotificationsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMarkAllClassifiedOrganisationNotificationsReadArgs, 'organisationId'>>;
  markClassifiedOrganisationNotificationRead?: Resolver<ResolversTypes['ClassifiedOrganisationNotification'], ParentType, ContextType, RequireFields<MutationMarkClassifiedOrganisationNotificationReadArgs, 'id'>>;
  markThreadRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMarkThreadReadArgs, 'threadId'>>;
  reportListing?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationReportListingArgs, 'itemId' | 'reason'>>;
  saveJob?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSaveJobArgs, 'id'>>;
  saveMarketplaceItem?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSaveMarketplaceItemArgs, 'id'>>;
  sendMessage?: Resolver<ResolversTypes['Message'], ParentType, ContextType, RequireFields<MutationSendMessageArgs, 'body' | 'threadId'>>;
  startListingConversation?: Resolver<ResolversTypes['MessageThread'], ParentType, ContextType, RequireFields<MutationStartListingConversationArgs, 'listingId' | 'message'>>;
  submitJobApplication?: Resolver<ResolversTypes['JobApplication'], ParentType, ContextType, RequireFields<MutationSubmitJobApplicationArgs, 'input'>>;
  unsaveJob?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUnsaveJobArgs, 'id'>>;
  unsaveMarketplaceItem?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUnsaveMarketplaceItemArgs, 'id'>>;
  updateJobApplicationStatus?: Resolver<ResolversTypes['JobApplication'], ParentType, ContextType, RequireFields<MutationUpdateJobApplicationStatusArgs, 'id' | 'status'>>;
  updateJobListing?: Resolver<ResolversTypes['JobListing'], ParentType, ContextType, RequireFields<MutationUpdateJobListingArgs, 'id' | 'input'>>;
  updateMarketplaceItem?: Resolver<ResolversTypes['MarketplaceItem'], ParentType, ContextType, RequireFields<MutationUpdateMarketplaceItemArgs, 'id' | 'input'>>;
  updateMarketplaceItemStatus?: Resolver<ResolversTypes['MarketplaceItem'], ParentType, ContextType, RequireFields<MutationUpdateMarketplaceItemStatusArgs, 'id' | 'status'>>;
}>;

export type OrganisationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Organisation'] = ResolversParentTypes['Organisation']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Organisation']>, { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;

  jobListings?: Resolver<Array<ResolversTypes['JobListing']>, { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  marketplaceListings?: Resolver<Array<ResolversTypes['MarketplaceItem']>, { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  classifiedOrganisationNotifications?: Resolver<Array<ResolversTypes['ClassifiedOrganisationNotification']>, ParentType, ContextType, RequireFields<QueryClassifiedOrganisationNotificationsArgs, 'organisationId'>>;
  classifiedOrganisationUnreadCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryClassifiedOrganisationUnreadCountArgs, 'organisationId'>>;
  communityGives?: Resolver<Array<ResolversTypes['MarketplaceItem']>, ParentType, ContextType, Partial<QueryCommunityGivesArgs>>;
  isJobSaved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryIsJobSavedArgs, 'id'>>;
  isMarketplaceItemSaved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryIsMarketplaceItemSavedArgs, 'id'>>;
  jobListing?: Resolver<Maybe<ResolversTypes['JobListing']>, ParentType, ContextType, RequireFields<QueryJobListingArgs, 'id'>>;
  jobListings?: Resolver<ResolversTypes['JobListingConnection'], ParentType, ContextType, Partial<QueryJobListingsArgs>>;
  marketplaceItem?: Resolver<Maybe<ResolversTypes['MarketplaceItem']>, ParentType, ContextType, RequireFields<QueryMarketplaceItemArgs, 'id'>>;
  marketplaceItems?: Resolver<ResolversTypes['MarketplaceItemConnection'], ParentType, ContextType, Partial<QueryMarketplaceItemsArgs>>;
  messageThread?: Resolver<Maybe<ResolversTypes['MessageThread']>, ParentType, ContextType, RequireFields<QueryMessageThreadArgs, 'id'>>;
  myJobApplication?: Resolver<Maybe<ResolversTypes['JobApplication']>, ParentType, ContextType, RequireFields<QueryMyJobApplicationArgs, 'jobId'>>;
  myMessageThreads?: Resolver<ResolversTypes['MessageThreadConnection'], ParentType, ContextType, Partial<QueryMyMessageThreadsArgs>>;
  mySavedJobs?: Resolver<Array<ResolversTypes['JobListing']>, ParentType, ContextType>;
  mySavedMarketplaceItems?: Resolver<Array<ResolversTypes['MarketplaceItem']>, ParentType, ContextType>;
  organisationJobApplications?: Resolver<Array<ResolversTypes['JobApplication']>, ParentType, ContextType, RequireFields<QueryOrganisationJobApplicationsArgs, 'organisationId'>>;
  unreadMessageCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type SalaryRangeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SalaryRange'] = ResolversParentTypes['SalaryRange']> = ResolversObject<{
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  max?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  min?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"firebaseUid":true}>, ContextType>;

  jobApplications?: Resolver<Array<ResolversTypes['JobApplication']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"firebaseUid":true}>, ContextType>;
  marketplaceListings?: Resolver<Array<ResolversTypes['MarketplaceItem']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"firebaseUid":true}>, ContextType>;
  savedJobs?: Resolver<Array<ResolversTypes['JobListing']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"firebaseUid":true}>, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  ClassifiedOrganisationNotification?: ClassifiedOrganisationNotificationResolvers<ContextType>;
  ConvertedPrice?: ConvertedPriceResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  EducationEntry?: EducationEntryResolvers<ContextType>;
  JobApplication?: JobApplicationResolvers<ContextType>;
  JobListing?: JobListingResolvers<ContextType>;
  JobListingConnection?: JobListingConnectionResolvers<ContextType>;
  MarketplaceItem?: MarketplaceItemResolvers<ContextType>;
  MarketplaceItemConnection?: MarketplaceItemConnectionResolvers<ContextType>;
  Message?: MessageResolvers<ContextType>;
  MessageConnection?: MessageConnectionResolvers<ContextType>;
  MessageThread?: MessageThreadResolvers<ContextType>;
  MessageThreadConnection?: MessageThreadConnectionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Organisation?: OrganisationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SalaryRange?: SalaryRangeResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

