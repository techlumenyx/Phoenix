import mongoose from 'mongoose';
import { type Connection } from 'mongoose';
import { MarketplaceItemSchema, type IMarketplaceItem } from './marketplace-item.model';
import { JobListingSchema, type IJobListing } from './job-listing.model';
import { JobApplicationSchema, type IJobApplication } from './job-application.model';
import { SavedClassifiedSchema, type ISavedClassified } from './saved-classified.model';
import { MessageThreadSchema, type IMessageThread } from './message-thread.model';
import { MessageSchema, type IMessage } from './message.model';
import { ClassifiedOrganisationNotificationSchema, type IClassifiedOrganisationNotification } from './organisation-notification.model';
import { MediaAssetSchema, type IMediaAsset } from '@christian-listings/db';

export let MarketplaceItemModel: mongoose.Model<IMarketplaceItem>;
export let JobListingModel: mongoose.Model<IJobListing>;
export let JobApplicationModel: mongoose.Model<IJobApplication>;
export let SavedClassifiedModel: mongoose.Model<ISavedClassified>;
export let MessageThreadModel: mongoose.Model<IMessageThread>;
export let MessageModel: mongoose.Model<IMessage>;
export let ClassifiedOrganisationNotificationModel: mongoose.Model<IClassifiedOrganisationNotification>;
export let MediaAssetModel: mongoose.Model<IMediaAsset>;

export function setupModels(conn: Connection) {
  MarketplaceItemModel = conn.model<IMarketplaceItem>('MarketplaceItem', MarketplaceItemSchema);
  JobListingModel      = conn.model<IJobListing>('JobListing', JobListingSchema);
  JobApplicationModel  = conn.model<IJobApplication>('JobApplication', JobApplicationSchema);
  SavedClassifiedModel = conn.model<ISavedClassified>('SavedClassified', SavedClassifiedSchema);
  MessageThreadModel = conn.model<IMessageThread>('MessageThread', MessageThreadSchema);
  MessageModel = conn.model<IMessage>('Message', MessageSchema);
  ClassifiedOrganisationNotificationModel = conn.model<IClassifiedOrganisationNotification>('OrganisationNotification', ClassifiedOrganisationNotificationSchema);
  MediaAssetModel = conn.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
}
