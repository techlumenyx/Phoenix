import { GraphQLError } from 'graphql';

const mockSetCustomUserClaims = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ setCustomUserClaims: mockSetCustomUserClaims }),
}));

jest.mock('../models', () => ({
  OrganisationModel: { findOne: mockFindOne, create: mockCreate },
  UserModel: { updateOne: mockUpdateUser },
}));

import { createOrganisation } from './mutation.createOrganisation';

const baseContext = {
  auth: {
    isAuthenticated: true,
    firebaseUid: 'uid-org',
    email: 'org@example.com',
    decodedToken: null,
  },
  request: {} as never,
};

beforeEach(() => jest.clearAllMocks());

describe('createOrganisation', () => {
  it('throws UNAUTHENTICATED when not logged in', async () => {
    const ctx = { ...baseContext, auth: { ...baseContext.auth, isAuthenticated: false } };
    await expect(createOrganisation({}, { input: { name: 'My Church' } }, ctx)).rejects.toThrow(GraphQLError);
  });

  it('returns existing org without re-creating', async () => {
    const existing = { _id: 'org1', createdBy: 'uid-org', name: 'My Church' };
    mockFindOne.mockResolvedValue(existing);
    const result = await createOrganisation({}, { input: { name: 'My Church' } }, baseContext);
    expect(result).toBe(existing);
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('uid-org', {
      accountType: 'organisation', orgId: 'org1', roles: ['master_admin'],
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('updates the name if existing org has no name', async () => {
    const existingOrg = { _id: 'org-id', name: null, createdBy: 'uid-123', save: jest.fn().mockResolvedValue(undefined) };
    mockFindOne.mockResolvedValueOnce(existingOrg);

    const result = await createOrganisation(
      {},
      { input: { name: 'My Church' } },
      baseContext,
    );

    expect(existingOrg.save).toHaveBeenCalledTimes(1);
    expect(existingOrg.name).toBe('My Church');
    expect(result.name).toBe('My Church');
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('uid-org', {
      accountType: 'organisation', orgId: 'org-id', roles: ['master_admin'],
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('sets organisation claim and creates org document', async () => {
    mockFindOne.mockResolvedValue(null);
    const created = { _id: 'org2', createdBy: 'uid-org', name: 'My Church' };
    mockCreate.mockResolvedValue(created);

    const result = await createOrganisation({}, { input: { name: 'My Church' } }, baseContext);

    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('uid-org', {
      accountType: 'organisation', orgId: 'org2', roles: ['master_admin'],
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'uid-org', name: 'My Church' }),
    );
    expect(result).toBe(created);
  });
});
