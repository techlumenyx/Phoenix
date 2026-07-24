import mongoose from 'mongoose';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { EMAIL_DELIVERY_QUEUE, EMAIL_TEMPLATE_KEYS, renderEmail, type EmailDeliveryJob, type EmailDeliveryResult, type EmailIntent, type EmailTemplateKey } from '@christian-listings/email';
import { EmailDeliveryModel, ScheduledEmailModel } from '../models';

let deliveryQueue: Queue<EmailDeliveryJob> | null = null;

export async function acceptEmailIntent(intent: EmailIntent) {
  const existingDelivery = await EmailDeliveryModel.findOne({ idempotencyKey: intent.idempotencyKey });
  if (existingDelivery) return existingDelivery;
  const existingSchedule = await ScheduledEmailModel.findOne({ idempotencyKey: intent.idempotencyKey });
  if (existingSchedule) {
    if (existingSchedule.status === 'CANCELLED' && intent.scheduledFor) {
      existingSchedule.status = 'SCHEDULED';
      existingSchedule.scheduledFor = new Date(intent.scheduledFor);
      existingSchedule.variables = intent.variables;
      existingSchedule.replyTo = intent.replyTo ?? null;
      await existingSchedule.save();
    }
    return existingSchedule;
  }
  const scheduledFor = intent.scheduledFor ? new Date(intent.scheduledFor) : null;
  try {
    if (scheduledFor && !Number.isNaN(scheduledFor.getTime()) && scheduledFor.getTime() > Date.now()) {
      return await ScheduledEmailModel.create({
        templateKey: intent.templateKey, to: normaliseEmail(intent.to), variables: intent.variables, replyTo: intent.replyTo ?? null,
        idempotencyKey: intent.idempotencyKey, scheduledFor, status: 'SCHEDULED', ...sourceFields(intent),
      });
    }
    return await createAndQueueDelivery(intent);
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
    return (await EmailDeliveryModel.findOne({ idempotencyKey: intent.idempotencyKey }))
      ?? (await ScheduledEmailModel.findOne({ idempotencyKey: intent.idempotencyKey }))
      ?? Promise.reject(error);
  }
}

export async function claimDueEmails(limit = 100): Promise<EmailDeliveryJob[]> {
  const jobs: EmailDeliveryJob[] = [];
  for (let index = 0; index < limit; index += 1) {
    const schedule = await ScheduledEmailModel.findOneAndUpdate(
      { status: 'SCHEDULED', scheduledFor: { $lte: new Date() } },
      { $set: { status: 'CLAIMED', claimedAt: new Date() } }, { sort: { scheduledFor: 1 }, new: true },
    );
    if (!schedule) break;
    try {
      const rendered = renderEmail(schedule.templateKey as EmailTemplateKey, schedule.variables);
      const delivery = await EmailDeliveryModel.create({
        templateKey: schedule.templateKey, to: schedule.to, ...rendered, replyTo: schedule.replyTo,
        idempotencyKey: schedule.idempotencyKey, status: emailEnabled() ? 'QUEUED' : 'SUPPRESSED', provider: 'sendgrid',
        ...scheduleSourceFields(schedule), queuedAt: emailEnabled() ? new Date() : null,
      });
      schedule.deliveryId = delivery._id;
      await schedule.save();
      if (emailEnabled()) jobs.push(toJob(delivery));
    } catch (error) {
      schedule.status = 'SCHEDULED';
      schedule.claimedAt = null;
      await schedule.save();
      throw error;
    }
  }
  return jobs;
}

export async function recordEmailResult(id: string, result: EmailDeliveryResult) {
  if (!mongoose.isValidObjectId(id)) return null;
  const allowedStatuses = result.status === 'ACCEPTED'
    ? ['QUEUED']
    : result.status === 'FAILED'
      ? ['QUEUED', 'ACCEPTED']
      : result.status === 'SUPPRESSED'
        ? ['QUEUED']
        : ['QUEUED', 'ACCEPTED', 'FAILED'];
  return EmailDeliveryModel.findOneAndUpdate({ _id: id, status: { $in: allowedStatuses } }, {
    $set: { status: result.status, providerMessageId: result.providerMessageId ?? null, error: result.error?.slice(0, 2000) ?? null, ...(result.status === 'SENT' && { sentAt: new Date() }) },
    $inc: { attemptCount: 1 },
  }, { new: true });
}

export async function reconcileEmailQueue() {
  if (!emailEnabled()) return { recoveredSchedules: 0, requeuedDeliveries: 0 };

  const staleBefore = new Date(Date.now() - 5 * 60 * 1000);
  const staleSchedules = await ScheduledEmailModel.find({ status: 'CLAIMED', claimedAt: { $lte: staleBefore }, deliveryId: null }).limit(500);
  let recoveredSchedules = 0;
  for (const schedule of staleSchedules) {
    const delivery = await EmailDeliveryModel.findOne({ idempotencyKey: schedule.idempotencyKey }).select('_id');
    if (delivery) {
      schedule.deliveryId = delivery._id;
    } else {
      schedule.status = 'SCHEDULED';
      schedule.claimedAt = null;
      recoveredSchedules += 1;
    }
    await schedule.save();
  }

  const queued = await EmailDeliveryModel.find({ status: 'QUEUED' }).sort({ queuedAt: 1 }).limit(1000);
  for (const delivery of queued) {
    await getDeliveryQueue().add('deliver', toJob(delivery), deliveryOptions(delivery._id.toString()));
  }
  return { recoveredSchedules, requeuedDeliveries: queued.length };
}

export async function cancelScheduledEmail(idempotencyKey: string) {
  return ScheduledEmailModel.findOneAndUpdate({ idempotencyKey, status: 'SCHEDULED' }, { $set: { status: 'CANCELLED' } }, { new: true });
}

export async function retryEmailDelivery(id: string) {
  if (!emailEnabled()) throw new Error('Email delivery is disabled');
  if (!mongoose.isValidObjectId(id)) return null;
  const delivery = await EmailDeliveryModel.findOneAndUpdate({ _id: id, status: 'FAILED' }, { $set: { status: 'QUEUED', error: null, queuedAt: new Date() } }, { new: true });
  if (!delivery) return null;
  try { await getDeliveryQueue().add('deliver', toJob(delivery), deliveryOptions(`${delivery._id}-retry-${delivery.attemptCount + 1}`)); }
  catch (error) { delivery.status = 'FAILED'; delivery.error = error instanceof Error ? error.message : 'Queue unavailable'; await delivery.save(); throw error; }
  return delivery;
}

async function createAndQueueDelivery(intent: EmailIntent) {
  const rendered = renderEmail(intent.templateKey, intent.variables);
  const enabled = emailEnabled();
  const delivery = await EmailDeliveryModel.create({
    templateKey: intent.templateKey, to: normaliseEmail(intent.to), ...rendered, replyTo: intent.replyTo ?? null,
    idempotencyKey: intent.idempotencyKey, status: enabled ? 'QUEUED' : 'SUPPRESSED', provider: 'sendgrid', ...sourceFields(intent), queuedAt: enabled ? new Date() : null,
  });
  if (enabled) {
    try { await getDeliveryQueue().add('deliver', toJob(delivery), deliveryOptions(delivery._id.toString())); }
    catch (error) {
      delivery.status = 'FAILED'; delivery.error = error instanceof Error ? error.message : 'Queue unavailable'; await delivery.save(); throw error;
    }
  }
  return delivery;
}

function getDeliveryQueue() {
  if (!deliveryQueue) deliveryQueue = new Queue<EmailDeliveryJob>(EMAIL_DELIVERY_QUEUE, { connection: new IORedis(process.env['REDIS_URL'] ?? 'redis://127.0.0.1:6379', { maxRetriesPerRequest: 2 }) });
  return deliveryQueue;
}
function deliveryOptions(deliveryId: string) { return { jobId: deliveryId, attempts: numberEnv('EMAIL_MAX_ATTEMPTS', 5), backoff: { type: 'exponential' as const, delay: numberEnv('EMAIL_RETRY_DELAY_MS', 5000) }, removeOnComplete: false, removeOnFail: 5000 }; }
function toJob(doc: { _id: { toString(): string }; to: string; subject: string; html: string; text: string; replyTo: string | null }): EmailDeliveryJob { return { deliveryId: doc._id.toString(), to: doc.to, subject: doc.subject, html: doc.html, text: doc.text, replyTo: doc.replyTo }; }
function sourceFields(intent: EmailIntent) { return { sourceService: intent.source?.service ?? null, sourceEntityType: intent.source?.entityType ?? null, sourceEntityId: intent.source?.entityId ?? null }; }
function scheduleSourceFields(schedule: { sourceService: string | null; sourceEntityType: string | null; sourceEntityId: string | null }) { return { sourceService: schedule.sourceService, sourceEntityType: schedule.sourceEntityType, sourceEntityId: schedule.sourceEntityId }; }
function normaliseEmail(value: string) { return value.trim().toLowerCase(); }
function emailEnabled() { return process.env['EMAIL_ENABLED'] === 'true' && (process.env['EMAIL_PROVIDER'] ?? 'sendgrid') === 'sendgrid'; }
function numberEnv(name: string, fallback: number) { const value = Number(process.env[name] ?? fallback); return Number.isInteger(value) && value > 0 ? value : fallback; }
function isDuplicateKeyError(error: unknown) { return error instanceof mongoose.mongo.MongoServerError && error.code === 11000; }

export function isEmailIntent(value: unknown): value is EmailIntent {
  if (!value || typeof value !== 'object') return false;
  const input = value as Partial<EmailIntent>;
  return EMAIL_TEMPLATE_KEYS.includes(input.templateKey as EmailTemplateKey) && typeof input.to === 'string' && /^\S+@\S+\.\S+$/.test(input.to) &&
    Boolean(input.variables) && typeof input.variables === 'object' && typeof input.idempotencyKey === 'string' && input.idempotencyKey.length >= 3 && input.idempotencyKey.length <= 250;
}
