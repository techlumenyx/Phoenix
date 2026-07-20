import mongoose from 'mongoose';
import * as models from '../models';
import { eventResolvers } from './event.resolver';

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
