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

export const AccountAction = {
  Reactivate: 'REACTIVATE',
  Suspend: 'SUSPEND',
  Warn: 'WARN'
} as const;

export type AccountAction = typeof AccountAction[keyof typeof AccountAction];
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

export const AdminNotificationType = {
  ActionFailed: 'ACTION_FAILED',
  Assignment: 'ASSIGNMENT',
  Escalation: 'ESCALATION',
  Mention: 'MENTION',
  SlaWarning: 'SLA_WARNING'
} as const;

export type AdminNotificationType = typeof AdminNotificationType[keyof typeof AdminNotificationType];
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

export const AdminTemplateType = {
  Rejection: 'REJECTION',
  Removal: 'REMOVAL',
  Suspension: 'SUSPENSION',
  Verification: 'VERIFICATION',
  Warning: 'WARNING'
} as const;

export type AdminTemplateType = typeof AdminTemplateType[keyof typeof AdminTemplateType];
export const AuditAction = {
  AccessDocument: 'ACCESS_DOCUMENT',
  AccessPrivateData: 'ACCESS_PRIVATE_DATA',
  AccountReactivate: 'ACCOUNT_REACTIVATE',
  AccountSuspend: 'ACCOUNT_SUSPEND',
  AccountWarn: 'ACCOUNT_WARN',
  AddNote: 'ADD_NOTE',
  Assign: 'ASSIGN',
  Dismiss: 'DISMISS',
  DownloadAuditExport: 'DOWNLOAD_AUDIT_EXPORT',
  EmailRetry: 'EMAIL_RETRY',
  EventCancel: 'EVENT_CANCEL',
  EventRestore: 'EVENT_RESTORE',
  NotificationRead: 'NOTIFICATION_READ',
  PlacementCreate: 'PLACEMENT_CREATE',
  PlacementDuplicate: 'PLACEMENT_DUPLICATE',
  PlacementPause: 'PLACEMENT_PAUSE',
  PlacementReorder: 'PLACEMENT_REORDER',
  PlacementUpdate: 'PLACEMENT_UPDATE',
  Remove: 'REMOVE',
  RequestAuditExport: 'REQUEST_AUDIT_EXPORT',
  SavedViewCreate: 'SAVED_VIEW_CREATE',
  SavedViewDelete: 'SAVED_VIEW_DELETE',
  TemplateActivate: 'TEMPLATE_ACTIVATE',
  TemplateCreate: 'TEMPLATE_CREATE',
  VerificationApprove: 'VERIFICATION_APPROVE',
  VerificationAssign: 'VERIFICATION_ASSIGN',
  VerificationNeedsInformation: 'VERIFICATION_NEEDS_INFORMATION',
  VerificationReject: 'VERIFICATION_REJECT',
  Warn: 'WARN'
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];
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

export const AuditExportStatus = {
  Expired: 'EXPIRED',
  Failed: 'FAILED',
  Pending: 'PENDING',
  Ready: 'READY'
} as const;

export type AuditExportStatus = typeof AuditExportStatus[keyof typeof AuditExportStatus];
export const AuditResult = {
  Failed: 'FAILED',
  Success: 'SUCCESS'
} as const;

export type AuditResult = typeof AuditResult[keyof typeof AuditResult];
export type CaseNote = {
  __typename?: 'CaseNote';
  authorFirebaseUid: Scalars['String']['output'];
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export const ContentType = {
  AuditExport: 'AUDIT_EXPORT',
  EmailDelivery: 'EMAIL_DELIVERY',
  Event: 'EVENT',
  FeaturedPlacement: 'FEATURED_PLACEMENT',
  Job: 'JOB',
  MarketplaceItem: 'MARKETPLACE_ITEM',
  Organisation: 'ORGANISATION',
  OrganisationVerification: 'ORGANISATION_VERIFICATION',
  SavedView: 'SAVED_VIEW',
  Template: 'TEMPLATE',
  User: 'USER'
} as const;

export type ContentType = typeof ContentType[keyof typeof ContentType];
export const DirectoryEntityType = {
  Event: 'EVENT',
  Job: 'JOB',
  MarketplaceItem: 'MARKETPLACE_ITEM',
  Organisation: 'ORGANISATION',
  User: 'USER'
} as const;

export type DirectoryEntityType = typeof DirectoryEntityType[keyof typeof DirectoryEntityType];
export type EmailDelivery = {
  __typename?: 'EmailDelivery';
  attemptCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['String']['output']>;
  events: Array<EmailDeliveryEvent>;
  id: Scalars['ID']['output'];
  provider: Scalars['String']['output'];
  providerMessageId?: Maybe<Scalars['String']['output']>;
  queuedAt?: Maybe<Scalars['DateTime']['output']>;
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  sourceEntityId?: Maybe<Scalars['String']['output']>;
  sourceEntityType?: Maybe<Scalars['String']['output']>;
  sourceService?: Maybe<Scalars['String']['output']>;
  status: EmailDeliveryStatus;
  subject: Scalars['String']['output'];
  templateKey: Scalars['String']['output'];
  to: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type EmailDeliveryConnection = {
  __typename?: 'EmailDeliveryConnection';
  edges: Array<EmailDelivery>;
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type EmailDeliveryEvent = {
  __typename?: 'EmailDeliveryEvent';
  event: Scalars['String']['output'];
  occurredAt: Scalars['DateTime']['output'];
  response?: Maybe<Scalars['String']['output']>;
};

export const EmailDeliveryStatus = {
  Accepted: 'ACCEPTED',
  Failed: 'FAILED',
  Queued: 'QUEUED',
  Sent: 'SENT',
  Suppressed: 'SUPPRESSED'
} as const;

export type EmailDeliveryStatus = typeof EmailDeliveryStatus[keyof typeof EmailDeliveryStatus];
export const EventActionScope = {
  Occurrence: 'OCCURRENCE',
  Series: 'SERIES'
} as const;

export type EventActionScope = typeof EventActionScope[keyof typeof EventActionScope];
export const EventAdminAction = {
  Cancel: 'CANCEL',
  Restore: 'RESTORE'
} as const;

export type EventAdminAction = typeof EventAdminAction[keyof typeof EventAdminAction];
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

export const ModerationAction = {
  Dismiss: 'DISMISS',
  Remove: 'REMOVE',
  Warn: 'WARN'
} as const;

export type ModerationAction = typeof ModerationAction[keyof typeof ModerationAction];
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

export const ModerationCaseStatus = {
  Open: 'OPEN',
  PendingReview: 'PENDING_REVIEW',
  Resolved: 'RESOLVED'
} as const;

export type ModerationCaseStatus = typeof ModerationCaseStatus[keyof typeof ModerationCaseStatus];
export const ModerationPriority = {
  Critical: 'CRITICAL',
  High: 'HIGH',
  Normal: 'NORMAL'
} as const;

export type ModerationPriority = typeof ModerationPriority[keyof typeof ModerationPriority];
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
  accessDirectoryPrivateData: Scalars['String']['output'];
  accessVerificationDocument: Scalars['String']['output'];
  activateAdminTemplate: AdminTemplate;
  addModerationCaseNote: CaseNote;
  applyAccountAction: AdminDirectoryItem;
  applyEventAction: Scalars['Boolean']['output'];
  assignModerationCase: ModerationCase;
  assignVerificationSubmission: VerificationSubmission;
  createAdminTemplate: AdminTemplate;
  createFeaturedPlacement: FeaturedPlacement;
  decideVerificationSubmission: VerificationSubmission;
  deleteSavedAdminView: Scalars['Boolean']['output'];
  duplicateFeaturedPlacement: FeaturedPlacement;
  markAdminNotificationRead: AdminNotification;
  markAllAdminNotificationsRead: Scalars['Boolean']['output'];
  pauseFeaturedPlacement: FeaturedPlacement;
  reorderFeaturedPlacement: FeaturedPlacement;
  requestAuditExport: AuditExport;
  resolveModerationCase: ModerationCase;
  retryEmailDelivery: EmailDelivery;
  saveAdminView: SavedAdminView;
  updateFeaturedPlacement: FeaturedPlacement;
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


export type MutationAssignModerationCaseArgs = {
  assigneeFirebaseUid?: InputMaybe<Scalars['String']['input']>;
  expectedVersion: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
};


export type MutationAssignVerificationSubmissionArgs = {
  assigneeFirebaseUid?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationCreateAdminTemplateArgs = {
  internalGuidance?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  publicMessage: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: AdminTemplateType;
};


export type MutationCreateFeaturedPlacementArgs = {
  input: FeaturedPlacementInput;
};


export type MutationDecideVerificationSubmissionArgs = {
  action: VerificationDecision;
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  tier?: InputMaybe<VerificationTier>;
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


export type MutationMarkAdminNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPauseFeaturedPlacementArgs = {
  id: Scalars['ID']['input'];
  paused: Scalars['Boolean']['input'];
};


export type MutationReorderFeaturedPlacementArgs = {
  id: Scalars['ID']['input'];
  rank: Scalars['Int']['input'];
};


export type MutationRequestAuditExportArgs = {
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
};


export type MutationResolveModerationCaseArgs = {
  action: ModerationAction;
  expectedVersion: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRetryEmailDeliveryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSaveAdminViewArgs = {
  filtersJson: Scalars['String']['input'];
  module: SavedViewModule;
  name: Scalars['String']['input'];
};


export type MutationUpdateFeaturedPlacementArgs = {
  id: Scalars['ID']['input'];
  input: FeaturedPlacementInput;
};

export const PlacementSource = {
  Editorial: 'EDITORIAL',
  Promotion: 'PROMOTION'
} as const;

export type PlacementSource = typeof PlacementSource[keyof typeof PlacementSource];
export const PlacementStatus = {
  Active: 'ACTIVE',
  Expired: 'EXPIRED',
  Paused: 'PAUSED',
  Scheduled: 'SCHEDULED'
} as const;

export type PlacementStatus = typeof PlacementStatus[keyof typeof PlacementStatus];
export const PlacementTargetType = {
  Announcement: 'ANNOUNCEMENT',
  Event: 'EVENT',
  Job: 'JOB',
  MarketplaceItem: 'MARKETPLACE_ITEM',
  Organisation: 'ORGANISATION'
} as const;

export type PlacementTargetType = typeof PlacementTargetType[keyof typeof PlacementTargetType];
export type Query = {
  __typename?: 'Query';
  adminDashboardStats: AdminDashboardStats;
  adminDirectory: AdminDirectoryConnection;
  adminNotificationUnreadCount: Scalars['Int']['output'];
  adminNotifications: Array<AdminNotification>;
  adminSystemHealth: AdminSystemHealth;
  adminTemplates: Array<AdminTemplate>;
  auditEvents: AuditEventConnection;
  auditExportContent: Scalars['String']['output'];
  auditExports: Array<AuditExport>;
  emailDeliveries: EmailDeliveryConnection;
  featuredPlacements: Array<FeaturedPlacement>;
  moderationCase?: Maybe<ModerationCase>;
  moderationCases: ModerationCaseConnection;
  savedAdminViews: Array<SavedAdminView>;
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


export type QueryEmailDeliveriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EmailDeliveryStatus>;
  templateKey?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFeaturedPlacementsArgs = {
  region?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PlacementStatus>;
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


export type QuerySavedAdminViewsArgs = {
  module?: InputMaybe<SavedViewModule>;
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

export const ReportReasonCode = {
  Duplicate: 'DUPLICATE',
  FraudScam: 'FRAUD_SCAM',
  Inappropriate: 'INAPPROPRIATE',
  Other: 'OTHER',
  ProhibitedUnsafe: 'PROHIBITED_UNSAFE',
  SpamMisleading: 'SPAM_MISLEADING'
} as const;

export type ReportReasonCode = typeof ReportReasonCode[keyof typeof ReportReasonCode];
export type SavedAdminView = {
  __typename?: 'SavedAdminView';
  createdAt: Scalars['DateTime']['output'];
  filtersJson: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  module: SavedViewModule;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export const SavedViewModule = {
  Audit: 'AUDIT',
  Curation: 'CURATION',
  Directory: 'DIRECTORY',
  Moderation: 'MODERATION',
  Verification: 'VERIFICATION'
} as const;

export type SavedViewModule = typeof SavedViewModule[keyof typeof SavedViewModule];
export type SystemDependency = {
  __typename?: 'SystemDependency';
  category: Scalars['String']['output'];
  checkedAt: Scalars['DateTime']['output'];
  detail: Scalars['String']['output'];
  latencyMs?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export const VerificationDecision = {
  Approve: 'APPROVE',
  NeedsInformation: 'NEEDS_INFORMATION',
  Reject: 'REJECT'
} as const;

export type VerificationDecision = typeof VerificationDecision[keyof typeof VerificationDecision];
export const VerificationReviewStatus = {
  Approved: 'APPROVED',
  NeedsInformation: 'NEEDS_INFORMATION',
  PendingReview: 'PENDING_REVIEW',
  Rejected: 'REJECTED'
} as const;

export type VerificationReviewStatus = typeof VerificationReviewStatus[keyof typeof VerificationReviewStatus];
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
  AccountAction: AccountAction;
  AdminDashboardStats: ResolverTypeWrapper<AdminDashboardStats>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  AdminDirectoryConnection: ResolverTypeWrapper<AdminDirectoryConnection>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  AdminDirectoryItem: ResolverTypeWrapper<AdminDirectoryItem>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  AdminNotification: ResolverTypeWrapper<AdminNotification>;
  AdminNotificationType: AdminNotificationType;
  AdminSystemHealth: ResolverTypeWrapper<AdminSystemHealth>;
  AdminTemplate: ResolverTypeWrapper<AdminTemplate>;
  AdminTemplateType: AdminTemplateType;
  AuditAction: AuditAction;
  AuditEvent: ResolverTypeWrapper<AuditEvent>;
  AuditEventConnection: ResolverTypeWrapper<AuditEventConnection>;
  AuditExport: ResolverTypeWrapper<AuditExport>;
  AuditExportStatus: AuditExportStatus;
  AuditResult: AuditResult;
  CaseNote: ResolverTypeWrapper<CaseNote>;
  ContentType: ContentType;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DirectoryEntityType: DirectoryEntityType;
  EmailDelivery: ResolverTypeWrapper<EmailDelivery>;
  EmailDeliveryConnection: ResolverTypeWrapper<EmailDeliveryConnection>;
  EmailDeliveryEvent: ResolverTypeWrapper<EmailDeliveryEvent>;
  EmailDeliveryStatus: EmailDeliveryStatus;
  EventActionScope: EventActionScope;
  EventAdminAction: EventAdminAction;
  FeaturedPlacement: ResolverTypeWrapper<FeaturedPlacement>;
  FeaturedPlacementInput: FeaturedPlacementInput;
  ModerationAction: ModerationAction;
  ModerationCase: ResolverTypeWrapper<ModerationCase>;
  ModerationCaseConnection: ResolverTypeWrapper<ModerationCaseConnection>;
  ModerationCaseStatus: ModerationCaseStatus;
  ModerationPriority: ModerationPriority;
  ModerationReport: ResolverTypeWrapper<ModerationReport>;
  Mutation: ResolverTypeWrapper<{}>;
  PlacementSource: PlacementSource;
  PlacementStatus: PlacementStatus;
  PlacementTargetType: PlacementTargetType;
  Query: ResolverTypeWrapper<{}>;
  ReportReasonCode: ReportReasonCode;
  SavedAdminView: ResolverTypeWrapper<SavedAdminView>;
  SavedViewModule: SavedViewModule;
  SystemDependency: ResolverTypeWrapper<SystemDependency>;
  VerificationDecision: VerificationDecision;
  VerificationReviewStatus: VerificationReviewStatus;
  VerificationSubmission: ResolverTypeWrapper<VerificationSubmission>;
  VerificationSubmissionConnection: ResolverTypeWrapper<VerificationSubmissionConnection>;
  VerificationTier: VerificationTier;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AdminDashboardStats: AdminDashboardStats;
  Int: Scalars['Int']['output'];
  AdminDirectoryConnection: AdminDirectoryConnection;
  String: Scalars['String']['output'];
  Boolean: Scalars['Boolean']['output'];
  AdminDirectoryItem: AdminDirectoryItem;
  ID: Scalars['ID']['output'];
  AdminNotification: AdminNotification;
  AdminSystemHealth: AdminSystemHealth;
  AdminTemplate: AdminTemplate;
  AuditEvent: AuditEvent;
  AuditEventConnection: AuditEventConnection;
  AuditExport: AuditExport;
  CaseNote: CaseNote;
  DateTime: Scalars['DateTime']['output'];
  EmailDelivery: EmailDelivery;
  EmailDeliveryConnection: EmailDeliveryConnection;
  EmailDeliveryEvent: EmailDeliveryEvent;
  FeaturedPlacement: FeaturedPlacement;
  FeaturedPlacementInput: FeaturedPlacementInput;
  ModerationCase: ModerationCase;
  ModerationCaseConnection: ModerationCaseConnection;
  ModerationReport: ModerationReport;
  Mutation: {};
  Query: {};
  SavedAdminView: SavedAdminView;
  SystemDependency: SystemDependency;
  VerificationSubmission: VerificationSubmission;
  VerificationSubmissionConnection: VerificationSubmissionConnection;
}>;

export type AdminDashboardStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminDashboardStats'] = ResolversParentTypes['AdminDashboardStats']> = ResolversObject<{
  openModerationCases?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  overdueVerifications?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingVerifications?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  resolvedModerationLast7Days?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  verificationDecisionsLast7Days?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AdminDirectoryConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminDirectoryConnection'] = ResolversParentTypes['AdminDirectoryConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['AdminDirectoryItem']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AdminDirectoryItemResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminDirectoryItem'] = ResolversParentTypes['AdminDirectoryItem']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['AdminDirectoryItem']>, { __typename: 'AdminDirectoryItem' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organisationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerFirebaseUid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  privateSummary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  seriesId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sourceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subtitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['DirectoryEntityType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AdminNotificationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminNotification'] = ResolversParentTypes['AdminNotification']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['AdminNotification']>, { __typename: 'AdminNotification' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  href?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AdminNotificationType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AdminSystemHealthResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminSystemHealth'] = ResolversParentTypes['AdminSystemHealth']> = ResolversObject<{
  checkedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dependencies?: Resolver<Array<ResolversTypes['SystemDependency']>, ParentType, ContextType>;
  overallStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AdminTemplateResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminTemplate'] = ResolversParentTypes['AdminTemplate']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['AdminTemplate']>, { __typename: 'AdminTemplate' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdByFirebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  history?: Resolver<Array<ResolversTypes['AdminTemplate']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  internalGuidance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locale?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  publicMessage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AdminTemplateType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuditEventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuditEvent'] = ResolversParentTypes['AuditEvent']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['AuditEvent']>, { __typename: 'AuditEvent' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  action?: Resolver<ResolversTypes['AuditAction'], ParentType, ContextType>;
  adminFirebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  adminRoles?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  afterStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  beforeStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ipAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requestId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  result?: Resolver<ResolversTypes['AuditResult'], ParentType, ContextType>;
  route?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetType?: Resolver<ResolversTypes['ContentType'], ParentType, ContextType>;
  userAgent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuditEventConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuditEventConnection'] = ResolversParentTypes['AuditEventConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['AuditEvent']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuditExportResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuditExport'] = ResolversParentTypes['AuditExport']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['AuditExport']>, { __typename: 'AuditExport' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  failureReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  from?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  requesterEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requesterFirebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rowCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AuditExportStatus'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CaseNoteResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CaseNote'] = ResolversParentTypes['CaseNote']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['CaseNote']>, { __typename: 'CaseNote' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  authorFirebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EmailDeliveryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['EmailDelivery'] = ResolversParentTypes['EmailDelivery']> = ResolversObject<{
  attemptCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  events?: Resolver<Array<ResolversTypes['EmailDeliveryEvent']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  providerMessageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  queuedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sentAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sourceEntityId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sourceEntityType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sourceService?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['EmailDeliveryStatus'], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  templateKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EmailDeliveryConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['EmailDeliveryConnection'] = ResolversParentTypes['EmailDeliveryConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['EmailDelivery']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EmailDeliveryEventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['EmailDeliveryEvent'] = ResolversParentTypes['EmailDeliveryEvent']> = ResolversObject<{
  event?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  occurredAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  response?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FeaturedPlacementResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FeaturedPlacement'] = ResolversParentTypes['FeaturedPlacement']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['FeaturedPlacement']>, { __typename: 'FeaturedPlacement' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdByFirebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  destinationUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endsAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageAlt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  placementSource?: Resolver<ResolversTypes['PlacementSource'], ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  regions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  startsAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PlacementStatus'], ParentType, ContextType>;
  targetId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  targetType?: Resolver<ResolversTypes['PlacementTargetType'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  updatedByFirebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ModerationCaseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ModerationCase'] = ResolversParentTypes['ModerationCase']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['ModerationCase']>, { __typename: 'ModerationCase' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  assigneeFirebaseUid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  auditTimeline?: Resolver<Array<ResolversTypes['AuditEvent']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Array<ResolversTypes['CaseNote']>, ParentType, ContextType>;
  organisationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerFirebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  previousStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['ModerationPriority'], ParentType, ContextType>;
  reasonCodes?: Resolver<Array<ResolversTypes['ReportReasonCode']>, ParentType, ContextType>;
  reportCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reports?: Resolver<Array<ResolversTypes['ModerationReport']>, ParentType, ContextType>;
  resolutionAction?: Resolver<Maybe<ResolversTypes['ModerationAction']>, ParentType, ContextType>;
  resolutionReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resolvedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  resolvedByFirebaseUid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ModerationCaseStatus'], ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetType?: Resolver<ResolversTypes['ContentType'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ModerationCaseConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ModerationCaseConnection'] = ResolversParentTypes['ModerationCaseConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['ModerationCase']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ModerationReportResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ModerationReport'] = ResolversParentTypes['ModerationReport']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['ModerationReport']>, { __typename: 'ModerationReport' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  details?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reasonCode?: Resolver<ResolversTypes['ReportReasonCode'], ParentType, ContextType>;
  reporterFirebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  accessDirectoryPrivateData?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationAccessDirectoryPrivateDataArgs, 'id' | 'reason' | 'type'>>;
  accessVerificationDocument?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationAccessVerificationDocumentArgs, 'documentIndex' | 'id'>>;
  activateAdminTemplate?: Resolver<ResolversTypes['AdminTemplate'], ParentType, ContextType, RequireFields<MutationActivateAdminTemplateArgs, 'id'>>;
  addModerationCaseNote?: Resolver<ResolversTypes['CaseNote'], ParentType, ContextType, RequireFields<MutationAddModerationCaseNoteArgs, 'body' | 'caseId'>>;
  applyAccountAction?: Resolver<ResolversTypes['AdminDirectoryItem'], ParentType, ContextType, RequireFields<MutationApplyAccountActionArgs, 'action' | 'id' | 'reason' | 'type'>>;
  applyEventAction?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationApplyEventActionArgs, 'action' | 'id' | 'reason' | 'scope'>>;
  assignModerationCase?: Resolver<ResolversTypes['ModerationCase'], ParentType, ContextType, RequireFields<MutationAssignModerationCaseArgs, 'expectedVersion' | 'id'>>;
  assignVerificationSubmission?: Resolver<ResolversTypes['VerificationSubmission'], ParentType, ContextType, RequireFields<MutationAssignVerificationSubmissionArgs, 'id'>>;
  createAdminTemplate?: Resolver<ResolversTypes['AdminTemplate'], ParentType, ContextType, RequireFields<MutationCreateAdminTemplateArgs, 'key' | 'publicMessage' | 'title' | 'type'>>;
  createFeaturedPlacement?: Resolver<ResolversTypes['FeaturedPlacement'], ParentType, ContextType, RequireFields<MutationCreateFeaturedPlacementArgs, 'input'>>;
  decideVerificationSubmission?: Resolver<ResolversTypes['VerificationSubmission'], ParentType, ContextType, RequireFields<MutationDecideVerificationSubmissionArgs, 'action' | 'id' | 'reason'>>;
  deleteSavedAdminView?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteSavedAdminViewArgs, 'id'>>;
  duplicateFeaturedPlacement?: Resolver<ResolversTypes['FeaturedPlacement'], ParentType, ContextType, RequireFields<MutationDuplicateFeaturedPlacementArgs, 'endsAt' | 'id' | 'rank' | 'startsAt'>>;
  markAdminNotificationRead?: Resolver<ResolversTypes['AdminNotification'], ParentType, ContextType, RequireFields<MutationMarkAdminNotificationReadArgs, 'id'>>;
  markAllAdminNotificationsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  pauseFeaturedPlacement?: Resolver<ResolversTypes['FeaturedPlacement'], ParentType, ContextType, RequireFields<MutationPauseFeaturedPlacementArgs, 'id' | 'paused'>>;
  reorderFeaturedPlacement?: Resolver<ResolversTypes['FeaturedPlacement'], ParentType, ContextType, RequireFields<MutationReorderFeaturedPlacementArgs, 'id' | 'rank'>>;
  requestAuditExport?: Resolver<ResolversTypes['AuditExport'], ParentType, ContextType, RequireFields<MutationRequestAuditExportArgs, 'from' | 'to'>>;
  resolveModerationCase?: Resolver<ResolversTypes['ModerationCase'], ParentType, ContextType, RequireFields<MutationResolveModerationCaseArgs, 'action' | 'expectedVersion' | 'id' | 'reason'>>;
  retryEmailDelivery?: Resolver<ResolversTypes['EmailDelivery'], ParentType, ContextType, RequireFields<MutationRetryEmailDeliveryArgs, 'id'>>;
  saveAdminView?: Resolver<ResolversTypes['SavedAdminView'], ParentType, ContextType, RequireFields<MutationSaveAdminViewArgs, 'filtersJson' | 'module' | 'name'>>;
  updateFeaturedPlacement?: Resolver<ResolversTypes['FeaturedPlacement'], ParentType, ContextType, RequireFields<MutationUpdateFeaturedPlacementArgs, 'id' | 'input'>>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  adminDashboardStats?: Resolver<ResolversTypes['AdminDashboardStats'], ParentType, ContextType>;
  adminDirectory?: Resolver<ResolversTypes['AdminDirectoryConnection'], ParentType, ContextType, RequireFields<QueryAdminDirectoryArgs, 'type'>>;
  adminNotificationUnreadCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  adminNotifications?: Resolver<Array<ResolversTypes['AdminNotification']>, ParentType, ContextType, Partial<QueryAdminNotificationsArgs>>;
  adminSystemHealth?: Resolver<ResolversTypes['AdminSystemHealth'], ParentType, ContextType>;
  adminTemplates?: Resolver<Array<ResolversTypes['AdminTemplate']>, ParentType, ContextType, Partial<QueryAdminTemplatesArgs>>;
  auditEvents?: Resolver<ResolversTypes['AuditEventConnection'], ParentType, ContextType, Partial<QueryAuditEventsArgs>>;
  auditExportContent?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryAuditExportContentArgs, 'id'>>;
  auditExports?: Resolver<Array<ResolversTypes['AuditExport']>, ParentType, ContextType>;
  emailDeliveries?: Resolver<ResolversTypes['EmailDeliveryConnection'], ParentType, ContextType, Partial<QueryEmailDeliveriesArgs>>;
  featuredPlacements?: Resolver<Array<ResolversTypes['FeaturedPlacement']>, ParentType, ContextType, Partial<QueryFeaturedPlacementsArgs>>;
  moderationCase?: Resolver<Maybe<ResolversTypes['ModerationCase']>, ParentType, ContextType, RequireFields<QueryModerationCaseArgs, 'id'>>;
  moderationCases?: Resolver<ResolversTypes['ModerationCaseConnection'], ParentType, ContextType, Partial<QueryModerationCasesArgs>>;
  savedAdminViews?: Resolver<Array<ResolversTypes['SavedAdminView']>, ParentType, ContextType, Partial<QuerySavedAdminViewsArgs>>;
  verificationSubmission?: Resolver<Maybe<ResolversTypes['VerificationSubmission']>, ParentType, ContextType, RequireFields<QueryVerificationSubmissionArgs, 'id'>>;
  verificationSubmissions?: Resolver<ResolversTypes['VerificationSubmissionConnection'], ParentType, ContextType, Partial<QueryVerificationSubmissionsArgs>>;
}>;

export type SavedAdminViewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SavedAdminView'] = ResolversParentTypes['SavedAdminView']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['SavedAdminView']>, { __typename: 'SavedAdminView' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  filtersJson?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  module?: Resolver<ResolversTypes['SavedViewModule'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SystemDependencyResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SystemDependency'] = ResolversParentTypes['SystemDependency']> = ResolversObject<{
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  checkedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  detail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  latencyMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationSubmissionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VerificationSubmission'] = ResolversParentTypes['VerificationSubmission']> = ResolversObject<{
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['VerificationSubmission']>, { __typename: 'VerificationSubmission' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  approvedTier?: Resolver<Maybe<ResolversTypes['VerificationTier']>, ParentType, ContextType>;
  assigneeFirebaseUid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  auditTimeline?: Resolver<Array<ResolversTypes['AuditEvent']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  decisionReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  documentLabels?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  dueAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  history?: Resolver<Array<ResolversTypes['VerificationSubmission']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  officialEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  officialName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  organisationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organisationName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organisationType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerFirebaseUid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pocName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pocTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registrationNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requestedTier?: Resolver<ResolversTypes['VerificationTier'], ParentType, ContextType>;
  reviewedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  reviewedByFirebaseUid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['VerificationReviewStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationSubmissionConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VerificationSubmissionConnection'] = ResolversParentTypes['VerificationSubmissionConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['VerificationSubmission']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  AdminDashboardStats?: AdminDashboardStatsResolvers<ContextType>;
  AdminDirectoryConnection?: AdminDirectoryConnectionResolvers<ContextType>;
  AdminDirectoryItem?: AdminDirectoryItemResolvers<ContextType>;
  AdminNotification?: AdminNotificationResolvers<ContextType>;
  AdminSystemHealth?: AdminSystemHealthResolvers<ContextType>;
  AdminTemplate?: AdminTemplateResolvers<ContextType>;
  AuditEvent?: AuditEventResolvers<ContextType>;
  AuditEventConnection?: AuditEventConnectionResolvers<ContextType>;
  AuditExport?: AuditExportResolvers<ContextType>;
  CaseNote?: CaseNoteResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  EmailDelivery?: EmailDeliveryResolvers<ContextType>;
  EmailDeliveryConnection?: EmailDeliveryConnectionResolvers<ContextType>;
  EmailDeliveryEvent?: EmailDeliveryEventResolvers<ContextType>;
  FeaturedPlacement?: FeaturedPlacementResolvers<ContextType>;
  ModerationCase?: ModerationCaseResolvers<ContextType>;
  ModerationCaseConnection?: ModerationCaseConnectionResolvers<ContextType>;
  ModerationReport?: ModerationReportResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SavedAdminView?: SavedAdminViewResolvers<ContextType>;
  SystemDependency?: SystemDependencyResolvers<ContextType>;
  VerificationSubmission?: VerificationSubmissionResolvers<ContextType>;
  VerificationSubmissionConnection?: VerificationSubmissionConnectionResolvers<ContextType>;
}>;

