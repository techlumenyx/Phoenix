import type { FastifyRequest } from 'fastify';
import { SUPPORTED_REGIONS, DEFAULT_REGION, LOCATION_REGIONS, type LocationRegion, type Region } from './regions.constants';

export function normaliseRegion(raw: string | undefined | null): Region {
  if (!raw) return DEFAULT_REGION;
  const upper = raw.toUpperCase() as Region;
  return (SUPPORTED_REGIONS as readonly string[]).includes(upper) ? upper : DEFAULT_REGION;
}

export function getRegionFromRequest(request: FastifyRequest): Region {
  const header = request.headers['x-cl-region'];
  if (header && typeof header === 'string') {
    return normaliseRegion(header);
  }
  return DEFAULT_REGION;
}

export interface ResolvedLocationRegion {
  code: string;
  displayName: string;
  codes: string[];
}

export function resolveLocationRegion(raw: string | undefined | null): ResolvedLocationRegion | null {
  const value = raw?.trim();
  if (!value) return null;
  const lower = value.toLowerCase();
  const match = LOCATION_REGIONS.find((region: LocationRegion) =>
    region.code.toLowerCase() === lower || region.displayName.toLowerCase() === lower || region.aliases.some((alias) => alias.toLowerCase() === lower),
  );
  if (!match) return { code: value.toUpperCase(), displayName: value, codes: [value.toUpperCase()] };
  return {
    code: match.code,
    displayName: match.displayName,
    codes: [match.code, ...match.aliases.filter((alias) => /^[A-Z]{2}-[A-Z0-9]+$/i.test(alias)).map((alias) => alias.toUpperCase())],
  };
}
