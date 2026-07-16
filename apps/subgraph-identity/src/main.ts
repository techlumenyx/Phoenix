import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { buildSubgraphSchema } from '@apollo/subgraph';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import Fastify from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'graphql';
import { buildAuthPlugin, getFirebaseAdmin, isInternalServiceRequest } from '@christian-listings/auth';
import { createMongoConnection } from '@christian-listings/db';
import { buildContext, type GraphQLContext } from './context';
import { resolvers } from './resolvers';
import { setupModels } from './models';
import { applyIdentityAccountAction, applyVerificationDecision, identityDirectory } from './services/admin-identity.service';

const typeDefs = parse(
  readFileSync(join(__dirname, 'schema/identity.graphql'), 'utf-8'),
);

async function bootstrap() {
  getFirebaseAdmin(); // initialize Firebase Admin before any requests arrive

  const mongoUri = process.env['MONGO_URI'];
  if (!mongoUri) throw new Error('MONGO_URI is required');
  const conn = await createMongoConnection(mongoUri, 'cl_identity');
  setupModels(conn);

  const fastify = Fastify({
    logger: process.env['NODE_ENV'] !== 'test',
  });

  const apollo = new ApolloServer<GraphQLContext>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: buildSubgraphSchema({ typeDefs, resolvers: resolvers as any }),
    plugins: [
      ApolloServerPluginInlineTrace(),
      fastifyApolloDrainPlugin(fastify),
    ],
  });

  await apollo.start();

  await fastify.register(buildAuthPlugin({ optional: true }));

  fastify.post('/internal/admin/verification-decision', async (request, reply) => {
    if (!isInternalServiceRequest(request)) return reply.code(401).send({ error: 'Invalid internal service credentials' });
    const input = request.body as Parameters<typeof applyVerificationDecision>[0];
    if (!input || !['APPROVE', 'REJECT', 'NEEDS_INFORMATION'].includes(input.action) || typeof input.reason !== 'string') return reply.code(400).send({ error: 'Invalid verification decision' });
    const result = await applyVerificationDecision(input);
    return result ?? reply.code(404).send({ error: 'Organisation not found' });
  });

  fastify.post('/internal/admin/directory', async (request, reply) => {
    if (!isInternalServiceRequest(request)) return reply.code(401).send({ error: 'Invalid internal service credentials' });
    const input = request.body as Parameters<typeof identityDirectory>[0];
    if (!input || !['USER', 'ORGANISATION'].includes(input.type)) return reply.code(400).send({ error: 'Invalid directory request' });
    return identityDirectory(input);
  });

  fastify.post('/internal/admin/account-action', async (request, reply) => {
    if (!isInternalServiceRequest(request)) return reply.code(401).send({ error: 'Invalid internal service credentials' });
    const input = request.body as Parameters<typeof applyIdentityAccountAction>[0];
    if (!input || !['USER', 'ORGANISATION'].includes(input.type) || !['WARN', 'SUSPEND', 'REACTIVATE'].includes(input.action) || typeof input.reason !== 'string' || input.reason.trim().length < 5) return reply.code(400).send({ error: 'Invalid account action' });
    const result = await applyIdentityAccountAction(input);
    return result ?? reply.code(404).send({ error: 'Account not found' });
  });

  await fastify.register(fastifyApollo(apollo), {
    path: '/graphql',
    context: async (request) => buildContext(request),
  });

  fastify.get('/health', async () => ({ status: 'ok', service: 'subgraph-identity' }));

  const port = Number(process.env['PORT'] ?? 4001);
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`[subgraph-identity] running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('[subgraph-identity] Fatal startup error', err);
  process.exit(1);
});
