const mockFindOneAndUpdate = jest.fn();

jest.mock('../models', () => ({
  EmailDeliveryModel: { findOneAndUpdate: mockFindOneAndUpdate },
}));

import { ingestBrevoEvents, verifyBrevoWebhook } from './brevo-webhook.service';

describe('Brevo webhook auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, BREVO_WEBHOOK_TOKEN: 'expected-token' };
  });

  afterAll(() => { process.env = originalEnv; });

  it('accepts a matching bearer token', () => {
    expect(verifyBrevoWebhook('Bearer expected-token')).toBe(true);
  });

  it('rejects a mismatched token', () => {
    expect(verifyBrevoWebhook('Bearer wrong-token')).toBe(false);
  });

  it('rejects a missing or malformed header', () => {
    expect(verifyBrevoWebhook(undefined)).toBe(false);
    expect(verifyBrevoWebhook('expected-token')).toBe(false);
  });

  it('throws when BREVO_WEBHOOK_TOKEN is not configured', () => {
    delete process.env['BREVO_WEBHOOK_TOKEN'];
    expect(() => verifyBrevoWebhook('Bearer anything')).toThrow('BREVO_WEBHOOK_TOKEN is not configured');
  });
});

describe('Brevo webhook ingestion', () => {
  beforeEach(() => jest.clearAllMocks());

  it('correlates delivery events using the cl_delivery_id tag', async () => {
    mockFindOneAndUpdate.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });

    await expect(ingestBrevoEvents([{
      event: 'delivered',
      ts_event: 1_700_000_000,
      'message-id': '<abc@smtp-relay.mailin.fr>',
      tags: ['cl_delivery_id:507f1f77bcf86cd799439011'],
    }])).resolves.toBe(1);

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { $or: expect.arrayContaining([{ _id: '507f1f77bcf86cd799439011' }, { providerMessageId: '<abc@smtp-relay.mailin.fr>' }]) },
      expect.objectContaining({
        $set: expect.objectContaining({ status: 'SENT' }),
        $push: { events: expect.objectContaining({ event: 'delivered' }) },
      }),
      { new: true },
    );
  });

  it('falls back to the provider message ID when no delivery tag is present', async () => {
    mockFindOneAndUpdate.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });

    await expect(ingestBrevoEvents([{ event: 'hard_bounce', 'message-id': '<xyz@smtp-relay.mailin.fr>', reason: 'mailbox does not exist' }]))
      .resolves.toBe(1);

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { $or: [{ providerMessageId: '<xyz@smtp-relay.mailin.fr>' }] },
      expect.objectContaining({ $set: expect.objectContaining({ status: 'FAILED', error: 'mailbox does not exist' }) }),
      { new: true },
    );
  });

  it('ignores an event without a usable delivery identifier', async () => {
    await expect(ingestBrevoEvents([{ event: 'delivered' }])).resolves.toBe(0);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('ignores an event with no event type', async () => {
    await expect(ingestBrevoEvents([{ 'message-id': '<abc@smtp-relay.mailin.fr>' }])).resolves.toBe(0);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });
});
