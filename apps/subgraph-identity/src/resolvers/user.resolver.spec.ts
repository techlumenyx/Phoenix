const mockFindById = jest.fn();
const mockFindOne = jest.fn();

jest.mock('../models', () => ({
  UserModel: {
    findById: mockFindById,
    findOne: mockFindOne,
  },
}));

import { userResolvers } from './user.resolver';

const member = {
  _id: { toString: () => 'member-1' },
  firebaseUid: 'member-uid',
  email: 'member@example.com',
  name: 'Member Name',
  avatarUrl: 'https://example.com/avatar.jpg',
  bio: 'Member bio',
  socialLinks: { instagram: 'https://instagram.com/member' },
  isVerified: false,
  onboardingCompleted: true,
  preferences: [],
  roles: [],
  orgId: null,
  region: 'London, UK',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const anonymousContext = {
  auth: { isAuthenticated: false, firebaseUid: null, email: null, decodedToken: null },
  request: {} as never,
};

const signedInContext = {
  auth: { isAuthenticated: true, firebaseUid: 'viewer-uid', email: 'viewer@example.com', decodedToken: null },
  request: {} as never,
};

describe('member profile privacy', () => {
  beforeEach(() => jest.clearAllMocks());

  it('hides extended fields from anonymous viewers for members-only profiles', async () => {
    mockFindById.mockResolvedValue({
      ...member,
      privacySettings: { profileVisibility: 'MEMBERS_ONLY', showAvatar: true, showRegion: true, showBio: true, showSocialLinks: true },
    });
    const result = await userResolvers.Query.user({}, { id: 'member-1' }, anonymousContext as never);
    expect(result).toEqual(expect.objectContaining({ avatarUrl: null, region: '', bio: null, socialLinks: null }));
  });

  it('applies individual field switches for an allowed viewer', async () => {
    mockFindById.mockResolvedValue({
      ...member,
      privacySettings: { profileVisibility: 'PUBLIC', showAvatar: true, showRegion: false, showBio: true, showSocialLinks: false },
    });
    const result = await userResolvers.Query.user({}, { id: 'member-1' }, anonymousContext as never);
    expect(result).toEqual(expect.objectContaining({ avatarUrl: member.avatarUrl, region: '', bio: member.bio, socialLinks: null }));
  });

  it('always shows the member their own fields even when the profile is private', async () => {
    mockFindOne.mockResolvedValue({
      ...member,
      privacySettings: { profileVisibility: 'PRIVATE', showAvatar: true, showRegion: true, showBio: true, showSocialLinks: true },
    });
    const result = await userResolvers.User.__resolveReference(
      { firebaseUid: 'member-uid' },
      { ...signedInContext, auth: { ...signedInContext.auth, firebaseUid: 'member-uid' } } as never,
    );
    expect(result).toEqual(expect.objectContaining({ avatarUrl: member.avatarUrl, region: member.region, bio: member.bio, socialLinks: member.socialLinks }));
  });
});
