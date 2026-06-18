export interface IUser {
  _id: string;
  firebaseUid: string;
  email: string;
  name: string;
  region: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganisation {
  _id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  region: string;
  isVerified: boolean;
  verificationTier: OrganisationVerificationTier;
  followerCount: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganisationVerificationTier = 'NONE' | 'STANDARD' | 'CHARITY' | 'NGO';
