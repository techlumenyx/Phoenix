import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { buildSubgraphSchema } from '@apollo/subgraph';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import Fastify from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'graphql';
import { buildAuthPlugin, isInternalServiceRequest } from '@christian-listings/auth';
import { createMongoConnection } from '@christian-listings/db';
import { buildContext, type GraphQLContext } from './context';
import { setupModels } from './models';
import { resolvers } from './resolvers';
import { applyAdminEventAction, applyAdminOrganisationEventAction, eventDirectory } from './services/admin-events.service';

const typeDefs = parse(
  readFileSync(join(__dirname, 'schema/events.graphql'), 'utf-8'),
);

async function bootstrap() {
  const mongoUri = process.env['MONGO_URI'];
  if (!mongoUri) throw new Error('MONGO_URI is required');
  const conn = await createMongoConnection(mongoUri, 'cl_events');
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

  fastify.post('/internal/admin/directory', async (request, reply) => {
    if (!isInternalServiceRequest(request)) return reply.code(401).send({ error: 'Invalid internal service credentials' });
    return eventDirectory(request.body as Parameters<typeof eventDirectory>[0]);
  });

  fastify.post('/internal/admin/event-action', async (request, reply) => {
    if (!isInternalServiceRequest(request)) return reply.code(401).send({ error: 'Invalid internal service credentials' });
    const input = request.body as Parameters<typeof applyAdminEventAction>[0];
    if (!input || !['CANCEL', 'RESTORE'].includes(input.action) || !['OCCURRENCE', 'SERIES'].includes(input.scope) || typeof input.reason !== 'string' || input.reason.trim().length < 5) return reply.code(400).send({ error: 'Invalid event action' });
    const result = await applyAdminEventAction(input);
    return result ?? reply.code(404).send({ error: 'Event not found' });
  });

  fastify.post('/internal/admin/organisation-action', async (request, reply) => {
    if (!isInternalServiceRequest(request)) return reply.code(401).send({ error: 'Invalid internal service credentials' });
    const input = request.body as Parameters<typeof applyAdminOrganisationEventAction>[0];
    if (!input || typeof input.organisationId !== 'string' || !['SUSPEND', 'REACTIVATE'].includes(input.action)) return reply.code(400).send({ error: 'Invalid organisation action' });
    return applyAdminOrganisationEventAction(input);
  });

  await fastify.register(fastifyApollo(apollo), {
    path: '/graphql',
    context: async (request) => buildContext(request),
  });

  fastify.get('/health', async () => ({ status: 'ok', service: 'subgraph-events' }));

  const port = Number(process.env['PORT'] ?? 4002);
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`[subgraph-events] running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('[subgraph-events] Fatal startup error', err);
  process.exit(1);
});
