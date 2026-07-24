import { EventWebhook } from '@sendgrid/eventwebhook';
import mongoose from 'mongoose';
import { EmailDeliveryModel } from '../models';

export interface SendGridEvent {
  event?: string;
  timestamp?: number;
  sg_event_id?: string;
  sg_message_id?: string;
  cl_delivery_id?: string;
  response?: string;
  reason?: string;
}

export function verifySendGridWebhook(payload: Buffer, signature: string, timestamp: string) {
  const pem = process.env['SENDGRID_WEBHOOK_PUBLIC_KEY'];
  if (!pem) throw new Error('SENDGRID_WEBHOOK_PUBLIC_KEY is not configured');
  const verifier = new EventWebhook();
  return verifier.verifySignature(verifier.convertPublicKeyToECDSA(pem.replace(/\\n/g, '\n')), payload, signature, timestamp);
}

export async function ingestSendGridEvents(events: SendGridEvent[]) {
  let matched = 0;
  for (const item of events) {
    if (!item.event || (!item.sg_message_id && !item.cl_delivery_id)) continue;
    const response = (item.response ?? item.reason ?? '').slice(0, 2000) || null;
    const occurredAt = new Date((item.timestamp ?? Math.floor(Date.now() / 1000)) * 1000);
    const update: Record<string, unknown> = { $push: { events: { eventId: item.sg_event_id ?? null, event: item.event, occurredAt, response } } };
    if (item.event === 'delivered') update['$set'] = { status: 'SENT', sentAt: occurredAt, error: null };
    if (['bounce', 'dropped', 'spamreport'].includes(item.event)) update['$set'] = { status: 'FAILED', error: response ?? `SendGrid reported ${item.event}` };
    const messageIds = item.sg_message_id
      ? [...new Set([item.sg_message_id, normaliseMessageId(item.sg_message_id)])]
      : [];
    const identityFilters: Record<string, unknown>[] = [];
    if (item.cl_delivery_id && mongoose.isValidObjectId(item.cl_delivery_id)) identityFilters.push({ _id: item.cl_delivery_id });
    if (messageIds.length) identityFilters.push({ providerMessageId: { $in: messageIds } });
    if (!identityFilters.length) continue;
    const filter: Record<string, unknown> = { $or: identityFilters };
    if (item.sg_event_id) filter['events.eventId'] = { $ne: item.sg_event_id };
    const doc = await EmailDeliveryModel.findOneAndUpdate(filter, update, { new: true });
    if (doc) matched += 1;
  }
  return matched;
}

function normaliseMessageId(value: string) { return value.split('.')[0]; }
