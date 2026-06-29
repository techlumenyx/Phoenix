import mongoose from 'mongoose';
import { type Connection } from 'mongoose';
import { MarketplaceItemSchema, type IMarketplaceItem } from './marketplace-item.model';
import { JobListingSchema, type IJobListing } from './job-listing.model';
import { JobApplicationSchema, type IJobApplication } from './job-application.model';

export let MarketplaceItemModel: mongoose.Model<IMarketplaceItem>;
export let JobListingModel: mongoose.Model<IJobListing>;
export let JobApplicationModel: mongoose.Model<IJobApplication>;

export function setupModels(conn: Connection) {
  MarketplaceItemModel = conn.model<IMarketplaceItem>('MarketplaceItem', MarketplaceItemSchema);
  JobListingModel      = conn.model<IJobListing>('JobListing', JobListingSchema);
  JobApplicationModel  = conn.model<IJobApplication>('JobApplication', JobApplicationSchema);
}
