import { adminResolvers } from './admin.resolver';
import { AdminModel } from '../models';

jest.mock('../models', () => ({
  AdminModel: {
    findOne: jest.fn(),
  },
}));

const activeAdmin = {
  _id: { toString: () => 'admin-id' },
  firebaseUid: 'admin-uid',
  email: 'admin@example.test',
  name: 'Platform Admin',
  roles: ['TRUST_SAFETY'],
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: new Date('2026-07-15T00:00:00.000Z'),
  updatedAt: new Date('2026-07-15T00:00:00.000Z'),
};

describe('adminMe', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the active admin profile when claims match', async () => {
    (AdminModel.findOne as jest.Mock).mockResolvedValue(activeAdmin);

    const result = await adminResolvers.Query.adminMe(
      null,
      null,
      {
        auth: {
          isAuthenticated: true,
          firebaseUid: 'admin-uid',
          email: 'admin@example.test',
          decodedToken: { accountType: 'admin', roles: ['TRUST_SAFETY'] },
        },
      } as never,
    );

    expect(result).toEqual(expect.objectContaining({
      id: 'admin-id',
      roles: ['TRUST_SAFETY'],
      status: 'ACTIVE',
    }));
  });

  it('rejects non-admin claims before querying MongoDB', async () => {
    await expect(adminResolvers.Query.adminMe(
      null,
      null,
      {
        auth: {
          isAuthenticated: true,
          firebaseUid: 'member-uid',
          email: 'member@example.test',
          decodedToken: { accountType: 'user' },
        },
      } as never,
    )).rejects.toThrow('Admin access required');

    expect(AdminModel.findOne).not.toHaveBeenCalled();
  });

  it('rejects stale role claims', async () => {
    (AdminModel.findOne as jest.Mock).mockResolvedValue(activeAdmin);

    await expect(adminResolvers.Query.adminMe(
      null,
      null,
      {
        auth: {
          isAuthenticated: true,
          firebaseUid: 'admin-uid',
          email: 'admin@example.test',
          decodedToken: { accountType: 'admin', roles: [] },
        },
      } as never,
    )).rejects.toThrow('Admin session permissions are stale');
  });
});
