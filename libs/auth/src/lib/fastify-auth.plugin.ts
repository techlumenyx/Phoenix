import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { verifyFirebaseToken, UnauthorizedError } from './verify-token';
import { isInternalServiceRequest } from './internal-service-auth';

interface AuthPluginOptions {
  optional?: boolean;
  internalPaths?: string[];
}

export function buildAuthPlugin(options: AuthPluginOptions = {}) {
  return fp(async (fastify: FastifyInstance) => {
    fastify.addHook('onRequest', async (request, reply) => {
      if (request.url.split('?')[0] === '/health') return;

      const path = request.url.split('?')[0];
      if (options.internalPaths?.includes(path)) {
        if (isInternalServiceRequest(request)) return;
        reply.code(401);
        throw new UnauthorizedError('Invalid internal service credentials');
      }

      const authHeader = request.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (options.optional) return;
        reply.code(401);
        throw new UnauthorizedError('Authorization header missing or malformed');
      }

      const token = authHeader.replace('Bearer ', '');
      try {
        request.firebaseUser = await verifyFirebaseToken(token);
      } catch (err) {
        if (options.optional) return;
        reply.code(401);
        throw err;
      }
    });
  });
}
