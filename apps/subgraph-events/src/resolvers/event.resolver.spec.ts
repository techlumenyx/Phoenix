import mongoose from 'mongoose';
import * as models from '../models';
import { eventResolvers, validateEventSchedule } from './event.resolver';

describe('event schedule validation', () => {
  const now = new Date('2026-07-31T12:00:00.000Z');

  it('rejects new events that do not start in the future', () => {
    expect(() => validateEventSchedule(new Date('2026-07-31T11:59:00.000Z'), null, true, now)).toThrow('must be in the future');
    expect(() => validateEventSchedule(new Date('2026-07-31T12:00:00.000Z'), null, true, now)).toThrow('must be in the future');
  });

  it('rejects invalid dates and an end that is not after the start', () => {
    expect(() => validateEventSchedule(new Date('invalid'), null, true, now)).toThrow('valid event date');
    expect(() => validateEventSchedule(new Date('2026-08-01T10:00:00.000Z'), new Date('invalid'), true, now)).toThrow('valid event end');
    expect(() => validateEventSchedule(new Date('2026-08-01T10:00:00.000Z'), new Date('2026-08-01T09:00:00.000Z'), true, now)).toThrow('must be after its start');
  });

  it('allows unchanged historical schedules during descriptive edits', () => {
    expect(() => validateEventSchedule(new Date('2026-07-01T10:00:00.000Z'), null, false, now)).not.toThrow();
  });

  it('accepts a valid future schedule', () => {
    expect(() => validateEventSchedule(new Date('2026-08-01T10:00:00.000Z'), new Date('2026-08-01T12:00:00.000Z'), true, now)).not.toThrow();
  });
});

describe('event query filters', () => {
  beforeAll(() => {
    models.setupModels(mongoose.createConnection());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not apply the ticketed filter when GraphQL supplies null', async () => {
    const query = {
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    };
    const find = jest.spyOn(models.EventModel, 'find').mockReturnValue(query as never);

    await (eventResolvers.Query.events as CallableFunction)(null, {
      region: null,
      search: null,
      category: null,
      organisationId: null,
      status: 'PUBLISHED',
      dateFrom: null,
      dateTo: null,
      locationType: null,
      ticketed: null,
      sort: 'NEWEST',
      limit: 12,
      after: null,
      collapseSeries: false,
    });

    expect(find).toHaveBeenCalledWith({ status: 'PUBLISHED' });
  });
});

describe('recurring event cancellation scopes', () => {
  const organisationId = new mongoose.Types.ObjectId();
  const seriesId = new mongoose.Types.ObjectId();
  const occurrenceId = new mongoose.Types.ObjectId();
  const startDate = new Date('2026-08-10T10:00:00.000Z');
  const context = {
    auth: {
      isAuthenticated: true,
      firebaseUid: 'event-manager',
      email: 'manager@example.com',
      decodedToken: { uid: 'event-manager', orgId: organisationId.toString(), roles: ['events_manager'] },
    },
    request: {},
  };

  beforeAll(() => {
    models.setupModels(mongoose.createConnection());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('cancels every occurrence without a date filter for an entire series', async () => {
    jest.spyOn(models.EventModel, 'findOne').mockResolvedValue({ _id: occurrenceId, organisationId, seriesId, startDate } as never);
    const updateMany = jest.spyOn(models.EventModel, 'updateMany').mockResolvedValue({ acknowledged: true, matchedCount: 4, modifiedCount: 4 } as never);
    const updateSeries = jest.spyOn(models.EventSeriesModel, 'updateOne').mockResolvedValue({ acknowledged: true, matchedCount: 1, modifiedCount: 1 } as never);

    await (eventResolvers.Mutation.cancelEvent as CallableFunction)(null, { id: occurrenceId.toString(), scope: 'ENTIRE_SERIES' }, context);

    const occurrenceFilter = updateMany.mock.calls[0][0] as Record<string, unknown>;
    expect(occurrenceFilter).toEqual({ seriesId, organisationId });
    expect(occurrenceFilter).not.toHaveProperty('startDate');
    expect(updateSeries).toHaveBeenCalledWith({ _id: seriesId, organisationId }, { $set: { status: 'CANCELLED' } });
  });

  it('uses the selected occurrence date for this-and-future cancellation', async () => {
    jest.spyOn(models.EventModel, 'findOne').mockResolvedValue({ _id: occurrenceId, organisationId, seriesId, startDate } as never);
    const updateMany = jest.spyOn(models.EventModel, 'updateMany').mockResolvedValue({ acknowledged: true, matchedCount: 3, modifiedCount: 3 } as never);
    const updateSeries = jest.spyOn(models.EventSeriesModel, 'updateOne').mockResolvedValue({ acknowledged: true, matchedCount: 0, modifiedCount: 0 } as never);

    await (eventResolvers.Mutation.cancelEvent as CallableFunction)(null, { id: occurrenceId.toString(), scope: 'THIS_AND_FUTURE' }, context);

    expect(updateMany).toHaveBeenCalledWith(
      { seriesId, organisationId, startDate: { $gte: startDate } },
      { $set: { status: 'CANCELLED' } },
    );
    expect(updateSeries).not.toHaveBeenCalled();
  });

  it('cancels only the selected occurrence for this-occurrence scope', async () => {
    jest.spyOn(models.EventModel, 'findOne').mockResolvedValue({ _id: occurrenceId, organisationId, seriesId, startDate } as never);
    const updateOne = jest.spyOn(models.EventModel, 'updateOne').mockResolvedValue({ acknowledged: true, matchedCount: 1, modifiedCount: 1 } as never);
    const updateMany = jest.spyOn(models.EventModel, 'updateMany');

    await (eventResolvers.Mutation.cancelEvent as CallableFunction)(null, { id: occurrenceId.toString(), scope: 'THIS_OCCURRENCE' }, context);

    expect(updateOne).toHaveBeenCalledWith({ _id: occurrenceId }, { $set: { status: 'CANCELLED', isSeriesException: true } });
    expect(updateMany).not.toHaveBeenCalled();
  });
});
