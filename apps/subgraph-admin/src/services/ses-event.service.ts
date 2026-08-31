import mongoose from 'mongoose';
import { EmailDeliveryModel } from '../models';

export interface SesEvent {
  eventType?: string;
  mail?: { messageId?: string; timestamp?: string; tags?: Record<string, string[]> };
  bounce?: { bouncedRecipients?: Array<{ diagnosticCode?: string }> };
  complaint?: { complaintFeedbackType?: string };
}

export interface SesEventEnvelope {
  snsMessageId?: string;
  sesEvent: SesEvent;
}

const FAILURE_EVENT_TYPES = new Set(['Bounce', 'Complaint', 'Reject']);

export async function ingestSesEvents(items: SesEventEnvelope[]) {
  let matched = 0;
  for (const item of items) {
    const sesEvent = item.sesEvent;
    const eventType = sesEvent?.eventType;
    if (!eventType) continue;

    const deliveryId = sesEvent.mail?.tags?.['cl_delivery_id']?.[0];
    const messageId = sesEvent.mail?.messageId;
    const identityFilters: Record<string, unknown>[] = [];
    if (deliveryId && mongoose.isValidObjectId(deliveryId)) identityFilters.push({ _id: deliveryId });
    if (messageId) identityFilters.push({ providerMessageId: messageId });
    if (!identityFilters.length) continue;

    const occurredAt = sesEvent.mail?.timestamp ? new Date(sesEvent.mail.timestamp) : new Date();
    const response = extractResponse(sesEvent);
    const update: Record<string, unknown> = {
      $push: { events: { eventId: item.snsMessageId ?? null, event: eventType, occurredAt, response } },
    };
    if (eventType === 'Delivery') update['$set'] = { status: 'SENT', sentAt: occurredAt, error: null };
    if (FAILURE_EVENT_TYPES.has(eventType)) update['$set'] = { status: 'FAILED', error: response ?? `SES reported ${eventType}` };

    const filter: Record<string, unknown> = { $or: identityFilters };
    if (item.snsMessageId) filter['events.eventId'] = { $ne: item.snsMessageId };

    const doc = await EmailDeliveryModel.findOneAndUpdate(filter, update, { new: true });
    if (doc) matched += 1;
  }
  return matched;
}

function extractResponse(sesEvent: SesEvent): string | null {
  const raw = sesEvent.bounce?.bouncedRecipients?.[0]?.diagnosticCode ?? sesEvent.complaint?.complaintFeedbackType ?? null;
  return raw ? raw.slice(0, 2000) : null;
}
