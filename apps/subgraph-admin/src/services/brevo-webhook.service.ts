import { timingSafeEqual } from 'crypto';
import mongoose from 'mongoose';
import { EmailDeliveryModel } from '../models';

export interface BrevoEvent {
  event?: string;
  'message-id'?: string;
  tags?: string[];
  ts_event?: number;
  reason?: string;
}

// Brevo doesn't sign webhook payloads (no HMAC/signature header). Instead the
// webhook is configured with Bearer-token auth at creation time — Brevo sends
// that exact token back on every call, which is what we verify here.
export function verifyBrevoWebhook(authorizationHeader: string | undefined): boolean {
  const expected = process.env['BREVO_WEBHOOK_TOKEN'];
  if (!expected) throw new Error('BREVO_WEBHOOK_TOKEN is not configured');
  if (!authorizationHeader?.startsWith('Bearer ')) return false;
  const provided = Buffer.from(authorizationHeader.slice('Bearer '.length));
  const expectedBuffer = Buffer.from(expected);
  if (provided.length !== expectedBuffer.length) return false;
  return timingSafeEqual(provided, expectedBuffer);
}

const FAILURE_EVENTS = new Set(['hard_bounce', 'soft_bounce', 'blocked', 'spam', 'invalid_email', 'error']);
const DELIVERY_TAG_PREFIX = 'cl_delivery_id:';

export async function ingestBrevoEvents(events: BrevoEvent[]) {
  let matched = 0;
  for (const item of events) {
    const eventType = item.event;
    if (!eventType) continue;

    const messageId = item['message-id'];
    const deliveryTag = item.tags?.find((tag) => tag.startsWith(DELIVERY_TAG_PREFIX));
    const deliveryId = deliveryTag?.slice(DELIVERY_TAG_PREFIX.length);
    const identityFilters: Record<string, unknown>[] = [];
    if (deliveryId && mongoose.isValidObjectId(deliveryId)) identityFilters.push({ _id: deliveryId });
    if (messageId) identityFilters.push({ providerMessageId: messageId });
    if (!identityFilters.length) continue;

    const occurredAt = item.ts_event ? new Date(item.ts_event * 1000) : new Date();
    const response = (item.reason ?? '').slice(0, 2000) || null;
    // Brevo's webhook "id" field identifies the webhook configuration, not the
    // individual event, so it can't be used to de-duplicate retried deliveries.
    const update: Record<string, unknown> = { $push: { events: { eventId: null, event: eventType, occurredAt, response } } };
    if (eventType === 'delivered') update['$set'] = { status: 'SENT', sentAt: occurredAt, error: null };
    if (FAILURE_EVENTS.has(eventType)) update['$set'] = { status: 'FAILED', error: response ?? `Brevo reported ${eventType}` };

    const doc = await EmailDeliveryModel.findOneAndUpdate({ $or: identityFilters }, update, { new: true });
    if (doc) matched += 1;
  }
  return matched;
}
