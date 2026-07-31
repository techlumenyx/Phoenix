import { Schema, type HydratedDocument } from 'mongoose';

export interface ILocation {
  _id: string;
  geonameId: number;
  name: string;
  asciiName: string;
  displayName: string;
  countryCode: string;
  countryName: string;
  admin1Code: string | null;
  admin1Name: string | null;
  admin2Code: string | null;
  admin2Name: string | null;
  latitude: number;
  longitude: number;
  population: number;
  featureCode: string;
  timezone: string | null;
  normalizedName: string;
  normalizedNames: string[];
  active: boolean;
  updatedAt: Date;
}

export type LocationDocument = HydratedDocument<ILocation>;

export const LocationSchema = new Schema<ILocation>(
  {
    _id: { type: String, required: true },
    geonameId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    asciiName: { type: String, required: true },
    displayName: { type: String, required: true },
    countryCode: { type: String, required: true },
    countryName: { type: String, required: true },
    admin1Code: { type: String, default: null },
    admin1Name: { type: String, default: null },
    admin2Code: { type: String, default: null },
    admin2Name: { type: String, default: null },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    population: { type: Number, required: true, default: 0 },
    featureCode: { type: String, required: true },
    timezone: { type: String, default: null },
    normalizedName: { type: String, required: true },
    normalizedNames: [{ type: String, required: true }],
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

LocationSchema.index({ normalizedNames: 1 });
LocationSchema.index({ normalizedName: 1 });
LocationSchema.index({ countryCode: 1, population: -1 });
LocationSchema.index({ countryCode: 1, admin1Code: 1, population: -1 });
