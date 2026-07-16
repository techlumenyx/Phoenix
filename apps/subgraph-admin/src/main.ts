import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { buildSubgraphSchema } from '@apollo/subgraph';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import Fastify from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NoSchemaIntrospectionCustomRule, parse } from 'graphql';
import { buildAuthPlugin } from '@christian-listings/auth';
import { createMongoConnection } from '@christian-listings/db';
import { buildContext, type GraphQLContext } from './context';
import { setupModels } from './models';
import { resolvers } from './resolvers';
import { ingestMarketplaceReport, ReportRateLimitError, type MarketplaceReportInput } from './services/report-intake.service';
import { ingestVerificationSubmission, type VerificationIntakeInput } from './services/verification-intake.service';
import { registerAdminLaunchHardening } from './services/launch-hardening';
import { reconcileAuditExports } from './resolvers/stage4.resolver';
import { reconcileAdminCommands } from './services/command-reconciliation.service';

const typeDefs = parse(
  readFileSync(join(__dirname, 'schema/admin.graphql'), 'utf-8'),
);

async function bootstrap() {
  const mongoUri = process.env['MONGO_URI'];
  if (!mongoUri) throw new Error('MONGO_URI is required');
  const connection = await createMongoConnection(mongoUri, 'cl_admin');
  setupModels(connection);

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
    introspection: process.env['NODE_ENV'] !== 'production',
    validationRules: process.env['NODE_ENV'] === 'production' ? [NoSchemaIntrospectionCustomRule] : [],
    includeStacktraceInErrorResponses: process.env['NODE_ENV'] !== 'production',
  });

  await apollo.start();

  registerAdminLaunchHardening(fastify);
  await fastify.register(buildAuthPlugin({
    optional: false,
    internalPaths: ['/internal/reports/marketplace', '/internal/verifications'],
  }));

  fastify.post('/internal/reports/marketplace', async (request, reply) => {
    const input = request.body as MarketplaceReportInput;
    if (!isMarketplaceReportInput(input)) {
      return reply.code(400).send({ error: 'Invalid marketplace report payload' });
    }
    try {
      return await ingestMarketplaceReport(input);
    } catch (error) {
      if (error instanceof ReportRateLimitError) {
        return reply.code(429).send({ error: error.message });
      }
      throw error;
    }
  });

  fastify.post('/internal/verifications', async (request, reply) => {
    const input = request.body as VerificationIntakeInput;
    if (!isVerificationInput(input)) return reply.code(400).send({ error: 'Invalid verification submission payload' });
    const doc = await ingestVerificationSubmission(input);
    return { id: doc._id.toString(), version: doc.version, createdAt: doc.createdAt };
  });

  await fastify.register(fastifyApollo(apollo), {
    path: '/graphql',
    context: async (request) => buildContext(request),
  });

  fastify.get('/health', async () => ({ status: 'ok', service: 'subgraph-admin' }));

  await reconcileAuditExports();
  await reconcileAdminCommands();
  const reconciliationTimer = setInterval(() => void Promise.allSettled([reconcileAuditExports(), reconcileAdminCommands()]), 60_000);
  reconciliationTimer.unref();

  const port = Number(process.env['PORT'] ?? 4004);
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`[subgraph-admin] running on port ${port}`);
}

function isMarketplaceReportInput(value: unknown): value is MarketplaceReportInput {
  if (!value || typeof value !== 'object') return false;
  const input = value as Partial<MarketplaceReportInput>;
  return typeof input.itemId === 'string' && input.itemId.length > 0 &&
    typeof input.reporterFirebaseUid === 'string' && input.reporterFirebaseUid.length > 0 &&
    typeof input.reason === 'string' && input.reason.trim().length > 0 && input.reason.length <= 1100 &&
    Boolean(input.snapshot) && typeof input.snapshot?.title === 'string' &&
    typeof input.snapshot?.ownerFirebaseUid === 'string' &&
    typeof input.snapshot?.status === 'string' &&
    (input.snapshot?.organisationId === null || typeof input.snapshot?.organisationId === 'string');
}

function isVerificationInput(value: unknown): value is VerificationIntakeInput {
  if (!value || typeof value !== 'object') return false;
  const input = value as Partial<VerificationIntakeInput>;
  return typeof input.organisationId === 'string' && typeof input.organisationName === 'string' &&
    typeof input.ownerFirebaseUid === 'string' && ['STANDARD', 'CHARITY', 'NGO'].includes(input.requestedTier ?? '') &&
    Array.isArray(input.documentUrls) && input.documentUrls.length > 0 && input.documentUrls.length <= 10 &&
    input.documentUrls.every((url) => typeof url === 'string' && url.length <= 2048) && Boolean(input.snapshot);
}

bootstrap().catch((err) => {
  console.error('[subgraph-admin] Fatal startup error', err);
  process.exit(1);
});
