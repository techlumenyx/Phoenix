import mongoose from 'mongoose';
import { UserSchema, type IUser } from './user.model';
import { OrganisationSchema, type IOrganisation } from './organisation.model';
import { FollowRelationshipSchema, type IFollowRelationship } from './follow-relationship.model';
import { OrgInviteSchema, type IOrgInvite } from './org-invite.model';
import { IdentityOrganisationNotificationSchema, type IIdentityOrganisationNotification } from './organisation-notification.model';
import { AdminSchema, type IAdmin } from './admin.model';
import { MediaAssetSchema, type IMediaAsset } from '@christian-listings/db';

export let UserModel: mongoose.Model<IUser>;
export let OrganisationModel: mongoose.Model<IOrganisation>;
export let FollowRelationshipModel: mongoose.Model<IFollowRelationship>;
export let OrgInviteModel: mongoose.Model<IOrgInvite>;
export let IdentityOrganisationNotificationModel: mongoose.Model<IIdentityOrganisationNotification>;
export let AdminModel: mongoose.Model<IAdmin>;
export let MediaAssetModel: mongoose.Model<IMediaAsset>;

export function setupModels(connection: mongoose.Connection): void {
  UserModel = connection.model<IUser>('User', UserSchema);
  OrganisationModel = connection.model<IOrganisation>('Organisation', OrganisationSchema);
  FollowRelationshipModel = connection.model<IFollowRelationship>('FollowRelationship', FollowRelationshipSchema);
  OrgInviteModel = connection.model<IOrgInvite>('OrgInvite', OrgInviteSchema);
  IdentityOrganisationNotificationModel = connection.model<IIdentityOrganisationNotification>('OrganisationNotification', IdentityOrganisationNotificationSchema);
  AdminModel = connection.model<IAdmin>('Admin', AdminSchema);
  MediaAssetModel = connection.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
}
