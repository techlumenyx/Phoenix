import type mongoose from 'mongoose';

export interface ISocialLinks {
  whatsapp:  string | null;
  instagram: string | null;
  facebook:  string | null;
  twitter:   string | null;
  website:   string | null;
}

export interface IUser {
  _id: mongoose.Types.ObjectId | string;
  firebaseUid: string;
  email: string;
  name: string;
  avatarUrl:   string | null;
  bio:         string | null;
  socialLinks: ISocialLinks | null;
  isVerified:  boolean;
  region:      string | null;
  regionCode:  string | null;
  preferences: string[];
  onboardingCompleted: boolean;
  roles: string[];
  orgId:        mongoose.Types.ObjectId | string | null;
  orgInvitedBy: string | null;
  orgJoinedAt:  Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganisationVerificationTier = 'NONE' | 'STANDARD' | 'CHARITY' | 'NGO';
export type OrganisationVerificationStatus =
  | 'PENDING_SUBMISSION'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED';

export interface IOrganisation {
  _id: mongoose.Types.ObjectId | string;
  createdBy: string;
  name: string | null;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  socialLinks: ISocialLinks | null;
  region: string | null;
  regionCode: string | null;
  isVerified: boolean;
  verificationTier: OrganisationVerificationTier;
  verificationStatus: OrganisationVerificationStatus;
  followerCount: number;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
