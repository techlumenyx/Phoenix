import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { buildSubgraphSchema } from '@apollo/subgraph';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import Fastify from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'graphql';
import { buildAuthPlugin, getFirebaseAdmin } from '@christian-listings/auth';
import { createMongoConnection } from '@christian-listings/db';
import { buildContext, type GraphQLContext } from './context';
import { resolvers } from './resolvers';
import { setupModels } from './models';

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
