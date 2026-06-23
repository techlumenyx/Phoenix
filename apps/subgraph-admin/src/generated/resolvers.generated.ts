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

export const ContentType = {
  Event: 'EVENT',
  JobListing: 'JOB_LISTING',
  MarketplaceItem: 'MARKETPLACE_ITEM',
  Organisation: 'ORGANISATION',
  User: 'USER'
} as const;

export type ContentType = typeof ContentType[keyof typeof ContentType];
export type CreateFlagRuleInput = {
  condition: Scalars['String']['input'];
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export const ModerationAction = {
  Approve: 'APPROVE',
  Ban: 'BAN',
  Remove: 'REMOVE',
  Suspend: 'SUSPEND',
  Warn: 'WARN'
} as const;

export type ModerationAction = typeof ModerationAction[keyof typeof ModerationAction];
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
  createFlagRule: SystemFlagRule;
  flagContent: ModerationReport;
  resolveReport: AuditLog;
  reviewVerification: VerificationQueueItem;
  updateFlagRule: SystemFlagRule;
};


export type MutationCreateFlagRuleArgs = {
  input: CreateFlagRuleInput;
};


export type MutationFlagContentArgs = {
  contentId: Scalars['String']['input'];
  contentType: ContentType;
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


export type MutationUpdateFlagRuleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFlagRuleInput;
};

export type Organisation = {
  __typename?: 'Organisation';
  id: Scalars['ID']['output'];
  verificationRequests: Array<VerificationQueueItem>;
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
  flagRules: Array<SystemFlagRule>;
  moderationQueue: ModerationReportConnection;
  platformStats: PlatformStats;
  verificationQueue: Array<VerificationQueueItem>;
};


export type QueryAuditLogsArgs = {
  adminId?: InputMaybe<Scalars['ID']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryModerationQueueArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ReportStatus>;
};


export type QueryVerificationQueueArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<VerificationStatus>;
};

export const ReportStatus = {
  Pending: 'PENDING',
  Resolved: 'RESOLVED'
} as const;

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];
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

export type UpdateFlagRuleInput = {
  condition?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
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

export const VerificationStatus = {
  Approved: 'APPROVED',
  Pending: 'PENDING',
  Rejected: 'REJECTED'
} as const;

export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];
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
  AuditLog: ResolverTypeWrapper<AuditLog>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  AuditLogConnection: ResolverTypeWrapper<AuditLogConnection>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ContentType: ContentType;
  CreateFlagRuleInput: CreateFlagRuleInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  ModerationAction: ModerationAction;
  ModerationReport: ResolverTypeWrapper<ModerationReport>;
  ModerationReportConnection: ResolverTypeWrapper<ModerationReportConnection>;
  Mutation: ResolverTypeWrapper<{}>;
  Organisation: ResolverTypeWrapper<Organisation>;
  PlatformStats: ResolverTypeWrapper<PlatformStats>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Query: ResolverTypeWrapper<{}>;
  ReportStatus: ReportStatus;
  SystemFlagRule: ResolverTypeWrapper<SystemFlagRule>;
  UpdateFlagRuleInput: UpdateFlagRuleInput;
  User: ResolverTypeWrapper<User>;
  VerificationQueueItem: ResolverTypeWrapper<VerificationQueueItem>;
  VerificationStatus: VerificationStatus;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AuditLog: AuditLog;
  String: Scalars['String']['output'];
  ID: Scalars['ID']['output'];
  AuditLogConnection: AuditLogConnection;
  Boolean: Scalars['Boolean']['output'];
  CreateFlagRuleInput: CreateFlagRuleInput;
  DateTime: Scalars['DateTime']['output'];
  ModerationReport: ModerationReport;
  ModerationReportConnection: ModerationReportConnection;
  Mutation: {};
  Organisation: Organisation;
  PlatformStats: PlatformStats;
  Int: Scalars['Int']['output'];
  Query: {};
  SystemFlagRule: SystemFlagRule;
  UpdateFlagRuleInput: UpdateFlagRuleInput;
  User: User;
  VerificationQueueItem: VerificationQueueItem;
}>;

export type AuditLogResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuditLog'] = ResolversParentTypes['AuditLog']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['AuditLog']>, { __typename: 'AuditLog' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  action?: Resolver<ResolversTypes['ModerationAction'], ParentType, ContextType>;
  admin?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  contentId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contentType?: Resolver<ResolversTypes['ContentType'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuditLogConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuditLogConnection'] = ResolversParentTypes['AuditLogConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['AuditLog']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type ModerationReportResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ModerationReport'] = ResolversParentTypes['ModerationReport']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['ModerationReport']>, { __typename: 'ModerationReport' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  contentId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contentType?: Resolver<ResolversTypes['ContentType'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reportedByUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ReportStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ModerationReportConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ModerationReportConnection'] = ResolversParentTypes['ModerationReportConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['ModerationReport']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createFlagRule?: Resolver<ResolversTypes['SystemFlagRule'], ParentType, ContextType, RequireFields<MutationCreateFlagRuleArgs, 'input'>>;
  flagContent?: Resolver<ResolversTypes['ModerationReport'], ParentType, ContextType, RequireFields<MutationFlagContentArgs, 'contentId' | 'contentType' | 'reason'>>;
  resolveReport?: Resolver<ResolversTypes['AuditLog'], ParentType, ContextType, RequireFields<MutationResolveReportArgs, 'action' | 'reason' | 'reportId'>>;
  reviewVerification?: Resolver<ResolversTypes['VerificationQueueItem'], ParentType, ContextType, RequireFields<MutationReviewVerificationArgs, 'approved' | 'requestId'>>;
  updateFlagRule?: Resolver<ResolversTypes['SystemFlagRule'], ParentType, ContextType, RequireFields<MutationUpdateFlagRuleArgs, 'id' | 'input'>>;
}>;

export type OrganisationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Organisation'] = ResolversParentTypes['Organisation']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Organisation']>, { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;

  verificationRequests?: Resolver<Array<ResolversTypes['VerificationQueueItem']>, { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlatformStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PlatformStats'] = ResolversParentTypes['PlatformStats']> = ResolversObject<{
  activeEvents?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  activeJobListings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  activeMarketplaceItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingModerationReports?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingVerifications?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalUsers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  auditLogs?: Resolver<ResolversTypes['AuditLogConnection'], ParentType, ContextType, Partial<QueryAuditLogsArgs>>;
  flagRules?: Resolver<Array<ResolversTypes['SystemFlagRule']>, ParentType, ContextType>;
  moderationQueue?: Resolver<ResolversTypes['ModerationReportConnection'], ParentType, ContextType, Partial<QueryModerationQueueArgs>>;
  platformStats?: Resolver<ResolversTypes['PlatformStats'], ParentType, ContextType>;
  verificationQueue?: Resolver<Array<ResolversTypes['VerificationQueueItem']>, ParentType, ContextType, Partial<QueryVerificationQueueArgs>>;
}>;

export type SystemFlagRuleResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SystemFlagRule'] = ResolversParentTypes['SystemFlagRule']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['SystemFlagRule']>, { __typename: 'SystemFlagRule' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  condition?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;

  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationQueueItemResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VerificationQueueItem'] = ResolversParentTypes['VerificationQueueItem']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['VerificationQueueItem']>, { __typename: 'VerificationQueueItem' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  documentUrls?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType>;
  rejectionReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reviewedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  reviewedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['VerificationStatus'], ParentType, ContextType>;
  submittedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  AuditLog?: AuditLogResolvers<ContextType>;
  AuditLogConnection?: AuditLogConnectionResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  ModerationReport?: ModerationReportResolvers<ContextType>;
  ModerationReportConnection?: ModerationReportConnectionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Organisation?: OrganisationResolvers<ContextType>;
  PlatformStats?: PlatformStatsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SystemFlagRule?: SystemFlagRuleResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  VerificationQueueItem?: VerificationQueueItemResolvers<ContextType>;
}>;

