import { GraphQLError } from 'graphql';
import { LocationModel as _LocationModel } from '../models';
import type { ILocation } from '../models/location.model';
import { makeLocationTrigrams, normalizeLocationSearch, rankLocation } from '../lib/location-search';

function LocationModel() { return _LocationModel; }

function mapLocation(location: ILocation) {
  return {
    id: location._id,
    geonameId: location.geonameId.toString(),
    name: location.name,
    displayName: location.displayName,
    countryCode: location.countryCode,
    countryName: location.countryName,
    admin1Code: location.admin1Code,
    admin1Name: location.admin1Name,
    admin2Code: location.admin2Code,
    admin2Name: location.admin2Name,
    latitude: location.latitude,
    longitude: location.longitude,
    population: location.population,
    timezone: location.timezone,
  };
}

export const locationResolvers = {
  Query: {
    location: async (_: unknown, { id }: { id: string }) => {
      const location = await LocationModel().findOne({ _id: id, active: true }).lean();
      return location ? mapLocation(location) : null;
    },
    locationSuggestions: async (
      _: unknown,
      { query, countryCode, limit = 8 }: { query: string; countryCode?: string | null; limit?: number | null },
    ) => {
      const normalized = normalizeLocationSearch(query);
      if (normalized.length === 1) return [];
      if (normalized.length > 80) {
        throw new GraphQLError('Location search is too long', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const safeLimit = Math.min(Math.max(limit ?? 8, 1), 20);
      const baseFilter: Record<string, unknown> = { active: true };
      if (countryCode) baseFilter['countryCode'] = countryCode.trim().toUpperCase();

      if (!normalized) {
        const popular = await LocationModel().find(baseFilter).sort({ population: -1 }).limit(safeLimit).lean();
        return popular.map(mapLocation);
      }

      let matches = await LocationModel()
        .find({ ...baseFilter, $or: [{ normalizedNames: normalized }, { primaryPrefixes: normalized }] })
        .sort({ population: -1 })
        .limit(Math.max(safeLimit * 4, 30))
        .lean();

      if (matches.length < safeLimit && normalized.length >= 4) {
        const fuzzyMatches = await LocationModel()
          .find({ ...baseFilter, searchTrigrams: { $in: makeLocationTrigrams(normalized) } })
          .sort({ population: -1 })
          .limit(200)
          .lean();
        const byId = new Map(matches.map((match) => [match._id, match]));
        fuzzyMatches.forEach((match) => byId.set(match._id, match));
        matches = [...byId.values()];
      }

      return matches
        .sort((left, right) => rankLocation(left, normalized) - rankLocation(right, normalized))
        .slice(0, safeLimit)
        .map(mapLocation);
    },
  },
};
