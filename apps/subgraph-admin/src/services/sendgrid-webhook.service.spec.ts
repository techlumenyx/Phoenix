const mockFindOneAndUpdate = jest.fn();

jest.mock('../models', () => ({
  EmailDeliveryModel: { findOneAndUpdate: mockFindOneAndUpdate },
}));

import { ingestSendGridEvents } from './sendgrid-webhook.service';

describe('SendGrid webhook ingestion', () => {
  beforeEach(() => jest.clearAllMocks());

  it('correlates delivery events using the internal SendGrid custom argument', async () => {
    mockFindOneAndUpdate.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });

    await expect(ingestSendGridEvents([{
      event: 'delivered',
      timestamp: 1_700_000_000,
      sg_event_id: 'event-1',
      sg_message_id: 'provider-id.filter-1',
      cl_delivery_id: '507f1f77bcf86cd799439011',
    }])).resolves.toBe(1);

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([{ _id: '507f1f77bcf86cd799439011' }]),
        'events.eventId': { $ne: 'event-1' },
      }),
      expect.objectContaining({
        $set: expect.objectContaining({ status: 'SENT' }),
        $push: { events: expect.objectContaining({ eventId: 'event-1', event: 'delivered' }) },
      }),
      { new: true },
    );
  });

  it('ignores an event without a usable delivery identifier', async () => {
    await expect(ingestSendGridEvents([{ event: 'delivered', cl_delivery_id: 'invalid' }])).resolves.toBe(0);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
  });
});
