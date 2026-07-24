import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { buildSubgraphSchema } from '@apollo/subgraph';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import Fastify from 'fastify';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'graphql';
import { buildAuthContext, buildAuthPlugin, canAccessOrganisation, getFirebaseAdmin, isInternalServiceRequest } from '@christian-listings/auth';
import { createMongoConnection } from '@christian-listings/db';
import { registerMediaUploadRoutes } from '@christian-listings/utils';
import { buildContext, type GraphQLContext } from './context';
import { resolvers } from './resolvers';
import { MediaAssetModel, OrganisationModel, UserModel, setupModels } from './models';
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

  registerMediaUploadRoutes(fastify, {
    service: 'identity', purposes: ['MEMBER_AVATAR', 'ORGANISATION_LOGO', 'ORGANISATION_GALLERY', 'VERIFICATION_DOCUMENT'],
    authorize: async (request, purpose, ownerId) => {
      const auth = buildAuthContext(request);
      if (!auth.isAuthenticated) return false;
      if (purpose === 'MEMBER_AVATAR') return !ownerId || ownerId === auth.firebaseUid;
      if (!ownerId) return false;
      if (canAccessOrganisation(auth, ownerId, ['master_admin', 'site_admin'])) return true;
      if (!mongoose.isValidObjectId(ownerId)) return false;

      // Firebase custom claims may take a moment to propagate immediately after
      // organisation creation. The persisted creator relationship is an equally
      // authoritative ownership check for this onboarding upload.
      return Boolean(await OrganisationModel.exists({ _id: ownerId, createdBy: auth.firebaseUid }));
    },
    onUploaded: async (request, purpose, ownerId, result) => { await MediaAssetModel.create({ ...result, cloudinaryAssetId: result.assetId, purpose, ownerId, uploadedBy: request.firebaseUser?.uid ?? 'unknown', status: 'ACTIVE' }); },
    onDeleted: async (publicId) => { await MediaAssetModel.updateOne({ publicId }, { $set: { status: 'DELETED' } }); },
  });

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

  fastify.get<{ Params: { id: string } }>('/internal/organisations/:id/email-contact', async (request, reply) => {
    if (!isInternalServiceRequest(request)) return reply.code(401).send({ error: 'Invalid internal service credentials' });
    const organisation = await OrganisationModel.findById(request.params.id).select('name contactEmail verificationDetails.officialEmail createdBy');
    if (!organisation) return reply.code(404).send({ error: 'Organisation not found' });
    const owner = await UserModel.findOne({ firebaseUid: organisation.createdBy }).select('email');
    const email = organisation.contactEmail ?? organisation.verificationDetails.officialEmail ?? owner?.email ?? null;
    return { name: organisation.name ?? 'Organisation', email };
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
