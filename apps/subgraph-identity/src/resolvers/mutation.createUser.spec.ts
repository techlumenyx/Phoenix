import { GraphQLError } from 'graphql';

const mockSetCustomUserClaims = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ setCustomUserClaims: mockSetCustomUserClaims }),
}));

jest.mock('../models', () => ({
  UserModel: { findOne: mockFindOne, create: mockCreate },
}));

import { createUser } from './mutation.createUser';

const baseContext = {
  auth: {
    isAuthenticated: true,
    firebaseUid: 'uid-abc',
    email: 'test@example.com',
    decodedToken: null,
  },
  request: {} as never,
};

beforeEach(() => jest.clearAllMocks());

describe('createUser', () => {
  it('throws UNAUTHENTICATED when not logged in', async () => {
    const ctx = { ...baseContext, auth: { ...baseContext.auth, isAuthenticated: false } };
    await expect(createUser({}, { input: { name: 'John' } }, ctx)).rejects.toThrow(GraphQLError);
  });

  it('returns existing user without re-creating', async () => {
    const existing = { _id: 'id1', firebaseUid: 'uid-abc', name: 'John' };
    mockFindOne.mockResolvedValue(existing);
    const result = await createUser({}, { input: { name: 'John' } }, baseContext);
    expect(result).toBe(existing);
    expect(mockSetCustomUserClaims).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('sets custom claim and creates user document', async () => {
    mockFindOne.mockResolvedValue(null);
    const created = { _id: 'id2', firebaseUid: 'uid-abc', email: 'test@example.com', name: 'John' };
    mockCreate.mockResolvedValue(created);

    const result = await createUser({}, { input: { name: 'John' } }, baseContext);

    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('uid-abc', { accountType: 'user' });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ firebaseUid: 'uid-abc', email: 'test@example.com', name: 'John' }),
    );
    expect(result).toBe(created);
  });
});
