const mockFind = jest.fn();
const mockFindUser = jest.fn();

jest.mock('../models', () => ({
  OrganisationModel: { find: mockFind },
  UserModel: { findOne: mockFindUser },
}));

import { myOrganisations } from './query.myOrganisations';

const authedContext = {
  auth: { isAuthenticated: true, firebaseUid: 'uid-org', email: 'org@example.com', decodedToken: null },
  request: {} as never,
};

const anonContext = {
  auth: { isAuthenticated: false, firebaseUid: null, email: null, decodedToken: null },
  request: {} as never,
};

beforeEach(() => jest.clearAllMocks());

describe('myOrganisations', () => {
  it('returns empty array when unauthenticated', async () => {
    const result = await myOrganisations({}, {}, anonContext);
    expect(result).toEqual([]);
    expect(mockFind).not.toHaveBeenCalled();
  });

  it('queries orgs by createdBy firebaseUid', async () => {
    const orgs = [{ _id: 'org1', name: 'My Church' }];
    mockFindUser.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    mockFind.mockResolvedValue(orgs);
    const result = await myOrganisations({}, {}, authedContext);
    expect(mockFind).toHaveBeenCalledWith({ $or: [{ createdBy: 'uid-org' }] });
    expect(result).toBe(orgs);
  });
});
