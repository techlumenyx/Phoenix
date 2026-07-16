import { executeMarketplaceModerationCommand } from './moderation-command.service';
import { ClassifiedOrganisationNotificationModel, MarketplaceItemModel } from '../models';

jest.mock('../models', () => ({
  MarketplaceItemModel: { findById: jest.fn() },
  ClassifiedOrganisationNotificationModel: { updateOne: jest.fn() },
}));

describe('executeMarketplaceModerationCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  it('restores a warned listing and creates a neutral decision notification', async () => {
    const item = {
      _id: { toString: () => 'listing-id' },
      title: 'Community table',
      organisationId: 'organisation-id',
      status: 'PENDING_REVIEW',
      preReviewStatus: 'RESERVED',
      moderationCaseId: 'case-id',
      save: jest.fn(),
    };
    (MarketplaceItemModel.findById as jest.Mock).mockResolvedValue(item);

    const result = await executeMarketplaceModerationCommand({
      itemId: 'listing-id',
      caseId: 'case-id',
      action: 'WARN',
      reason: 'Please ensure the description is accurate.',
    });

    expect(item.status).toBe('RESERVED');
    expect(item.preReviewStatus).toBeNull();
    expect(item.moderationCaseId).toBeNull();
    expect(item.save).toHaveBeenCalled();
    expect(ClassifiedOrganisationNotificationModel.updateOne).toHaveBeenCalledWith(
      { dedupeKey: 'moderation:case-id:WARN' },
      expect.objectContaining({ $setOnInsert: expect.objectContaining({ type: 'LISTING_MODERATION_DECISION' }) }),
      { upsert: true },
    );
    expect(result).toEqual({ id: 'listing-id', status: 'RESERVED' });
  });

  it('soft-removes a listing while preserving its moderation case reference', async () => {
    const item = {
      _id: { toString: () => 'listing-id' },
      title: 'Unsafe item',
      organisationId: null,
      status: 'PENDING_REVIEW',
      preReviewStatus: 'AVAILABLE',
      moderationCaseId: 'case-id',
      save: jest.fn(),
    };
    (MarketplaceItemModel.findById as jest.Mock).mockResolvedValue(item);

    await executeMarketplaceModerationCommand({ itemId: 'listing-id', caseId: 'case-id', action: 'REMOVE', reason: 'Prohibited item.' });

    expect(item.status).toBe('REMOVED');
    expect(item.moderationCaseId).toBe('case-id');
    expect(ClassifiedOrganisationNotificationModel.updateOne).not.toHaveBeenCalled();
  });
});
