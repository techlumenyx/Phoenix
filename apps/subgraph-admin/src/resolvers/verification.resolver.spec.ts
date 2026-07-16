import { AuditEventModel, VerificationSubmissionModel } from '../models';
import { verificationResolvers } from './verification.resolver';

jest.mock('../models', () => ({
  AuditEventModel: { create: jest.fn(), find: jest.fn() },
  VerificationSubmissionModel: { findById: jest.fn() },
  ModerationCaseModel: { countDocuments: jest.fn() },
}));

function context(role: string) {
  return {
    auth: { isAuthenticated: true, firebaseUid: 'admin-1', email: 'reviewer@example.test', decodedToken: { accountType: 'admin', roles: [role] } },
    admin: { firebaseUid: 'admin-1', email: 'reviewer@example.test', roles: [role] },
    request: { headers: { 'x-request-id': 'request-1' } },
  } as never;
}

describe('verification reviewer access', () => {
  beforeEach(() => jest.clearAllMocks());
  it('audits reviewer document access before returning the secure URL', async () => {
    (VerificationSubmissionModel.findById as jest.Mock).mockResolvedValue({ organisationId: 'org-1', status: 'PENDING_REVIEW', documentUrls: ['https://example.test/document.pdf'] });
    const value = await verificationResolvers.Mutation.accessVerificationDocument(null, { id: 'submission-1', documentIndex: 0 }, context('VERIFICATION_REVIEWER'));
    expect(value).toBe('https://example.test/document.pdf');
    expect(AuditEventModel.create).toHaveBeenCalledWith(expect.objectContaining({ action: 'ACCESS_DOCUMENT', targetId: 'org-1', requestId: 'request-1' }));
  });

  it('does not allow an auditor to open verification documents', async () => {
    await expect(verificationResolvers.Mutation.accessVerificationDocument(null, { id: 'submission-1', documentIndex: 0 }, context('AUDITOR'))).rejects.toThrow('Insufficient admin permissions');
    expect(VerificationSubmissionModel.findById).not.toHaveBeenCalled();
  });
});
