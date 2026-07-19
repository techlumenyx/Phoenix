const mockJobApplicationFind = jest.fn();
const mockJobListingFindById = jest.fn();
const mockMarketplaceItemFind = jest.fn();

jest.mock('../models', () => ({
  JobApplicationModel: { find: mockJobApplicationFind },
  JobListingModel: { findById: mockJobListingFindById },
  MarketplaceItemModel: { find: mockMarketplaceItemFind },
}));

import { jobApplicationResolvers } from './job-application.resolver';
import { marketplaceResolvers } from './marketplace.resolver';

describe('classifieds User federation resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads applications using the federated firebaseUid key', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    mockJobApplicationFind.mockReturnValue({ sort });

    await jobApplicationResolvers.User.jobApplications({ firebaseUid: 'member-uid' });

    expect(mockJobApplicationFind).toHaveBeenCalledWith({ applicantFirebaseUid: 'member-uid' });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it('loads marketplace listings using the same federated key', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    mockMarketplaceItemFind.mockReturnValue({ sort });

    await marketplaceResolvers.User.marketplaceListings({ firebaseUid: 'member-uid' });

    expect(mockMarketplaceItemFind).toHaveBeenCalledWith({ createdBy: 'member-uid' });
    expect(sort).toHaveBeenCalledWith({ _id: -1 });
  });

  it('hydrates the full listing returned by a job application', async () => {
    mockJobListingFindById.mockResolvedValue({
      _id: { toString: () => 'job-id' },
      title: 'Community Coordinator',
      description: 'Support the community.',
      organisationId: { toString: () => 'organisation-id' },
      employmentType: 'FULL_TIME',
      workLocation: 'HYBRID',
      skillsRequired: [],
      region: 'GB-LDN',
      closingDate: new Date('2026-08-31T00:00:00.000Z'),
      status: 'ACTIVE',
      isPromoted: false,
      createdAt: new Date('2026-07-19T00:00:00.000Z'),
      updatedAt: new Date('2026-07-19T00:00:00.000Z'),
    });

    const listing = await jobApplicationResolvers.JobApplication.listing({ listing: { id: 'job-id' } });

    expect(mockJobListingFindById).toHaveBeenCalledWith('job-id');
    expect(listing).toEqual(expect.objectContaining({ id: 'job-id', title: 'Community Coordinator' }));
  });
});
