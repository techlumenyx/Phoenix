export type ModerationAction = 'APPROVE' | 'WARN' | 'REMOVE' | 'SUSPEND' | 'BAN';
export type ContentType = 'EVENT' | 'JOB_LISTING' | 'MARKETPLACE_ITEM' | 'USER' | 'ORGANISATION';

export interface IModerationReport {
  _id: string;
  contentId: string;
  contentType: ContentType;
  reportedByUserId: string;
  reason: string;
  createdAt: Date;
}

export interface IAuditLog {
  _id: string;
  adminId: string;
  action: ModerationAction;
  contentId: string;
  contentType: ContentType;
  reason: string;
  createdAt: Date;
}

export interface IFlagRule {
  _id: string;
  name: string;
  description: string;
  condition: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
