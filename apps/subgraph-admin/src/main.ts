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
import { registerMediaUploadRoutes } from '@christian-listings/utils';
import { buildContext, type GraphQLContext } from './context';
import { MediaAssetModel, setupModels } from './models';
import { resolvers } from './resolvers';
import { ingestMarketplaceReport, ReportRateLimitError, type MarketplaceReportInput } from './services/report-intake.service';
import { ingestVerificationSubmission, type VerificationIntakeInput } from './services/verification-intake.service';
import { registerAdminLaunchHardening } from './services/launch-hardening';
import { reconcileAuditExports } from './resolvers/stage4.resolver';
import { reconcileAdminCommands } from './services/command-reconciliation.service';
import { acceptEmailIntent, cancelScheduledEmail, claimDueEmails, isEmailIntent, reconcileEmailQueue, recordEmailResult } from './services/email-orchestration.service';
import type { EmailDeliveryResult } from '@christian-listings/email';
import rawBody from 'fastify-raw-body';
import { ingestSendGridEvents, verifySendGridWebhook, type SendGridEvent } from './services/sendgrid-webhook.service';

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

  await fastify.register(rawBody, { global: false, encoding: false, runFirst: true });

  registerAdminLaunchHardening(fastify);
  await fastify.register(buildAuthPlugin({
    optional: false,
    publicPaths: ['/webhooks/sendgrid'],
    internalPaths: [
      '/internal/reports/marketplace', '/internal/verifications', '/internal/emails',
      '/internal/emails/*',
    ],
  }));

  fastify.post('/webhooks/sendgrid', { config: { rawBody: true } }, async (request, reply) => {
    const signature = request.headers['x-twilio-email-event-webhook-signature'];
    const timestamp = request.headers['x-twilio-email-event-webhook-timestamp'];
    const raw = (request as typeof request & { rawBody?: Buffer }).rawBody;
    if (typeof signature !== 'string' || typeof timestamp !== 'string' || !raw) return reply.code(400).send({ error: 'Missing webhook signature' });
    try {
      if (!verifySendGridWebhook(raw, signature, timestamp)) return reply.code(401).send({ error: 'Invalid webhook signature' });
    } catch (error) {
      request.log.error(error, 'SendGrid webhook verification is unavailable');
      return reply.code(503).send({ error: 'Webhook verification unavailable' });
    }
    if (!Array.isArray(request.body)) return reply.code(400).send({ error: 'Invalid SendGrid event payload' });
    return { accepted: request.body.length, matched: await ingestSendGridEvents(request.body as SendGridEvent[]) };
  });

  registerMediaUploadRoutes(fastify, {
    service: 'admin', purposes: ['FEATURED_PLACEMENT_IMAGE'],
    authorize: (request) => Boolean(request.firebaseUser),
    onUploaded: async (request, purpose, ownerId, result) => { await MediaAssetModel.create({ ...result, cloudinaryAssetId: result.assetId, purpose, ownerId, uploadedBy: request.firebaseUser?.uid ?? 'unknown', status: 'ACTIVE' }); },
    onDeleted: async (publicId) => { await MediaAssetModel.updateOne({ publicId }, { $set: { status: 'DELETED' } }); },
  });

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

  fastify.post('/internal/emails', async (request, reply) => {
    if (!isEmailIntent(request.body)) return reply.code(400).send({ error: 'Invalid email intent payload' });
    const doc = await acceptEmailIntent(request.body);
    return { id: doc._id.toString(), status: doc.status };
  });

  fastify.post('/internal/emails/claim-due', async () => ({ jobs: await claimDueEmails() }));

  fastify.post('/internal/emails/cancel', async (request, reply) => {
    const body = request.body as { idempotencyKey?: unknown };
    if (typeof body?.idempotencyKey !== 'string' || body.idempotencyKey.length > 250) return reply.code(400).send({ error: 'Invalid idempotency key' });
    const doc = await cancelScheduledEmail(body.idempotencyKey);
    return { cancelled: Boolean(doc) };
  });

  fastify.post<{ Params: { id: string } }>('/internal/emails/:id/result', async (request, reply) => {
    if (!isEmailResult(request.body)) return reply.code(400).send({ error: 'Invalid email result payload' });
    const doc = await recordEmailResult(request.params.id, request.body);
    if (!doc) return reply.code(404).send({ error: 'Email delivery not found' });
    return { id: doc._id.toString(), status: doc.status };
  });

  await fastify.register(fastifyApollo(apollo), {
    path: '/graphql',
    context: async (request) => buildContext(request),
  });

  fastify.get('/health', async () => ({ status: 'ok', service: 'subgraph-admin' }));

  await reconcileAuditExports();
  await reconcileAdminCommands();
  await reconcileEmailQueue().catch((error) => fastify.log.warn(error, 'Email queue reconciliation is unavailable'));
  const reconciliationTimer = setInterval(() => void Promise.allSettled([reconcileAuditExports(), reconcileAdminCommands(), reconcileEmailQueue()]), 60_000);
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

function isEmailResult(value: unknown): value is EmailDeliveryResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<EmailDeliveryResult>;
  return ['ACCEPTED', 'SENT', 'FAILED', 'SUPPRESSED'].includes(result.status ?? '') &&
    (result.providerMessageId == null || typeof result.providerMessageId === 'string') &&
    (result.error == null || typeof result.error === 'string');
}

bootstrap().catch((err) => {
  console.error('[subgraph-admin] Fatal startup error', err);
  process.exit(1);
});
