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
  DateTime: { input: string; output: string; }
  _FieldSet: { input: any; output: any; }
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

export const EventCategory = {
  BibleStudy: 'BIBLE_STUDY',
  Charity: 'CHARITY',
  Community: 'COMMUNITY',
  Conference: 'CONFERENCE',
  Cultural: 'CULTURAL',
  Music: 'MUSIC',
  Other: 'OTHER',
  Welfare: 'WELFARE',
  Worship: 'WORSHIP',
  Youth: 'YOUTH'
} as const;

export type EventCategory = typeof EventCategory[keyof typeof EventCategory];
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

export const EventStatus = {
  Cancelled: 'CANCELLED',
  Draft: 'DRAFT',
  Past: 'PAST',
  Published: 'PUBLISHED'
} as const;

export type EventStatus = typeof EventStatus[keyof typeof EventStatus];
export const LocationType = {
  Hybrid: 'HYBRID',
  Physical: 'PHYSICAL',
  Virtual: 'VIRTUAL'
} as const;

export type LocationType = typeof LocationType[keyof typeof LocationType];
export type Mutation = {
  __typename?: 'Mutation';
  cancelRsvp: Scalars['Boolean']['output'];
  createEvent: Event;
  deleteEvent: Scalars['Boolean']['output'];
  rsvpToEvent: Rsvp;
  updateEvent: Event;
};


export type MutationCancelRsvpArgs = {
  eventId: Scalars['ID']['input'];
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationDeleteEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRsvpToEventArgs = {
  eventId: Scalars['ID']['input'];
  stage: RsvpStage;
};


export type MutationUpdateEventArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEventInput;
};

export type Organisation = {
  __typename?: 'Organisation';
  events: EventConnection;
  id: Scalars['ID']['output'];
};


export type OrganisationEventsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  event?: Maybe<Event>;
  events: EventConnection;
  featuredEvents: Array<Event>;
  myRsvps: Array<Rsvp>;
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


export type QueryMyRsvpsArgs = {
  stage?: InputMaybe<RsvpStage>;
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

export const RsvpStage = {
  Confirmed: 'CONFIRMED',
  Interested: 'INTERESTED',
  Saved: 'SAVED'
} as const;

export type RsvpStage = typeof RsvpStage[keyof typeof RsvpStage];
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

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
};

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
  CreateEventInput: CreateEventInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Event: ResolverTypeWrapper<Event>;
  EventCategory: EventCategory;
  EventConnection: ResolverTypeWrapper<EventConnection>;
  EventLocation: ResolverTypeWrapper<EventLocation>;
  EventLocationInput: EventLocationInput;
  EventStatus: EventStatus;
  LocationType: LocationType;
  Mutation: ResolverTypeWrapper<{}>;
  Organisation: ResolverTypeWrapper<Organisation>;
  Query: ResolverTypeWrapper<{}>;
  RSVP: ResolverTypeWrapper<Rsvp>;
  RsvpStage: RsvpStage;
  UpdateEventInput: UpdateEventInput;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  CreateEventInput: CreateEventInput;
  Int: Scalars['Int']['output'];
  String: Scalars['String']['output'];
  ID: Scalars['ID']['output'];
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  Event: Event;
  EventConnection: EventConnection;
  EventLocation: EventLocation;
  EventLocationInput: EventLocationInput;
  Mutation: {};
  Organisation: Organisation;
  Query: {};
  RSVP: Rsvp;
  UpdateEventInput: UpdateEventInput;
  User: User;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Event']>, { __typename: 'Event' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  capacityLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['EventCategory'], ParentType, ContextType>;
  confirmedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  externalTicketUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hosts?: Resolver<Array<ResolversTypes['Organisation']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrls?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  interestedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isPromoted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isRecurring?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['EventLocation'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rsvpCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  savedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  seriesId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['EventStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  waitlistCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EventConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['EventConnection'] = ResolversParentTypes['EventConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EventLocationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['EventLocation'] = ResolversParentTypes['EventLocation']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['LocationType'], ParentType, ContextType>;
  virtualLink?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  cancelRsvp?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCancelRsvpArgs, 'eventId'>>;
  createEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationCreateEventArgs, 'input'>>;
  deleteEvent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteEventArgs, 'id'>>;
  rsvpToEvent?: Resolver<ResolversTypes['RSVP'], ParentType, ContextType, RequireFields<MutationRsvpToEventArgs, 'eventId' | 'stage'>>;
  updateEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationUpdateEventArgs, 'id' | 'input'>>;
}>;

export type OrganisationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Organisation'] = ResolversParentTypes['Organisation']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Organisation']>, { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  events?: Resolver<ResolversTypes['EventConnection'], { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType, Partial<OrganisationEventsArgs>>;

  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'id'>>;
  events?: Resolver<ResolversTypes['EventConnection'], ParentType, ContextType, Partial<QueryEventsArgs>>;
  featuredEvents?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, Partial<QueryFeaturedEventsArgs>>;
  myRsvps?: Resolver<Array<ResolversTypes['RSVP']>, ParentType, ContextType, Partial<QueryMyRsvpsArgs>>;
}>;

export type RsvpResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RSVP'] = ResolversParentTypes['RSVP']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['RSVP']>, { __typename: 'RSVP' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  event?: Resolver<ResolversTypes['Event'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['RsvpStage'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;

  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  DateTime?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  EventConnection?: EventConnectionResolvers<ContextType>;
  EventLocation?: EventLocationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Organisation?: OrganisationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RSVP?: RsvpResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

