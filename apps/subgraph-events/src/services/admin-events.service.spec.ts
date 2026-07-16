import { EventModel, EventOrganisationNotificationModel, EventSeriesModel } from '../models';
import { applyAdminEventAction } from './admin-events.service';

jest.mock('../models', () => ({ EventModel: { findById: jest.fn(), updateMany: jest.fn(), updateOne: jest.fn() }, EventSeriesModel: { updateOne: jest.fn() }, EventOrganisationNotificationModel: { updateOne: jest.fn() } }));

describe('applyAdminEventAction', () => {
  beforeEach(() => jest.clearAllMocks());
  it('cancels an entire recurring series when series scope is selected', async () => {
    const event = { _id: 'event-1', seriesId: 'series-1', organisationId: 'org-1' };
    (EventModel.findById as jest.Mock).mockResolvedValue(event);
    (EventModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 4 });
    const result = await applyAdminEventAction({ id: 'event-1', action: 'CANCEL', scope: 'SERIES', reason: 'Platform safety review.' });
    expect(EventModel.updateMany).toHaveBeenCalledWith({ seriesId: 'series-1' }, { $set: { status: 'CANCELLED' } });
    expect(EventSeriesModel.updateOne).toHaveBeenCalledWith({ _id: 'series-1' }, { $set: { status: 'CANCELLED' } });
    expect(EventOrganisationNotificationModel.updateOne).toHaveBeenCalled();
    expect(result).toEqual({ changed: 4, status: 'CANCELLED' });
  });
});
