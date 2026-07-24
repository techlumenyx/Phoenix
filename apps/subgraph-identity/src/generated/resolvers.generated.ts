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

export const AdminRole = {
  Analyst: 'ANALYST',
  Auditor: 'AUDITOR',
  ContentManager: 'CONTENT_MANAGER',
  SuperAdmin: 'SUPER_ADMIN',
  SupportAgent: 'SUPPORT_AGENT',
  TrustSafety: 'TRUST_SAFETY',
  VerificationReviewer: 'VERIFICATION_REVIEWER'
} as const;

export type AdminRole = typeof AdminRole[keyof typeof AdminRole];
export const AdminStatus = {
  Active: 'ACTIVE',
  Disabled: 'DISABLED'
} as const;

export type AdminStatus = typeof AdminStatus[keyof typeof AdminStatus];
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

export type Mutation = {
  __typename?: 'Mutation';
  acceptOrganisationInvite: Organisation;
  createOrganisation: Organisation;
  createUser: User;
  followOrganisation: Organisation;
  inviteOrganisationMember: OrganisationInvite;
  markAllIdentityOrganisationNotificationsRead: Scalars['Boolean']['output'];
  markIdentityOrganisationNotificationRead: IdentityOrganisationNotification;
  removeOrganisationMember: Scalars['Boolean']['output'];
  resendOrganisationInvite: OrganisationInvite;
  revokeOrganisationInvite: OrganisationInvite;
  setOrganisationActive: Organisation;
  signUp: SignUpPayload;
  submitVerification: VerificationRequest;
  unfollowOrganisation: Organisation;
  updateOrganisation: Organisation;
  updateOrganisationMemberRoles: OrganisationTeamMember;
  updateProfile: User;
};


export type MutationAcceptOrganisationInviteArgs = {
  token: Scalars['String']['input'];
};


export type MutationCreateOrganisationArgs = {
  input: CreateOrganisationInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationFollowOrganisationArgs = {
  organisationId: Scalars['ID']['input'];
};


export type MutationInviteOrganisationMemberArgs = {
  email: Scalars['String']['input'];
  organisationId: Scalars['ID']['input'];
  roles: Array<Scalars['String']['input']>;
};


export type MutationMarkAllIdentityOrganisationNotificationsReadArgs = {
  organisationId: Scalars['ID']['input'];
};


export type MutationMarkIdentityOrganisationNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveOrganisationMemberArgs = {
  organisationId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationResendOrganisationInviteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRevokeOrganisationInviteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSetOrganisationActiveArgs = {
  active: Scalars['Boolean']['input'];
  organisationId: Scalars['ID']['input'];
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationSubmitVerificationArgs = {
  details?: InputMaybe<VerificationDetailsInput>;
  documentUrls: Array<Scalars['String']['input']>;
  organisationId: Scalars['ID']['input'];
  requestedTier?: InputMaybe<VerificationTier>;
};


export type MutationUnfollowOrganisationArgs = {
  organisationId: Scalars['ID']['input'];
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
  followerCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  socialLinks?: Maybe<SocialLinks>;
  updatedAt: Scalars['DateTime']['output'];
  verificationTier: VerificationTier;
  websiteUrl?: Maybe<Scalars['String']['output']>;
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

export const ProfileVisibility = {
  MembersOnly: 'MEMBERS_ONLY',
  Private: 'PRIVATE',
  Public: 'PUBLIC'
} as const;

export type ProfileVisibility = typeof ProfileVisibility[keyof typeof ProfileVisibility];
export type Query = {
  __typename?: 'Query';
  adminMe?: Maybe<Admin>;
  identityOrganisationNotifications: Array<IdentityOrganisationNotification>;
  identityOrganisationUnreadCount: Scalars['Int']['output'];
  isFollowingOrganisation: Scalars['Boolean']['output'];
  me?: Maybe<User>;
  myFollowingOrganisations: Array<Organisation>;
  myOrganisations: Array<Organisation>;
  organisation?: Maybe<Organisation>;
  organisationInvite?: Maybe<OrganisationInvite>;
  organisationInvites: Array<OrganisationInvite>;
  organisationTeam: Array<OrganisationTeamMember>;
  organisations: OrganisationConnection;
  user?: Maybe<User>;
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


export type QueryOrganisationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganisationInviteArgs = {
  token: Scalars['String']['input'];
};


export type QueryOrganisationInvitesArgs = {
  organisationId: Scalars['ID']['input'];
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


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
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
  name: Scalars['String']['output'];
  onboardingCompleted: Scalars['Boolean']['output'];
  orgId?: Maybe<Scalars['ID']['output']>;
  preferences: Array<Scalars['String']['output']>;
  privacySettings: ProfilePrivacySettings;
  region: Scalars['String']['output'];
  regionCode?: Maybe<Scalars['String']['output']>;
  roles: Array<Scalars['String']['output']>;
  socialLinks?: Maybe<SocialLinks>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<User>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type VerificationDetailsInput = {
  officialEmail?: InputMaybe<Scalars['String']['input']>;
  officialName?: InputMaybe<Scalars['String']['input']>;
  pocName?: InputMaybe<Scalars['String']['input']>;
  pocTitle?: InputMaybe<Scalars['String']['input']>;
  registrationNumber?: InputMaybe<Scalars['String']['input']>;
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

export const VerificationStatus = {
  Approved: 'APPROVED',
  Pending: 'PENDING',
  Rejected: 'REJECTED'
} as const;

export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];
export const VerificationTier = {
  Charity: 'CHARITY',
  Ngo: 'NGO',
  None: 'NONE',
  Standard: 'STANDARD'
} as const;

export type VerificationTier = typeof VerificationTier[keyof typeof VerificationTier];
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
  Admin: ResolverTypeWrapper<Admin>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  AdminRole: AdminRole;
  AdminStatus: AdminStatus;
  CreateOrganisationInput: CreateOrganisationInput;
  CreateUserInput: CreateUserInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  FollowRelationship: ResolverTypeWrapper<FollowRelationship>;
  IdentityOrganisationNotification: ResolverTypeWrapper<IdentityOrganisationNotification>;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Organisation: ResolverTypeWrapper<Organisation>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  OrganisationConnection: ResolverTypeWrapper<OrganisationConnection>;
  OrganisationInvite: ResolverTypeWrapper<OrganisationInvite>;
  OrganisationTeamMember: ResolverTypeWrapper<OrganisationTeamMember>;
  ProfilePrivacySettings: ResolverTypeWrapper<ProfilePrivacySettings>;
  ProfilePrivacySettingsInput: ProfilePrivacySettingsInput;
  ProfileVisibility: ProfileVisibility;
  Query: ResolverTypeWrapper<{}>;
  SignUpInput: SignUpInput;
  SignUpPayload: ResolverTypeWrapper<SignUpPayload>;
  SocialLinks: ResolverTypeWrapper<SocialLinks>;
  SocialLinksInput: SocialLinksInput;
  UpdateOrganisationInput: UpdateOrganisationInput;
  UpdateProfileInput: UpdateProfileInput;
  User: ResolverTypeWrapper<User>;
  UserConnection: ResolverTypeWrapper<UserConnection>;
  VerificationDetailsInput: VerificationDetailsInput;
  VerificationRequest: ResolverTypeWrapper<VerificationRequest>;
  VerificationStatus: VerificationStatus;
  VerificationTier: VerificationTier;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Admin: Admin;
  String: Scalars['String']['output'];
  ID: Scalars['ID']['output'];
  CreateOrganisationInput: CreateOrganisationInput;
  CreateUserInput: CreateUserInput;
  DateTime: Scalars['DateTime']['output'];
  FollowRelationship: FollowRelationship;
  IdentityOrganisationNotification: IdentityOrganisationNotification;
  Mutation: {};
  Boolean: Scalars['Boolean']['output'];
  Organisation: Organisation;
  Int: Scalars['Int']['output'];
  OrganisationConnection: OrganisationConnection;
  OrganisationInvite: OrganisationInvite;
  OrganisationTeamMember: OrganisationTeamMember;
  ProfilePrivacySettings: ProfilePrivacySettings;
  ProfilePrivacySettingsInput: ProfilePrivacySettingsInput;
  Query: {};
  SignUpInput: SignUpInput;
  SignUpPayload: SignUpPayload;
  SocialLinks: SocialLinks;
  SocialLinksInput: SocialLinksInput;
  UpdateOrganisationInput: UpdateOrganisationInput;
  UpdateProfileInput: UpdateProfileInput;
  User: User;
  UserConnection: UserConnection;
  VerificationDetailsInput: VerificationDetailsInput;
  VerificationRequest: VerificationRequest;
}>;

export type AdminResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Admin'] = ResolversParentTypes['Admin']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Admin']>, { __typename: 'Admin' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastLoginAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['AdminRole']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AdminStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type FollowRelationshipResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FollowRelationship'] = ResolversParentTypes['FollowRelationship']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['FollowRelationship']>, { __typename: 'FollowRelationship' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  follower?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IdentityOrganisationNotificationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['IdentityOrganisationNotification'] = ResolversParentTypes['IdentityOrganisationNotification']> = ResolversObject<{
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

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  acceptOrganisationInvite?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType, RequireFields<MutationAcceptOrganisationInviteArgs, 'token'>>;
  createOrganisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType, RequireFields<MutationCreateOrganisationArgs, 'input'>>;
  createUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>;
  followOrganisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType, RequireFields<MutationFollowOrganisationArgs, 'organisationId'>>;
  inviteOrganisationMember?: Resolver<ResolversTypes['OrganisationInvite'], ParentType, ContextType, RequireFields<MutationInviteOrganisationMemberArgs, 'email' | 'organisationId' | 'roles'>>;
  markAllIdentityOrganisationNotificationsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMarkAllIdentityOrganisationNotificationsReadArgs, 'organisationId'>>;
  markIdentityOrganisationNotificationRead?: Resolver<ResolversTypes['IdentityOrganisationNotification'], ParentType, ContextType, RequireFields<MutationMarkIdentityOrganisationNotificationReadArgs, 'id'>>;
  removeOrganisationMember?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRemoveOrganisationMemberArgs, 'organisationId' | 'userId'>>;
  resendOrganisationInvite?: Resolver<ResolversTypes['OrganisationInvite'], ParentType, ContextType, RequireFields<MutationResendOrganisationInviteArgs, 'id'>>;
  revokeOrganisationInvite?: Resolver<ResolversTypes['OrganisationInvite'], ParentType, ContextType, RequireFields<MutationRevokeOrganisationInviteArgs, 'id'>>;
  setOrganisationActive?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType, RequireFields<MutationSetOrganisationActiveArgs, 'active' | 'organisationId'>>;
  signUp?: Resolver<ResolversTypes['SignUpPayload'], ParentType, ContextType, RequireFields<MutationSignUpArgs, 'input'>>;
  submitVerification?: Resolver<ResolversTypes['VerificationRequest'], ParentType, ContextType, RequireFields<MutationSubmitVerificationArgs, 'documentUrls' | 'organisationId' | 'requestedTier'>>;
  unfollowOrganisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType, RequireFields<MutationUnfollowOrganisationArgs, 'organisationId'>>;
  updateOrganisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType, RequireFields<MutationUpdateOrganisationArgs, 'id' | 'input'>>;
  updateOrganisationMemberRoles?: Resolver<ResolversTypes['OrganisationTeamMember'], ParentType, ContextType, RequireFields<MutationUpdateOrganisationMemberRolesArgs, 'organisationId' | 'roles' | 'userId'>>;
  updateProfile?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
}>;

export type OrganisationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Organisation'] = ResolversParentTypes['Organisation']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Organisation']>, { __typename: 'Organisation' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deactivatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  followerCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  logoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  socialLinks?: Resolver<Maybe<ResolversTypes['SocialLinks']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  verificationTier?: Resolver<ResolversTypes['VerificationTier'], ParentType, ContextType>;
  websiteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganisationConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OrganisationConnection'] = ResolversParentTypes['OrganisationConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['Organisation']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganisationInviteResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OrganisationInvite'] = ResolversParentTypes['OrganisationInvite']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganisationTeamMemberResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OrganisationTeamMember'] = ResolversParentTypes['OrganisationTeamMember']> = ResolversObject<{
  joinedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfilePrivacySettingsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ProfilePrivacySettings'] = ResolversParentTypes['ProfilePrivacySettings']> = ResolversObject<{
  profileVisibility?: Resolver<ResolversTypes['ProfileVisibility'], ParentType, ContextType>;
  showAvatar?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  showBio?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  showRegion?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  showSocialLinks?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  adminMe?: Resolver<Maybe<ResolversTypes['Admin']>, ParentType, ContextType>;
  identityOrganisationNotifications?: Resolver<Array<ResolversTypes['IdentityOrganisationNotification']>, ParentType, ContextType, RequireFields<QueryIdentityOrganisationNotificationsArgs, 'organisationId'>>;
  identityOrganisationUnreadCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryIdentityOrganisationUnreadCountArgs, 'organisationId'>>;
  isFollowingOrganisation?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryIsFollowingOrganisationArgs, 'organisationId'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  myFollowingOrganisations?: Resolver<Array<ResolversTypes['Organisation']>, ParentType, ContextType>;
  myOrganisations?: Resolver<Array<ResolversTypes['Organisation']>, ParentType, ContextType>;
  organisation?: Resolver<Maybe<ResolversTypes['Organisation']>, ParentType, ContextType, RequireFields<QueryOrganisationArgs, 'id'>>;
  organisationInvite?: Resolver<Maybe<ResolversTypes['OrganisationInvite']>, ParentType, ContextType, RequireFields<QueryOrganisationInviteArgs, 'token'>>;
  organisationInvites?: Resolver<Array<ResolversTypes['OrganisationInvite']>, ParentType, ContextType, RequireFields<QueryOrganisationInvitesArgs, 'organisationId'>>;
  organisationTeam?: Resolver<Array<ResolversTypes['OrganisationTeamMember']>, ParentType, ContextType, RequireFields<QueryOrganisationTeamArgs, 'organisationId'>>;
  organisations?: Resolver<ResolversTypes['OrganisationConnection'], ParentType, ContextType, Partial<QueryOrganisationsArgs>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
}>;

export type SignUpPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SignUpPayload'] = ResolversParentTypes['SignUpPayload']> = ResolversObject<{
  customToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SocialLinksResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SocialLinks'] = ResolversParentTypes['SocialLinks']> = ResolversObject<{
  facebook?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  instagram?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twitter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  whatsapp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & (GraphQLRecursivePick<ParentType, {"id":true}> | GraphQLRecursivePick<ParentType, {"firebaseUid":true}>), ContextType>;
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  onboardingCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  orgId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  preferences?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  privacySettings?: Resolver<ResolversTypes['ProfilePrivacySettings'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  regionCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  socialLinks?: Resolver<Maybe<ResolversTypes['SocialLinks']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserConnection'] = ResolversParentTypes['UserConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationRequestResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VerificationRequest'] = ResolversParentTypes['VerificationRequest']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['VerificationRequest']>, { __typename: 'VerificationRequest' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  documentsUrls?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organisation?: Resolver<ResolversTypes['Organisation'], ParentType, ContextType>;
  rejectionReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reviewedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['VerificationStatus'], ParentType, ContextType>;
  submittedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Admin?: AdminResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  FollowRelationship?: FollowRelationshipResolvers<ContextType>;
  IdentityOrganisationNotification?: IdentityOrganisationNotificationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Organisation?: OrganisationResolvers<ContextType>;
  OrganisationConnection?: OrganisationConnectionResolvers<ContextType>;
  OrganisationInvite?: OrganisationInviteResolvers<ContextType>;
  OrganisationTeamMember?: OrganisationTeamMemberResolvers<ContextType>;
  ProfilePrivacySettings?: ProfilePrivacySettingsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SignUpPayload?: SignUpPayloadResolvers<ContextType>;
  SocialLinks?: SocialLinksResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  VerificationRequest?: VerificationRequestResolvers<ContextType>;
}>;

