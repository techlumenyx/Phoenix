import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, type Message } from '@aws-sdk/client-sqs';

interface SnsEnvelope {
  Type: string;
  Message: string;
}

export function startSesEventPoller(): { close(): Promise<void> } {
  const queueUrl = process.env['SQS_EVENT_QUEUE_URL'];
  if (!queueUrl) throw new Error('SQS_EVENT_QUEUE_URL is required when EMAIL_PROVIDER=ses');
  const region = process.env['AWS_REGION'];
  if (!region) throw new Error('AWS_REGION is required when EMAIL_PROVIDER=ses');

  const client = new SQSClient({ region });
  const controller = new AbortController();
  const loop = pollLoop();

  return {
    async close() {
      controller.abort();
      await loop;
    },
  };

  async function pollLoop() {
    while (!controller.signal.aborted) {
      try {
        const { Messages } = await client.send(new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
        }), { abortSignal: controller.signal });
        if (Messages?.length) await processMessages(Messages);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('[worker] SES event poll failed', error);
      }
    }
  }

  async function processMessages(messages: Message[]) {
    const events: unknown[] = [];
    const deletable: Message[] = [];

    for (const message of messages) {
      try {
        const envelope = JSON.parse(message.Body ?? '{}') as SnsEnvelope;
        if (envelope.Type === 'SubscriptionConfirmation') {
          // SQS subscriptions don't need the confirmation handshake HTTPS endpoints do,
          // but a stray console-created HTTPS-style message shouldn't crash the poller.
          deletable.push(message);
          continue;
        }
        events.push({ snsMessageId: message.MessageId, sesEvent: JSON.parse(envelope.Message) });
        deletable.push(message);
      } catch (error) {
        console.error('[worker] SES event message could not be parsed, leaving for redelivery', error);
      }
    }

    if (events.length === 0) return;

    const response = await internalFetch('/internal/emails/ses-events', { events });
    if (!response.ok) {
      console.error(`[worker] SES event batch was not accepted (HTTP ${response.status}); leaving messages for redelivery`);
      return;
    }

    await Promise.all(deletable.map((message) =>
      client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle }))
        .catch((error) => console.error('[worker] failed to delete processed SQS message', error)),
    ));
  }
}

function internalFetch(path: string, body: unknown) {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) throw new Error('INTERNAL_SERVICE_KEY is required');
  return fetch(`${process.env['ADMIN_INTERNAL_URL'] ?? 'http://localhost:4004'}${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-cl-service-key': secret }, body: JSON.stringify(body),
  });
}
