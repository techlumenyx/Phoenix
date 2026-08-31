import { Queue, Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { EMAIL_DELIVERY_QUEUE, EMAIL_SCHEDULER_QUEUE, type EmailDeliveryJob, type EmailDeliveryResult } from '@christian-listings/email';
import { CONTENT_RISK_QUEUE, type ContentRiskAnalysisResult, type MarketplaceRiskAnalysisJob } from '@christian-listings/types';
import { getEmailProvider } from './providers';
import { startSesEventPoller } from './ses-event-poller';
import { analyseMarketplaceRisk } from './risk-provider';

async function bootstrap() {
  const emailEnabled = process.env['EMAIL_ENABLED'] === 'true';
  const riskEnabled = process.env['AI_RISK_ENABLED'] === 'true';
  if (!emailEnabled && !riskEnabled) {
    console.log('[worker] email delivery and AI risk analysis disabled; waiting without Redis or provider connections');
    await waitUntilShutdown();
    return;
  }
  const redisUrl = process.env['REDIS_URL'] ?? 'redis://127.0.0.1:6379';
  const resources: Array<{ close(): Promise<void> }> = [];

  if (emailEnabled) {
    const provider = getEmailProvider();
    provider.configure();
    const deliveryQueue = new Queue<EmailDeliveryJob>(EMAIL_DELIVERY_QUEUE, { connection: new IORedis(redisUrl, { maxRetriesPerRequest: 2 }) });
    const schedulerQueue = new Queue(EMAIL_SCHEDULER_QUEUE, { connection: new IORedis(redisUrl, { maxRetriesPerRequest: 2 }) });
    const deliveryWorker = new Worker<EmailDeliveryJob>(EMAIL_DELIVERY_QUEUE, async (job) => {
      const result = await provider.deliver(job.data);
      const recorded = await reportResult(job.data.deliveryId, result)
        .then(() => true)
        .catch((error) => { console.error('[worker] email was accepted but its result could not be recorded', error); return false; });
      return { result, recorded };
    }, { connection: new IORedis(redisUrl, { maxRetriesPerRequest: null }), concurrency: positiveInt('EMAIL_WORKER_CONCURRENCY', 5) });

    deliveryWorker.on('completed', (job, result: { recorded?: boolean }) => {
      if (result?.recorded) void job.remove().catch((error) => console.error('[worker] completed email job cleanup failed', error));
    });
    deliveryWorker.on('failed', (job, error) => {
      if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
        void reportResult(job.data.deliveryId, { status: 'FAILED', error: error.message }).catch((reportError) => console.error('[worker] failed to record final email error', reportError));
      }
    });
    const schedulerWorker = new Worker(EMAIL_SCHEDULER_QUEUE, async () => {
      const jobs = await claimDueEmails();
      await Promise.all(jobs.map((data) => deliveryQueue.add('deliver', data, deliveryOptions(data.deliveryId))));
      return { queued: jobs.length };
    }, { connection: new IORedis(redisUrl, { maxRetriesPerRequest: null }), concurrency: 1 });
    await schedulerQueue.upsertJobScheduler('email-schedule-scan', { every: positiveInt('EMAIL_SCHEDULE_SCAN_MS', 60_000) }, { name: 'scan-due-emails', data: {} });
    resources.push(deliveryWorker, schedulerWorker, deliveryQueue, schedulerQueue);

    const emailProviderName = process.env['EMAIL_PROVIDER'] ?? 'sendgrid';
    if (emailProviderName === 'ses') {
      resources.push(startSesEventPoller());
    }
    console.log(`[worker] email queues ready; provider=${emailProviderName}`);
  }

  if (riskEnabled) {
    if ((process.env['AI_RISK_PROVIDER'] ?? 'gemini') !== 'gemini') throw new Error('AI_RISK_PROVIDER must be gemini');
    if (!process.env['GEMINI_API_KEY']) throw new Error('GEMINI_API_KEY is required when AI risk analysis is enabled');
    const riskWorker = new Worker<MarketplaceRiskAnalysisJob>(CONTENT_RISK_QUEUE, async (job) => {
      await markRiskProcessing(job.data.analysisId);
      const result = await analyseMarketplaceRisk(job.data);
      await reportRiskResult(job.data.analysisId, result);
      return result;
    }, { connection: new IORedis(redisUrl, { maxRetriesPerRequest: null }), concurrency: positiveInt('AI_RISK_WORKER_CONCURRENCY', 2) });
    riskWorker.on('failed', (job, error) => {
      if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
        void reportRiskResult(job.data.analysisId, {
          status: 'FAILED', provider: 'GEMINI', model: process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash', error: error.message,
        }).catch((reportError) => console.error('[worker] failed to record final risk analysis error', reportError));
      }
    });
    resources.push(riskWorker);
    console.log(`[worker] AI risk queue ready; provider=gemini model=${process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash'} mode=shadow`);
  }

  const shutdown = async () => {
    await Promise.allSettled(resources.map((resource) => resource.close()));
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());
}

async function claimDueEmails(): Promise<EmailDeliveryJob[]> {
  const response = await internalFetch('/internal/emails/claim-due', {});
  if (!response.ok) throw new Error(`Scheduled email claim failed with HTTP ${response.status}`);
  const payload = await response.json() as { jobs: EmailDeliveryJob[] };
  return payload.jobs;
}

async function reportResult(deliveryId: string, result: EmailDeliveryResult) {
  const response = await internalFetch(`/internal/emails/${encodeURIComponent(deliveryId)}/result`, result);
  if (!response.ok) throw new Error(`Email result update failed with HTTP ${response.status}`);
}

async function markRiskProcessing(analysisId: string) {
  const response = await internalFetch(`/internal/risk-analyses/${encodeURIComponent(analysisId)}/start`, {});
  if (!response.ok) throw new Error(`Risk analysis start update failed with HTTP ${response.status}`);
}

async function reportRiskResult(analysisId: string, result: ContentRiskAnalysisResult) {
  const response = await internalFetch(`/internal/risk-analyses/${encodeURIComponent(analysisId)}/result`, result);
  if (!response.ok) throw new Error(`Risk analysis result update failed with HTTP ${response.status}`);
}

function internalFetch(path: string, body: unknown) {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) throw new Error('INTERNAL_SERVICE_KEY is required');
  return fetch(`${process.env['ADMIN_INTERNAL_URL'] ?? 'http://localhost:4004'}${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-cl-service-key': secret }, body: JSON.stringify(body),
  });
}

function deliveryOptions(deliveryId: string) {
  return { jobId: deliveryId, attempts: positiveInt('EMAIL_MAX_ATTEMPTS', 5), backoff: { type: 'exponential' as const, delay: positiveInt('EMAIL_RETRY_DELAY_MS', 5_000) }, removeOnComplete: false, removeOnFail: 5000 };
}
function positiveInt(name: string, fallback: number) { const value = Number(process.env[name] ?? fallback); return Number.isInteger(value) && value > 0 ? value : fallback; }

function waitUntilShutdown() {
  return new Promise<void>((resolve) => {
    const keepAlive = setInterval(() => undefined, 2_147_000_000);
    const stop = () => { clearInterval(keepAlive); resolve(); };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
}

bootstrap().catch((error) => { console.error('[worker] fatal startup error', error); process.exit(1); });
