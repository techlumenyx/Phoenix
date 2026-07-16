import { VerificationSubmissionModel } from '../models';
import { ingestVerificationSubmission } from './verification-intake.service';

jest.mock('../models', () => ({ VerificationSubmissionModel: { findOne: jest.fn(), create: jest.fn() } }));

const input = { organisationId: 'org-1', organisationName: 'Hope Church', ownerFirebaseUid: 'owner-1', requestedTier: 'STANDARD' as const, documentUrls: ['https://example.test/registration.pdf'], snapshot: { officialName: 'Hope Church', registrationNumber: 'REG-1', officialEmail: 'office@example.test', pocName: 'Ada', pocTitle: 'Director', organisationType: 'Church', region: 'Lagos' } };

describe('ingestVerificationSubmission', () => {
  beforeEach(() => jest.clearAllMocks());
  it('creates the next submission version with a three-day SLA', async () => {
    const sort = jest.fn().mockResolvedValue({ version: 2, status: 'NEEDS_INFORMATION' });
    (VerificationSubmissionModel.findOne as jest.Mock).mockReturnValue({ sort });
    (VerificationSubmissionModel.create as jest.Mock).mockImplementation(async (value) => value);
    const before = Date.now();
    const result = await ingestVerificationSubmission(input);
    expect(result).toEqual(expect.objectContaining({ organisationId: 'org-1', version: 3, status: 'PENDING_REVIEW' }));
    expect(result.dueAt.getTime()).toBeGreaterThanOrEqual(before + 3 * 24 * 60 * 60 * 1000);
  });
  it('is idempotent while the latest version is pending', async () => {
    const latest = { version: 1, status: 'PENDING_REVIEW' };
    (VerificationSubmissionModel.findOne as jest.Mock).mockReturnValue({ sort: jest.fn().mockResolvedValue(latest) });
    expect(await ingestVerificationSubmission(input)).toBe(latest);
    expect(VerificationSubmissionModel.create).not.toHaveBeenCalled();
  });
});
