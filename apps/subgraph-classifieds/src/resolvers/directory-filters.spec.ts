import mongoose from 'mongoose';
import * as models from '../models';
import { jobResolvers } from './job.resolver';
import { marketplaceResolvers } from './marketplace.resolver';

describe('classified directory filters', () => {
  beforeAll(() => {
    models.setupModels(mongoose.createConnection());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not apply salary bounds when GraphQL supplies null', async () => {
    const query = { limit: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([]) };
    const find = jest.spyOn(models.JobListingModel, 'find').mockReturnValue(query as never);

    await (jobResolvers.Query.jobListings as CallableFunction)(null, {
      region: null,
      search: null,
      roleType: null,
      workLocation: null,
      skillTags: null,
      minSalary: null,
      maxSalary: null,
      status: 'ACTIVE',
      sort: 'NEWEST',
      limit: 12,
      after: null,
    });

    expect(find).toHaveBeenCalledWith({ status: 'ACTIVE' });
  });

  it('does not apply price or donation filters when GraphQL supplies null', async () => {
    const query = { limit: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([]) };
    const find = jest.spyOn(models.MarketplaceItemModel, 'find').mockReturnValue(query as never);

    await (marketplaceResolvers.Query.marketplaceItems as CallableFunction)(null, {
      region: null,
      search: null,
      category: null,
      condition: null,
      subCategory: null,
      minPrice: null,
      maxPrice: null,
      isDonation: null,
      status: 'AVAILABLE',
      sort: 'NEWEST',
      limit: 12,
      after: null,
    }, { auth: { isAuthenticated: false, roles: [] } });

    expect(find).toHaveBeenCalledWith({ status: 'AVAILABLE' });
  });
});
