export type RoleType = 'PAID' | 'VOLUNTEER' | 'INTERNSHIP';
export type WorkLocation = 'PHYSICAL' | 'REMOTE' | 'HYBRID';
export type JobStatus = 'ACTIVE' | 'ARCHIVED' | 'CLOSED';

export interface IJobListing {
  _id: string;
  title: string;
  description: string;
  organisationId: string;
  roleType: RoleType;
  workLocation: WorkLocation;
  skillsRequired: string[];
  region: string;
  salaryRange?: { min: number; max: number; currency: string };
  applicationDeadline: Date;
  externalApplyUrl?: string;
  status: JobStatus;
  isPromoted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type ListingStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'PENDING_REVIEW';

export interface IMarketplaceItem {
  _id: string;
  title: string;
  description: string;
  sellerId: string;
  price: number;
  currency: string;
  condition: ItemCondition;
  category: string;
  region: string;
  imageUrls: string[];
  status: ListingStatus;
  isDonation: boolean;
  isPromoted: boolean;
  flagCount: number;
  createdAt: Date;
  updatedAt: Date;
}
