import type { FastifyRequest } from 'fastify';
import { SUPPORTED_REGIONS, DEFAULT_REGION, type Region } from './regions.constants';

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
