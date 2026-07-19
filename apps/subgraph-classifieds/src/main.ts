import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { buildSubgraphSchema } from '@apollo/subgraph';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import Fastify from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'graphql';
import { buildAuthContext, buildAuthPlugin, canAccessOrganisation, isInternalServiceRequest } from '@christian-listings/auth';
import { createMongoConnection } from '@christian-listings/db';
import { registerMediaUploadRoutes } from '@christian-listings/utils';
import { buildContext, type GraphQLContext } from './context';
import { MediaAssetModel, setupModels } from './models';
import { resolvers } from './resolvers';
import { executeMarketplaceModerationCommand, type MarketplaceModerationCommand } from './services/moderation-command.service';
import { applyAdminOrganisationClassifiedsAction, classifiedsDirectory } from './services/admin-directory.service';

const typeDefs = parse(
  readFileSync(join(__dirname, 'schema/classifieds.graphql'), 'utf-8'),
);

async function bootstrap() {
  const mongoUri = process.env['MONGO_URI'];
  if (!mongoUri) throw new Error('MONGO_URI is required');
  const conn = await createMongoConnection(mongoUri, 'cl_classifieds');
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

  registerMediaUploadRoutes(fastify, {
    service: 'classifieds', purposes: ['MARKETPLACE_IMAGE', 'MARKETPLACE_VIDEO', 'JOB_CV'],
    authorize: (request, purpose, ownerId) => {
      const auth = buildAuthContext(request);
      if (!auth.isAuthenticated) return false;
      if (purpose === 'JOB_CV' || !ownerId) return true;
      return canAccessOrganisation(auth, ownerId, ['master_admin', 'site_admin', 'classifieds_manager']);
    },
    onUploaded: async (request, purpose, ownerId, result) => { await MediaAssetModel.create({ ...result, cloudinaryAssetId: result.assetId, purpose, ownerId, uploadedBy: request.firebaseUser?.uid ?? 'unknown', status: 'ACTIVE' }); },
    onDeleted: async (publicId) => { await MediaAssetModel.updateOne({ publicId }, { $set: { status: 'DELETED' } }); },
  });

  fastify.post('/internal/moderation/marketplace', async (request, reply) => {
    if (!isInternalServiceRequest(request)) {
      return reply.code(401).send({ error: 'Invalid internal service credentials' });
    }
    const input = request.body as MarketplaceModerationCommand;
    if (!isModerationCommand(input)) {
      return reply.code(400).send({ error: 'Invalid moderation command' });
    }
    const result = await executeMarketplaceModerationCommand(input);
    return result ?? reply.code(404).send({ error: 'Marketplace item not found' });
  });

  fastify.post('/internal/admin/directory', async (request, reply) => {
    if (!isInternalServiceRequest(request)) return reply.code(401).send({ error: 'Invalid internal service credentials' });
    const input = request.body as Parameters<typeof classifiedsDirectory>[0];
    if (!input || !['JOB', 'MARKETPLACE_ITEM'].includes(input.type)) return reply.code(400).send({ error: 'Invalid directory request' });
    return classifiedsDirectory(input);
  });

  fastify.post('/internal/admin/organisation-action', async (request, reply) => {
    if (!isInternalServiceRequest(request)) return reply.code(401).send({ error: 'Invalid internal service credentials' });
    const input = request.body as Parameters<typeof applyAdminOrganisationClassifiedsAction>[0];
    if (!input || typeof input.organisationId !== 'string' || !['SUSPEND', 'REACTIVATE'].includes(input.action)) return reply.code(400).send({ error: 'Invalid organisation action' });
    return applyAdminOrganisationClassifiedsAction(input);
  });

  await fastify.register(fastifyApollo(apollo), {
    path: '/graphql',
    context: async (request) => buildContext(request),
  });

  fastify.get('/health', async () => ({ status: 'ok', service: 'subgraph-classifieds' }));

  const port = Number(process.env['PORT'] ?? 4003);
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`[subgraph-classifieds] running on port ${port}`);
}

function isModerationCommand(value: unknown): value is MarketplaceModerationCommand {
  if (!value || typeof value !== 'object') return false;
  const input = value as Partial<MarketplaceModerationCommand>;
  return typeof input.itemId === 'string' && input.itemId.length > 0 &&
    typeof input.caseId === 'string' && input.caseId.length > 0 &&
    typeof input.action === 'string' && ['DISMISS', 'WARN', 'REMOVE'].includes(input.action) &&
    typeof input.reason === 'string' && input.reason.trim().length >= 5 && input.reason.length <= 1000;
}

bootstrap().catch((err) => {
  console.error('[subgraph-classifieds] Fatal startup error', err);
  process.exit(1);
});
