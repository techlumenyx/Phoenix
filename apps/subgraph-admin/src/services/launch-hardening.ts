import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

type WindowEntry = { count: number; resetAt: number };

export function parseAllowedOrigins(value = process.env['ADMIN_ALLOWED_ORIGINS'] ?? '') {
  const configured = value.split(',').map((origin) => origin.trim()).filter(Boolean);
  return new Set(configured.length ? configured : [
    'http://localhost:3001',
    'https://christian-listings-admin.web.app',
  ]);
}

export function createFixedWindowRateLimiter(limit: number, windowMs: number, now = () => Date.now()) {
  const entries = new Map<string, WindowEntry>();
  return (key: string) => {
    const timestamp = now();
    const current = entries.get(key);
    if (!current || current.resetAt <= timestamp) {
      entries.set(key, { count: 1, resetAt: timestamp + windowMs });
      return { allowed: true, remaining: Math.max(limit - 1, 0), resetAt: timestamp + windowMs };
    }
    current.count += 1;
    return { allowed: current.count <= limit, remaining: Math.max(limit - current.count, 0), resetAt: current.resetAt };
  };
}

export function registerAdminLaunchHardening(fastify: FastifyInstance) {
  const allowedOrigins = parseAllowedOrigins();
  const checkRequest = createFixedWindowRateLimiter(
    Math.max(Number(process.env['ADMIN_RATE_LIMIT_PER_MINUTE'] ?? 120), 10),
    60_000,
  );

  fastify.addHook('onRequest', async (request, reply) => {
    applySecurityHeaders(reply);
    const origin = request.headers.origin;
    if (origin) {
      if (!allowedOrigins.has(origin)) return reply.code(403).send({ error: 'Origin is not allowed' });
      reply.header('access-control-allow-origin', origin);
      reply.header('vary', 'Origin');
      reply.header('access-control-allow-credentials', 'true');
      reply.header('access-control-allow-methods', 'GET, POST, OPTIONS');
      reply.header('access-control-allow-headers', 'authorization, content-type, x-request-id, x-admin-route, apollo-require-preflight');
    }
    if (request.method === 'OPTIONS') return reply.code(204).send();
  });

  fastify.addHook('preHandler', async (request, reply) => {
    if (request.url.split('?')[0] !== '/graphql' || request.method !== 'POST' || !isMutation(request.body)) return;
    const key = (request as FastifyRequest & { firebaseUser?: { uid: string } }).firebaseUser?.uid ?? request.ip;
    const result = checkRequest(key);
    reply.header('x-ratelimit-limit', process.env['ADMIN_RATE_LIMIT_PER_MINUTE'] ?? '120');
    reply.header('x-ratelimit-remaining', result.remaining);
    reply.header('x-ratelimit-reset', Math.ceil(result.resetAt / 1000));
    if (!result.allowed) return reply.code(429).send({ error: 'Admin mutation rate limit exceeded', retryAfterSeconds: Math.max(Math.ceil((result.resetAt - Date.now()) / 1000), 1) });
  });
}

function applySecurityHeaders(reply: FastifyReply) {
  reply.header('x-content-type-options', 'nosniff');
  reply.header('x-frame-options', 'DENY');
  reply.header('referrer-policy', 'no-referrer');
  reply.header('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  reply.header('cache-control', 'no-store');
  reply.header('content-security-policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
}

function isMutation(body: unknown) {
  if (!body || typeof body !== 'object') return false;
  const query = (body as { query?: unknown }).query;
  return typeof query === 'string' && /^\s*mutation\b/i.test(query.replace(/^\s*#[^\n]*\n/gm, ''));
}
