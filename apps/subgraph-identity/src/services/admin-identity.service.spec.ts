import { getFirebaseAdmin } from '@christian-listings/auth';
import { IdentityOrganisationNotificationModel, OrganisationModel, UserModel } from '../models';
import { applyIdentityAccountAction, applyVerificationDecision } from './admin-identity.service';

jest.mock('@christian-listings/auth', () => ({ getFirebaseAdmin: jest.fn() }));
jest.mock('../models', () => ({
  UserModel: { findById: jest.fn(), findByIdAndUpdate: jest.fn() },
  OrganisationModel: { findByIdAndUpdate: jest.fn() },
  IdentityOrganisationNotificationModel: { updateOne: jest.fn() },
}));

describe('admin identity operations', () => {
  beforeEach(() => jest.clearAllMocks());
  it('disables Firebase and revokes sessions before persisting a user suspension', async () => {
    const updateUser = jest.fn(); const revokeRefreshTokens = jest.fn();
    (getFirebaseAdmin as jest.Mock).mockReturnValue({ auth: () => ({ updateUser, revokeRefreshTokens }) });
    (UserModel.findById as jest.Mock).mockResolvedValue({ firebaseUid: 'member-1' });
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ firebaseUid: 'member-1', accountStatus: 'SUSPENDED', warningCount: 0 });
    await applyIdentityAccountAction({ type: 'USER', id: 'user-1', action: 'SUSPEND', reason: 'Safety investigation is in progress.' });
    expect(updateUser).toHaveBeenCalledWith('member-1', { disabled: true });
    expect(revokeRefreshTokens).toHaveBeenCalledWith('member-1');
    expect(updateUser.mock.invocationCallOrder[0]).toBeLessThan((UserModel.findByIdAndUpdate as jest.Mock).mock.invocationCallOrder[0]);
  });

  it('updates organisation trust state and persists the decision notification', async () => {
    (OrganisationModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'org-1', verificationTier: 'CHARITY' });
    const result = await applyVerificationDecision({ organisationId: 'org-1', submissionId: 'submission-1', action: 'APPROVE', tier: 'CHARITY', reason: 'Registration validated.' });
    expect(OrganisationModel.findByIdAndUpdate).toHaveBeenCalledWith('org-1', { $set: { verificationStatus: 'VERIFIED', verificationTier: 'CHARITY' } }, { new: true });
    expect(IdentityOrganisationNotificationModel.updateOne).toHaveBeenCalled();
    expect(result).toEqual({ status: 'VERIFIED', verificationTier: 'CHARITY' });
  });
});
