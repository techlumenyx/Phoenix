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
