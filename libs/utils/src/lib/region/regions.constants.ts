export const SUPPORTED_REGIONS = [
  'GB', // United Kingdom
  'US', // United States
  'NG', // Nigeria
  'GH', // Ghana
  'KE', // Kenya
  'ZA', // South Africa
  'CA', // Canada
  'AU', // Australia
  'UG', // Uganda
  'TZ', // Tanzania
  'ET', // Ethiopia
  'RW', // Rwanda
  'SL', // Sierra Leone
  'GM', // Gambia
] as const;

export type Region = (typeof SUPPORTED_REGIONS)[number];

export const DEFAULT_REGION: Region = 'GB';

export interface LocationRegion {
  code: string;
  displayName: string;
  aliases: readonly string[];
}

export const LOCATION_REGIONS: readonly LocationRegion[] = [
  { code: 'GB-LND', displayName: 'London, UK', aliases: ['GB-LDN', 'London', 'London, United Kingdom'] },
  { code: 'US-NY', displayName: 'New York, USA', aliases: ['US-NYC', 'New York', 'New York, United States'] },
  { code: 'NG-LA', displayName: 'Lagos, Nigeria', aliases: ['NG-LAG', 'Lagos'] },
  { code: 'KE-30', displayName: 'Nairobi, Kenya', aliases: ['KE-NBI', 'Nairobi'] },
  { code: 'CA-ON', displayName: 'Toronto, Canada', aliases: ['CA-TOR', 'Toronto'] },
  { code: 'GH-AA', displayName: 'Accra, Ghana', aliases: ['GH-ACC', 'Accra'] },
] as const;
