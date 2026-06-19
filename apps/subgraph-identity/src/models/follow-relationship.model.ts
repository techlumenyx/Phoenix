import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IFollowRelationship {
  _id: mongoose.Types.ObjectId;
  followerFirebaseUid: string;              // the user who follows
  organisationId: mongoose.Types.ObjectId;  // the org being followed
  createdAt: Date;
  updatedAt: Date;
}

export type FollowRelationshipDocument = HydratedDocument<IFollowRelationship>;

export const FollowRelationshipSchema = new Schema<IFollowRelationship>(
  {
    followerFirebaseUid: { type: String, required: true },
    organisationId:      { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

// Fast lookup: all orgs a user follows
FollowRelationshipSchema.index({ followerFirebaseUid: 1 });
// Fast lookup: all followers of an org
FollowRelationshipSchema.index({ organisationId: 1 });
// Enforce one follow per user per org
FollowRelationshipSchema.index(
  { followerFirebaseUid: 1, organisationId: 1 },
  { unique: true },
);
