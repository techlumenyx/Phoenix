import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IAdmin {
  _id: mongoose.Types.ObjectId;
  firebaseUid: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminDocument = HydratedDocument<IAdmin>;

export const AdminSchema = new Schema<IAdmin>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true },
  },
  { timestamps: true },
);
