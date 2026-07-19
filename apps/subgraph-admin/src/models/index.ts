import mongoose, { type Connection } from 'mongoose';
import { ModerationReportSchema, type IModerationReport } from './moderation-report.model';
import { ModerationCaseSchema, type IModerationCase } from './moderation-case.model';
import { CaseNoteSchema, type ICaseNote } from './case-note.model';
import { AuditEventSchema, type IAuditEvent } from './audit-event.model';
import { VerificationSubmissionSchema, type IVerificationSubmission } from './verification-submission.model';
import { AdminTemplateSchema, type IAdminTemplate } from './admin-template.model';
import { FeaturedPlacementSchema, type IFeaturedPlacement } from './featured-placement.model';
import { SavedAdminViewSchema, type ISavedAdminView } from './saved-admin-view.model';
import { AdminNotificationSchema, type IAdminNotification } from './admin-notification.model';
import { AuditExportSchema, type IAuditExport } from './audit-export.model';
import { AdminCommandSchema, type IAdminCommand } from './admin-command.model';
import { MediaAssetSchema, type IMediaAsset } from '@christian-listings/db';

export let ModerationReportModel: mongoose.Model<IModerationReport>;
export let ModerationCaseModel: mongoose.Model<IModerationCase>;
export let CaseNoteModel: mongoose.Model<ICaseNote>;
export let AuditEventModel: mongoose.Model<IAuditEvent>;
export let VerificationSubmissionModel: mongoose.Model<IVerificationSubmission>;
export let AdminTemplateModel: mongoose.Model<IAdminTemplate>;
export let FeaturedPlacementModel: mongoose.Model<IFeaturedPlacement>;
export let SavedAdminViewModel: mongoose.Model<ISavedAdminView>;
export let AdminNotificationModel: mongoose.Model<IAdminNotification>;
export let AuditExportModel: mongoose.Model<IAuditExport>;
export let AdminCommandModel: mongoose.Model<IAdminCommand>;
export let MediaAssetModel: mongoose.Model<IMediaAsset>;

export function setupModels(connection: Connection) {
  ModerationReportModel = connection.model<IModerationReport>('ModerationReport', ModerationReportSchema);
  ModerationCaseModel = connection.model<IModerationCase>('ModerationCase', ModerationCaseSchema);
  CaseNoteModel = connection.model<ICaseNote>('CaseNote', CaseNoteSchema);
  AuditEventModel = connection.model<IAuditEvent>('AuditEvent', AuditEventSchema);
  VerificationSubmissionModel = connection.model<IVerificationSubmission>('VerificationSubmission', VerificationSubmissionSchema);
  AdminTemplateModel = connection.model<IAdminTemplate>('AdminTemplate', AdminTemplateSchema);
  FeaturedPlacementModel = connection.model<IFeaturedPlacement>('FeaturedPlacement', FeaturedPlacementSchema);
  SavedAdminViewModel = connection.model<ISavedAdminView>('SavedAdminView', SavedAdminViewSchema);
  AdminNotificationModel = connection.model<IAdminNotification>('AdminNotification', AdminNotificationSchema);
  AuditExportModel = connection.model<IAuditExport>('AuditExport', AuditExportSchema);
  AdminCommandModel = connection.model<IAdminCommand>('AdminCommand', AdminCommandSchema);
  MediaAssetModel = connection.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
}
