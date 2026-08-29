const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockUpdateMany = jest.fn();
const mockOrgFindById = jest.fn();

jest.mock('../models', () => ({
  OrgInviteModel: { findOne: mockFindOne, find: mockFind, updateMany: mockUpdateMany },
  OrganisationModel: { findById: mockOrgFindById },
  UserModel: {},
}));

import { teamResolvers } from './team.resolver';

const ctx = {
  auth: {
    isAuthenticated: true,
    firebaseUid: 'uid-owner',
    email: 'owner@example.com',
    decodedToken: { orgId: 'org-1', roles: ['master_admin'] },
  },
  request: {} as never,
} as never;

beforeEach(() => jest.clearAllMocks());

describe('organisationInvite (public, by token)', () => {
  it('fully populates the organisation, including the non-nullable name', async () => {
    mockFindOne.mockResolvedValue({
      _id: 'invite-1',
      email: 'newmember@example.test',
      organisationId: 'org-1',
      roles: ['events_manager'],
      status: 'PENDING',
      token: 'the-token',
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
    });
    mockOrgFindById.mockReturnValue({ select: jest.fn().mockResolvedValue({ name: 'Grace Community London', logoUrl: 'https://example.test/logo.png' }) });

    const result = await teamResolvers.Query.organisationInvite({}, { token: 'the-token' });

    expect(result?.organisation).toEqual({ id: 'org-1', name: 'Grace Community London', logoUrl: 'https://example.test/logo.png' });
  });

  it('falls back to an empty name rather than a null one when the organisation is missing', async () => {
    mockFindOne.mockResolvedValue({
      _id: 'invite-1', email: 'newmember@example.test', organisationId: 'org-deleted',
      roles: ['events_manager'], status: 'PENDING', token: 'the-token', expiresAt: new Date(Date.now() + 86400000), createdAt: new Date(),
    });
    mockOrgFindById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const result = await teamResolvers.Query.organisationInvite({}, { token: 'the-token' });

    expect(result?.organisation).toEqual({ id: 'org-deleted', name: '', logoUrl: null });
  });

  it('returns null for an unknown token', async () => {
    mockFindOne.mockResolvedValue(null);
    const result = await teamResolvers.Query.organisationInvite({}, { token: 'missing' });
    expect(result).toBeNull();
    expect(mockOrgFindById).not.toHaveBeenCalled();
  });
});

describe('organisationInvites (list, by organisation)', () => {
  it('fetches the organisation once and reuses it across every invite', async () => {
    mockUpdateMany.mockResolvedValue({});
    mockFind.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: 'invite-1', email: 'a@example.test', organisationId: 'org-1', roles: ['events_manager'], status: 'PENDING', token: 't1', expiresAt: new Date(), createdAt: new Date() },
        { _id: 'invite-2', email: 'b@example.test', organisationId: 'org-1', roles: ['jobs_manager'], status: 'PENDING', token: 't2', expiresAt: new Date(), createdAt: new Date() },
      ]),
    });
    mockOrgFindById.mockReturnValue({ select: jest.fn().mockResolvedValue({ name: 'Grace Community London', logoUrl: null }) });

    const result = await teamResolvers.Query.organisationInvites({}, { organisationId: 'org-1' }, ctx);

    expect(mockOrgFindById).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0].organisation).toEqual({ id: 'org-1', name: 'Grace Community London', logoUrl: null });
    expect(result[1].organisation).toEqual({ id: 'org-1', name: 'Grace Community London', logoUrl: null });
  });
});
