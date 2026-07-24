import { Queue, Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { EMAIL_DELIVERY_QUEUE, EMAIL_SCHEDULER_QUEUE, type EmailDeliveryJob, type EmailDeliveryResult } from '@christian-listings/email';
import { configureEmailProvider, deliverEmail } from './email-provider';

async function bootstrap() {
  if (process.env['EMAIL_ENABLED'] !== 'true') {
    console.log('[worker] email delivery disabled; waiting without Redis or SendGrid connections');
    await waitUntilShutdown();
    return;
  }
  const redisUrl = process.env['REDIS_URL'] ?? 'redis://127.0.0.1:6379';
  configureEmailProvider();
  const deliveryQueue = new Queue<EmailDeliveryJob>(EMAIL_DELIVERY_QUEUE, { connection: new IORedis(redisUrl, { maxRetriesPerRequest: 2 }) });
  const schedulerQueue = new Queue(EMAIL_SCHEDULER_QUEUE, { connection: new IORedis(redisUrl, { maxRetriesPerRequest: 2 }) });
  const deliveryWorker = new Worker<EmailDeliveryJob>(EMAIL_DELIVERY_QUEUE, async (job) => {
    const result = await deliverEmail(job.data);
    const recorded = await reportResult(job.data.deliveryId, result)
      .then(() => true)
      .catch((error) => { console.error('[worker] email was accepted but its result could not be recorded', error); return false; });
    return { result, recorded };
  }, { connection: new IORedis(redisUrl, { maxRetriesPerRequest: null }), concurrency: positiveInt('EMAIL_WORKER_CONCURRENCY', 5) });

  deliveryWorker.on('completed', (job, result: { recorded?: boolean }) => {
    // Keep an accepted job when the admin callback failed. Its stable BullMQ job ID
    // prevents reconciliation from sending the same provider request again.
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
  console.log(`[worker] email queues ready; provider=${process.env['EMAIL_ENABLED'] === 'true' ? 'sendgrid' : 'disabled'}`);

  const shutdown = async () => {
    await Promise.allSettled([deliveryWorker.close(), schedulerWorker.close(), deliveryQueue.close(), schedulerQueue.close()]);
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
