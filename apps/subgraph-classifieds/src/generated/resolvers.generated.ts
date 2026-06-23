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
  Rejected: 'REJECTED',
  Shortlisted: 'SHORTLISTED',
  Submitted: 'SUBMITTED',
  UnderReview: 'UNDER_REVIEW',
  Withdrawn: 'WITHDRAWN'
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];
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
  applicant: User;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  listing: JobListing;
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

export const JobStatus = {
  Active: 'ACTIVE',
  Archived: 'ARCHIVED',
  Closed: 'CLOSED'
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];
export const ListingStatus = {
  Available: 'AVAILABLE',
  PendingReview: 'PENDING_REVIEW',
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

export type Mutation = {
  __typename?: 'Mutation';
  archiveJobListing: JobListing;
  createJobListing: JobListing;
  createMarketplaceItem: MarketplaceItem;
  deleteMarketplaceItem: Scalars['Boolean']['output'];
  reportListing: Scalars['Boolean']['output'];
  updateJobListing: JobListing;
  updateMarketplaceItem: MarketplaceItem;
  updateMarketplaceItemStatus: MarketplaceItem;
};


export type MutationArchiveJobListingArgs = {
  id: Scalars['ID']['input'];
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


export type MutationReportListingArgs = {
  itemId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
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
  isVerified: Scalars['Boolean']['output'];
  jobListings: Array<JobListing>;
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  communityGives: Array<MarketplaceItem>;
  jobListing?: Maybe<JobListing>;
  jobListings: JobListingConnection;
  marketplaceItem?: Maybe<MarketplaceItem>;
  marketplaceItems: MarketplaceItemConnection;
};


export type QueryCommunityGivesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
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

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
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
  ConvertedPrice: ResolverTypeWrapper<ConvertedPrice>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  CreateJobListingInput: CreateJobListingInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  CreateMarketplaceItemInput: CreateMarketplaceItemInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  FaithAlignmentTag: FaithAlignmentTag;
  ItemCondition: ItemCondition;
  JobApplication: ResolverTypeWrapper<JobApplication>;
  JobListing: ResolverTypeWrapper<JobListing>;
  JobListingConnection: ResolverTypeWrapper<JobListingConnection>;
  JobStatus: JobStatus;
  ListingStatus: ListingStatus;
  MarketplaceCategory: MarketplaceCategory;
  MarketplaceItem: ResolverTypeWrapper<MarketplaceItem>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  MarketplaceItemConnection: ResolverTypeWrapper<MarketplaceItemConnection>;
  Mutation: ResolverTypeWrapper<{}>;
  Organisation: ResolverTypeWrapper<Organisation>;
  Query: ResolverTypeWrapper<{}>;
  RoleType: RoleType;
  SalaryRange: ResolverTypeWrapper<SalaryRange>;
  SalaryRangeInput: SalaryRangeInput;
  UpdateJobListingInput: UpdateJobListingInput;
  UpdateMarketplaceItemInput: UpdateMarketplaceItemInput;
  User: ResolverTypeWrapper<User>;
  WorkLocation: WorkLocation;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ConvertedPrice: ConvertedPrice;
  Float: Scalars['Float']['output'];
  Boolean: Scalars['Boolean']['output'];
  String: Scalars['String']['output'];
  CreateJobListingInput: CreateJobListingInput;
  ID: Scalars['ID']['output'];
  CreateMarketplaceItemInput: CreateMarketplaceItemInput;
  DateTime: Scalars['DateTime']['output'];
  JobApplication: JobApplication;
  JobListing: JobListing;
  JobListingConnection: JobListingConnection;
  MarketplaceItem: MarketplaceItem;
  Int: Scalars['Int']['output'];
  MarketplaceItemConnection: MarketplaceItemConnection;
  Mutation: {};
  Organisation: Organisation;
  Query: {};
  SalaryRange: SalaryRange;
  SalaryRangeInput: SalaryRangeInput;
  UpdateJobListingInput: UpdateJobListingInput;
  UpdateMarketplaceItemInput: UpdateMarketplaceItemInput;
  User: User;
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

export type JobApplicationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JobApplication'] = ResolversParentTypes['JobApplication']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['JobApplication']>, { __typename: 'JobApplication' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  applicant?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  listing?: Resolver<ResolversTypes['JobListing'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ApplicationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type JobListingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['JobListing'] = ResolversParentTypes['JobListing']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['JobListing']>, { __typename: 'JobListing' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  applicationDeadline?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  externalApplyUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  faithAlignmentTag?: Resolver<Maybe<ResolversTypes['FaithAlignmentTag']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isPromoted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  category?: Resolver<ResolversTypes['MarketplaceCategory'], ParentType, ContextType>;
  condition?: Resolver<ResolversTypes['ItemCondition'], ParentType, ContextType>;
  convertedPrice?: Resolver<Maybe<ResolversTypes['ConvertedPrice']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  flagCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrls?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  isDonation?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPromoted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  seller?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ListingStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MarketplaceItemConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MarketplaceItemConnection'] = ResolversParentTypes['MarketplaceItemConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['MarketplaceItem']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  archiveJobListing?: Resolver<ResolversTypes['JobListing'], ParentType, ContextType, RequireFields<MutationArchiveJobListingArgs, 'id'>>;
  createJobListing?: Resolver<ResolversTypes['JobListing'], ParentType, ContextType, RequireFields<MutationCreateJobListingArgs, 'input'>>;
  createMarketplaceItem?: Resolver<ResolversTypes['MarketplaceItem'], ParentType, ContextType, RequireFields<MutationCreateMarketplaceItemArgs, 'input'>>;
  deleteMarketplaceItem?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteMarketplaceItemArgs, 'id'>>;
  reportListing?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationReportListingArgs, 'itemId' | 'reason'>>;
  updateJobListing?: Resolver<ResolversTypes['JobListing'], ParentType, ContextType, RequireFields<MutationUpdateJobListingArgs, 'id' | 'input'>>;
  updateMarketplaceItem?: Resolver<ResolversTypes['MarketplaceItem'], ParentType, ContextType, RequireFields<MutationUpdateMarketplaceItemArgs, 'id' | 'input'>>;
  updateMarketplaceItemStatus?: Resolver<ResolversTypes['MarketplaceItem'], ParentType, ContextType, RequireFields<MutationUpdateMarketplaceItemStatusArgs, 'id' | 'status'>>;
}>;

export type OrganisationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Organisation'] = ResolversParentTypes['Organisation']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Organisation']>, { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;

  isVerified?: Resolver<ResolversTypes['Boolean'], { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  jobListings?: Resolver<Array<ResolversTypes['JobListing']>, { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  name?: Resolver<ResolversTypes['String'], { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  communityGives?: Resolver<Array<ResolversTypes['MarketplaceItem']>, ParentType, ContextType, Partial<QueryCommunityGivesArgs>>;
  jobListing?: Resolver<Maybe<ResolversTypes['JobListing']>, ParentType, ContextType, RequireFields<QueryJobListingArgs, 'id'>>;
  jobListings?: Resolver<ResolversTypes['JobListingConnection'], ParentType, ContextType, Partial<QueryJobListingsArgs>>;
  marketplaceItem?: Resolver<Maybe<ResolversTypes['MarketplaceItem']>, ParentType, ContextType, RequireFields<QueryMarketplaceItemArgs, 'id'>>;
  marketplaceItems?: Resolver<ResolversTypes['MarketplaceItemConnection'], ParentType, ContextType, Partial<QueryMarketplaceItemsArgs>>;
}>;

export type SalaryRangeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SalaryRange'] = ResolversParentTypes['SalaryRange']> = ResolversObject<{
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  max?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  min?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;

  jobApplications?: Resolver<Array<ResolversTypes['JobApplication']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  marketplaceListings?: Resolver<Array<ResolversTypes['MarketplaceItem']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  savedJobs?: Resolver<Array<ResolversTypes['JobListing']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  ConvertedPrice?: ConvertedPriceResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  JobApplication?: JobApplicationResolvers<ContextType>;
  JobListing?: JobListingResolvers<ContextType>;
  JobListingConnection?: JobListingConnectionResolvers<ContextType>;
  MarketplaceItem?: MarketplaceItemResolvers<ContextType>;
  MarketplaceItemConnection?: MarketplaceItemConnectionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Organisation?: OrganisationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SalaryRange?: SalaryRangeResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

