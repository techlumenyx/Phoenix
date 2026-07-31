import {
  makeLocationPrefixes,
  makeLocationTrigrams,
  normalizeLocationSearch,
  rankLocation,
} from './location-search';
import type { ILocation } from '../models/location.model';

function location(name: string, population: number, aliases: string[] = []): ILocation {
  return {
    _id: `geonames:${name}`,
    geonameId: 1,
    name,
    asciiName: name,
    displayName: `${name}, United Kingdom`,
    countryCode: 'GB',
    countryName: 'United Kingdom',
    admin1Code: 'ENG',
    admin1Name: 'England',
    admin2Code: null,
    admin2Name: null,
    latitude: 0,
    longitude: 0,
    population,
    featureCode: 'PPL',
    timezone: 'Europe/London',
    normalizedNames: [normalizeLocationSearch(name), ...aliases.map(normalizeLocationSearch)],
    primaryPrefixes: makeLocationPrefixes(name),
    searchTrigrams: makeLocationTrigrams(name),
    active: true,
    updatedAt: new Date(),
  };
}

describe('GeoNames location search helpers', () => {
  it('normalises accents, punctuation, and whitespace', () => {
    expect(normalizeLocationSearch('  São  Paulo, BR ')).toBe('sao paulo br');
  });

  it('creates indexed prefixes without one-character entries', () => {
    expect(makeLocationPrefixes('Leeds', 4)).toEqual(['le', 'lee', 'leed']);
  });

  it('creates overlapping trigrams for typo candidate lookup', () => {
    expect(makeLocationTrigrams('Bath')).toEqual(expect.arrayContaining(['  b', ' ba', 'bat', 'ath']));
  });

  it('ranks exact aliases ahead of fuzzy matches', () => {
    const exactAlias = location('New York City', 8_000_000, ['NYC']);
    const fuzzy = location('Nyack', 7_000);
    expect(rankLocation(exactAlias, 'nyc')).toBeLessThan(rankLocation(fuzzy, 'nyc'));
  });

  it('uses population only as a tie breaker between equal names', () => {
    expect(rankLocation(location('Springfield', 100_000), 'Springfield'))
      .toBeLessThan(rankLocation(location('Springfield', 5_000), 'Springfield'));
  });
});
