const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockUpdateMany = jest.fn();
const mockOrgFindById = jest.fn();
const mockUserFindOne = jest.fn();
const mockUserCreate = jest.fn();
const mockSetCustomUserClaims = jest.fn();

jest.mock('../models', () => ({
  OrgInviteModel: { findOne: mockFindOne, find: mockFind, updateMany: mockUpdateMany },
  OrganisationModel: { findById: mockOrgFindById },
  UserModel: { findOne: mockUserFindOne, create: mockUserCreate },
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ setCustomUserClaims: mockSetCustomUserClaims }),
}));

import { teamResolvers } from './team.resolver';

const fullOrgDoc = {
  _id: 'org-1',
  name: 'Grace Community London',
  description: null,
  logoUrl: 'https://example.test/logo.png',
  websiteUrl: null,
  contactEmail: null,
  phoneNumber: null,
  socialLinks: null,
  region: 'London',
  verificationStatus: 'VERIFIED',
  verificationTier: 'BASIC',
  followerCount: 12,
  isActive: true,
  deactivatedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

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

describe('acceptOrganisationInvite', () => {
  const authedAsInvitee = {
    auth: {
      isAuthenticated: true,
      firebaseUid: 'uid-invitee',
      email: 'invitee@example.test',
      decodedToken: { email: 'invitee@example.test' },
    },
    request: {} as never,
  } as never;

  function pendingInvite(overrides: Record<string, unknown> = {}) {
    return {
      _id: 'invite-1',
      email: 'invitee@example.test',
      organisationId: 'org-1',
      roles: ['events_manager'],
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 86400000),
      invitedBy: 'uid-owner',
      save: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }

  it('rejects an unauthenticated caller', async () => {
    await expect(teamResolvers.Mutation.acceptOrganisationInvite({}, { token: 't' }, { auth: { isAuthenticated: false } } as never))
      .rejects.toThrow('Sign in to accept this invitation');
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('rejects a token that is missing, expired, or already used', async () => {
    mockFindOne.mockResolvedValue(null);
    await expect(teamResolvers.Mutation.acceptOrganisationInvite({}, { token: 'bad' }, authedAsInvitee))
      .rejects.toThrow('This invitation is no longer valid');
  });

  it('rejects when the signed-in email does not match the invited email', async () => {
    mockFindOne.mockResolvedValue(pendingInvite({ email: 'someone-else@example.test' }));
    await expect(teamResolvers.Mutation.acceptOrganisationInvite({}, { token: 't' }, authedAsInvitee))
      .rejects.toThrow('Sign in using someone-else@example.test');
  });

  it('rejects when the account already belongs to a different organisation', async () => {
    mockFindOne.mockResolvedValue(pendingInvite());
    mockUserFindOne.mockResolvedValue({ firebaseUid: 'uid-invitee', orgId: { toString: () => 'org-other' } });
    await expect(teamResolvers.Mutation.acceptOrganisationInvite({}, { token: 't' }, authedAsInvitee))
      .rejects.toThrow('Your account already belongs to another organisation');
  });

  it('creates the user, sets custom claims, marks the invite accepted, and returns the fully-populated organisation', async () => {
    const invite = pendingInvite();
    mockFindOne.mockResolvedValue(invite);
    mockUserFindOne.mockResolvedValue(null);
    const createdUser = { firebaseUid: 'uid-invitee', orgId: null, roles: [], save: jest.fn().mockResolvedValue(undefined) };
    mockUserCreate.mockResolvedValue(createdUser);
    mockOrgFindById.mockResolvedValue(fullOrgDoc);

    const result = await teamResolvers.Mutation.acceptOrganisationInvite({}, { token: 't' }, authedAsInvitee);

    expect(mockUserCreate).toHaveBeenCalledWith(expect.objectContaining({ firebaseUid: 'uid-invitee', email: 'invitee@example.test' }));
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('uid-invitee', { accountType: 'organisation', orgId: 'org-1', roles: ['events_manager'] });
    expect(createdUser.orgId).toBe('org-1');
    expect(createdUser.roles).toEqual(['events_manager']);
    expect(createdUser.save).toHaveBeenCalled();
    expect(invite.status).toBe('ACCEPTED');
    expect(invite.save).toHaveBeenCalled();
    // The mutation's return type is the full Organisation entity (not a
    // bespoke shape) — every non-null field must be populated, the same
    // class of bug just fixed for the invite-loading query.
    expect(result).toEqual({
      id: 'org-1', name: 'Grace Community London', description: null, logoUrl: 'https://example.test/logo.png',
      websiteUrl: null, contactEmail: null, phoneNumber: null, socialLinks: null, region: 'London',
      isVerified: true, verificationTier: 'BASIC', followerCount: 12, isActive: true, deactivatedAt: null,
      createdAt: fullOrgDoc.createdAt, updatedAt: fullOrgDoc.updatedAt,
    });
  });

  it('updates an existing user rather than creating a duplicate', async () => {
    mockFindOne.mockResolvedValue(pendingInvite());
    const existingUser = { firebaseUid: 'uid-invitee', orgId: null, roles: [], save: jest.fn().mockResolvedValue(undefined) };
    mockUserFindOne.mockResolvedValue(existingUser);
    mockOrgFindById.mockResolvedValue(fullOrgDoc);

    await teamResolvers.Mutation.acceptOrganisationInvite({}, { token: 't' }, authedAsInvitee);

    expect(mockUserCreate).not.toHaveBeenCalled();
    expect(existingUser.save).toHaveBeenCalled();
  });
});
