import { createHash } from 'crypto';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import {
  CONTENT_RISK_QUEUE,
  RISK_SIGNAL_CODES,
  type ContentRiskAnalysisResult,
  type MarketplaceRiskAnalysisJob,
} from '@christian-listings/types';
import { ContentRiskAnalysisModel } from '../models';

export type MarketplaceRiskAnalysisIntent = Omit<MarketplaceRiskAnalysisJob, 'analysisId'>;

let riskQueue: Queue<MarketplaceRiskAnalysisJob> | null = null;

export async function acceptRiskAnalysisIntent(input: MarketplaceRiskAnalysisIntent) {
  const contentHash = hashContent(input.content);
  const existing = await ContentRiskAnalysisModel.findOne({ targetId: input.targetId, contentHash });
  if (existing) return existing;

  let doc;
  try {
    doc = await ContentRiskAnalysisModel.create({
      targetId: input.targetId,
      targetType: 'MARKETPLACE_ITEM',
      targetService: 'CLASSIFIEDS',
      title: input.content.title.trim().slice(0, 300),
      content: input.content,
      contentHash,
      mode: 'SHADOW',
      status: riskAnalysisEnabled() ? 'PENDING' : 'SKIPPED',
      provider: 'GEMINI',
      model: configuredModel(),
      error: riskAnalysisEnabled() ? null : 'AI risk analysis is disabled',
    });
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      const duplicate = await ContentRiskAnalysisModel.findOne({ targetId: input.targetId, contentHash });
      if (duplicate) return duplicate;
    }
    throw error;
  }

  if (doc.status === 'PENDING') {
    await enqueueRiskAnalysis(doc._id.toString(), input).catch(() => undefined);
  }
  return doc;
}

export async function markRiskAnalysisProcessing(id: string) {
  return ContentRiskAnalysisModel.findOneAndUpdate(
    { _id: id, status: { $in: ['PENDING', 'PROCESSING'] } },
    { $set: { status: 'PROCESSING', error: null }, $inc: { attemptCount: 1 } },
    { new: true },
  );
}

export async function recordRiskAnalysisResult(id: string, result: ContentRiskAnalysisResult) {
  if (result.status === 'FAILED') {
    return ContentRiskAnalysisModel.findByIdAndUpdate(id, {
      $set: { status: 'FAILED', provider: result.provider, model: result.model, error: safeError(result.error), completedAt: new Date() },
    }, { new: true, runValidators: true });
  }
  return ContentRiskAnalysisModel.findByIdAndUpdate(id, {
    $set: {
      status: 'COMPLETED', provider: result.provider, model: result.model,
      score: result.score, level: result.level, summary: result.summary,
      recommendedAction: result.recommendedAction, signals: result.signals ?? [],
      error: null, completedAt: new Date(),
    },
  }, { new: true, runValidators: true });
}

export async function reconcileRiskAnalysisQueue() {
  if (!riskAnalysisEnabled()) return;
  const docs = await ContentRiskAnalysisModel.find({ status: { $in: ['PENDING', 'PROCESSING'] } }).sort({ createdAt: 1 }).limit(500);
  await Promise.all(docs.map(async (doc) => {
    await ensureRiskAnalysisJob(doc._id.toString(), { targetId: doc.targetId, content: doc.content });
  }));
}

export async function retryRiskAnalysis(id: string) {
  if (!riskAnalysisEnabled()) throw new Error('AI risk analysis is disabled');
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await ContentRiskAnalysisModel.findOneAndUpdate(
    { _id: id, status: { $in: ['FAILED', 'SKIPPED'] } },
    { $set: {
      status: 'PENDING', score: null, level: null, summary: null, recommendedAction: null,
      signals: [], error: null, attemptCount: 0, completedAt: null,
    } },
    { new: true, runValidators: true },
  );
  if (!doc) return null;
  await ensureRiskAnalysisJob(doc._id.toString(), { targetId: doc.targetId, content: doc.content });
  return doc;
}

export function isRiskAnalysisIntent(value: unknown): value is MarketplaceRiskAnalysisIntent {
  if (!value || typeof value !== 'object') return false;
  const input = value as Partial<MarketplaceRiskAnalysisIntent>;
  const content = input.content;
  return typeof input.targetId === 'string' && input.targetId.length > 0 && input.targetId.length <= 100 &&
    Boolean(content) && typeof content?.title === 'string' && content.title.trim().length > 0 && content.title.length <= 300 &&
    typeof content?.description === 'string' && content.description.length <= 10_000 &&
    typeof content?.category === 'string' && content.category.length <= 100 &&
    typeof content?.condition === 'string' && content.condition.length <= 100 &&
    typeof content?.price === 'number' && Number.isFinite(content.price) && content.price >= 0 &&
    typeof content?.currency === 'string' && content.currency.length <= 10 &&
    typeof content?.isDonation === 'boolean' && typeof content?.region === 'string' && content.region.length <= 200;
}

export function isRiskAnalysisResult(value: unknown): value is ContentRiskAnalysisResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<ContentRiskAnalysisResult>;
  if (!['COMPLETED', 'FAILED'].includes(result.status ?? '') || result.provider !== 'GEMINI' || typeof result.model !== 'string') return false;
  if (result.status === 'FAILED') return typeof result.error === 'string' && result.error.length > 0;
  return typeof result.score === 'number' && result.score >= 0 && result.score <= 100 &&
    ['LOW', 'MEDIUM', 'HIGH'].includes(result.level ?? '') && typeof result.summary === 'string' &&
    result.summary.length <= 1000 && ['NONE', 'REVIEW', 'PENDING_REVIEW'].includes(result.recommendedAction ?? '') &&
    Array.isArray(result.signals) && result.signals.length <= 10 && result.signals.every((signal) =>
      Boolean(signal) && RISK_SIGNAL_CODES.includes(signal.code) && typeof signal.confidence === 'number' &&
      signal.confidence >= 0 && signal.confidence <= 1 && typeof signal.explanation === 'string' &&
      signal.explanation.length > 0 && signal.explanation.length <= 500 &&
      (signal.evidenceExcerpt === null || typeof signal.evidenceExcerpt === 'string' && signal.evidenceExcerpt.length <= 200));
}

function hashContent(content: MarketplaceRiskAnalysisJob['content']) {
  return createHash('sha256').update(JSON.stringify({
    title: content.title.trim(), description: content.description.trim(), category: content.category,
    condition: content.condition, price: content.price, currency: content.currency.toUpperCase(),
    isDonation: content.isDonation, region: content.region.trim(),
  })).digest('hex');
}

async function enqueueRiskAnalysis(analysisId: string, input: MarketplaceRiskAnalysisIntent) {
  await getRiskQueue().add('analyse-marketplace-listing', { ...input, analysisId }, {
    jobId: analysisId,
    attempts: positiveInt('AI_RISK_MAX_ATTEMPTS', 3),
    backoff: { type: 'exponential', delay: positiveInt('AI_RISK_RETRY_DELAY_MS', 10_000) },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  });
}

async function ensureRiskAnalysisJob(analysisId: string, input: MarketplaceRiskAnalysisIntent) {
  const queue = getRiskQueue();
  const existing = await queue.getJob(analysisId);
  if (existing) {
    const state = await existing.getState();
    if (!['completed', 'failed'].includes(state)) return existing;
    await existing.remove();
  }
  return enqueueRiskAnalysis(analysisId, input);
}

function getRiskQueue() {
  if (!riskQueue) riskQueue = new Queue<MarketplaceRiskAnalysisJob>(CONTENT_RISK_QUEUE, {
    connection: new IORedis(process.env['REDIS_URL'] ?? 'redis://127.0.0.1:6379', { maxRetriesPerRequest: 2 }),
  });
  return riskQueue;
}

export function riskAnalysisEnabled() {
  return process.env['AI_RISK_ENABLED'] === 'true' && (process.env['AI_RISK_PROVIDER'] ?? 'gemini') === 'gemini';
}
function configuredModel() { return process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash'; }
function positiveInt(name: string, fallback: number) { const value = Number(process.env[name] ?? fallback); return Number.isInteger(value) && value > 0 ? value : fallback; }
function safeError(value?: string) { return (value?.trim() || 'Risk analysis failed').slice(0, 1000); }
