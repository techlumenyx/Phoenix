const mockFindOneAndUpdate = jest.fn();

jest.mock('../models', () => ({
  EmailDeliveryModel: { findOneAndUpdate: mockFindOneAndUpdate },
}));

import { ingestSesEvents } from './ses-event.service';

describe('SES event ingestion', () => {
  beforeEach(() => jest.clearAllMocks());

  it('correlates delivery events using the cl_delivery_id email tag', async () => {
    mockFindOneAndUpdate.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });

    await expect(ingestSesEvents([{
      snsMessageId: 'sns-event-1',
      sesEvent: {
        eventType: 'Delivery',
        mail: { messageId: 'provider-id', timestamp: '2026-08-19T00:00:00.000Z', tags: { cl_delivery_id: ['507f1f77bcf86cd799439011'] } },
      },
    }])).resolves.toBe(1);

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([{ _id: '507f1f77bcf86cd799439011' }, { providerMessageId: 'provider-id' }]),
        'events.eventId': { $ne: 'sns-event-1' },
      }),
      expect.objectContaining({
        $set: expect.objectContaining({ status: 'SENT' }),
        $push: { events: expect.objectContaining({ eventId: 'sns-event-1', event: 'Delivery' }) },
      }),
      { new: true },
    );
  });

  it('marks a bounce as failed and captures the diagnostic code', async () => {
    mockFindOneAndUpdate.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });

    await expect(ingestSesEvents([{
      snsMessageId: 'sns-event-2',
      sesEvent: {
        eventType: 'Bounce',
        mail: { messageId: 'provider-id-2' },
        bounce: { bouncedRecipients: [{ diagnosticCode: 'smtp; 550 mailbox unavailable' }] },
      },
    }])).resolves.toBe(1);

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ $set: { status: 'FAILED', error: 'smtp; 550 mailbox unavailable' } }),
      { new: true },
    );
  });

  it('ignores an event without a usable delivery identifier', async () => {
    await expect(ingestSesEvents([{ snsMessageId: 'sns-event-3', sesEvent: { eventType: 'Delivery' } }])).resolves.toBe(0);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('ignores an event with no eventType', async () => {
    await expect(ingestSesEvents([{ snsMessageId: 'sns-event-4', sesEvent: {} }])).resolves.toBe(0);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });
});
