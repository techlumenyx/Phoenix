const mockSend = jest.fn();

jest.mock('@aws-sdk/client-sqs', () => ({
  __esModule: true,
  SQSClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  ReceiveMessageCommand: jest.fn().mockImplementation((input) => ({ kind: 'receive', input })),
  DeleteMessageCommand: jest.fn().mockImplementation((input) => ({ kind: 'delete', input })),
}));

import { startSesEventPoller } from './ses-event-poller';

const originalFetch = global.fetch;

function snsMessage(receiptHandle: string, sesEvent: unknown) {
  return { MessageId: receiptHandle, ReceiptHandle: receiptHandle, Body: JSON.stringify({ Type: 'Notification', Message: JSON.stringify(sesEvent) }) };
}

/**
 * Real SQS long-polls for up to WaitTimeSeconds server-side, so an empty
 * result never arrives instantly. The mock reproduces that: the first
 * receive resolves immediately with `firstBatch`, every receive after
 * that just sits pending until the poller's AbortController fires —
 * exactly like a real in-flight long-poll being cancelled on shutdown.
 * (A mock that resolves every call immediately would spin the real
 * poll loop as fast as the CPU allows and OOM the test process.)
 */
function mockSqsSession(firstBatch: unknown[]) {
  let receiveCount = 0;
  mockSend.mockImplementation((command: { kind: string }, options?: { abortSignal?: AbortSignal }) => {
    if (command.kind === 'delete') return Promise.resolve({});
    receiveCount += 1;
    if (receiveCount === 1) return Promise.resolve({ Messages: firstBatch });
    return new Promise((_resolve, reject) => {
      options?.abortSignal?.addEventListener('abort', () => {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        reject(error);
      });
    });
  });
}

async function flushMicrotasks() {
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
}

describe('SES event poller', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, SQS_EVENT_QUEUE_URL: 'https://sqs.example/queue', AWS_REGION: 'eu-west-1', INTERNAL_SERVICE_KEY: 'secret' };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('requires SQS_EVENT_QUEUE_URL', () => {
    delete process.env['SQS_EVENT_QUEUE_URL'];
    expect(() => startSesEventPoller()).toThrow('SQS_EVENT_QUEUE_URL is required');
  });

  it('forwards unwrapped SES events to the internal endpoint and deletes them once accepted', async () => {
    const sesEvent = { eventType: 'Delivery', mail: { tags: { cl_delivery_id: ['abc123'] } } };
    mockSqsSession([snsMessage('receipt-1', sesEvent)]);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const poller = startSesEventPoller();
    await flushMicrotasks();
    await poller.close();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/internal/emails/ses-events'),
      expect.objectContaining({ body: JSON.stringify({ events: [{ snsMessageId: 'receipt-1', sesEvent }] }) }),
    );
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ kind: 'delete', input: expect.objectContaining({ ReceiptHandle: 'receipt-1' }) }));
  });

  it('leaves messages in the queue for redelivery when the internal endpoint rejects the batch', async () => {
    const sesEvent = { eventType: 'Bounce' };
    mockSqsSession([snsMessage('receipt-2', sesEvent)]);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    const poller = startSesEventPoller();
    await flushMicrotasks();
    await poller.close();

    expect(mockSend).not.toHaveBeenCalledWith(expect.objectContaining({ kind: 'delete' }));
  });

  it('closes promptly by aborting an in-flight long-poll rather than waiting it out', async () => {
    mockSqsSession([]); // empty first batch — second receive call hangs until aborted
    const poller = startSesEventPoller();
    await flushMicrotasks();

    const closed = poller.close();
    await expect(closed).resolves.toBeUndefined();
  });
});
