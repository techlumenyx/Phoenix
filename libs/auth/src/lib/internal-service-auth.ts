import { timingSafeEqual } from 'crypto';
import type { FastifyRequest } from 'fastify';

export const INTERNAL_SERVICE_HEADER = 'x-cl-service-key';

export function isInternalServiceRequest(request: FastifyRequest): boolean {
  const expected = process.env['INTERNAL_SERVICE_KEY'];
  const received = request.headers[INTERNAL_SERVICE_HEADER];
  if (!expected || typeof received !== 'string') return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer);
}
