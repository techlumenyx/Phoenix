import { ingestMarketplaceReport, ReportRateLimitError } from './report-intake.service';
import { ModerationCaseModel, ModerationReportModel } from '../models';

jest.mock('../models', () => ({
  ModerationReportModel: { findOne: jest.fn(), countDocuments: jest.fn(), create: jest.fn() },
  ModerationCaseModel: { findById: jest.fn(), findOneAndUpdate: jest.fn() },
}));

const input = {
  itemId: 'listing-id',
  reporterFirebaseUid: 'reporter-3',
  reason: 'Suspected fraud or scam: The payment request looks suspicious.',
  snapshot: {
    title: 'Community laptop',
    ownerFirebaseUid: 'seller-id',
    organisationId: 'organisation-id',
    status: 'AVAILABLE',
  },
};

describe('ingestMarketplaceReport', () => {
  beforeEach(() => jest.clearAllMocks());

  it('normalises evidence and raises the third distinct report to high priority', async () => {
    (ModerationReportModel.findOne as jest.Mock).mockResolvedValue(null);
    (ModerationReportModel.countDocuments as jest.Mock).mockResolvedValue(0);
    const report = { _id: { toString: () => 'report-id' }, caseId: null, save: jest.fn() };
    (ModerationReportModel.create as jest.Mock).mockResolvedValue(report);
    const moderationCase = {
      _id: { toString: () => 'case-id' },
      reportCount: 3,
      status: 'OPEN',
      priority: 'NORMAL',
      targetStatus: 'AVAILABLE',
      save: jest.fn(),
    };
    (ModerationCaseModel.findOneAndUpdate as jest.Mock).mockResolvedValue(moderationCase);

    const result = await ingestMarketplaceReport(input);

    expect(ModerationReportModel.create).toHaveBeenCalledWith(expect.objectContaining({
      reasonCode: 'FRAUD_SCAM',
      details: 'The payment request looks suspicious.',
      dedupeKey: 'MARKETPLACE_ITEM:listing-id:reporter-3',
    }));
    expect(moderationCase.status).toBe('PENDING_REVIEW');
    expect(moderationCase.priority).toBe('HIGH');
    expect(moderationCase.targetStatus).toBe('PENDING_REVIEW');
    expect(report.caseId).toBe(moderationCase._id);
    expect(result).toEqual({ reportId: 'report-id', caseId: 'case-id', distinctReportCount: 3, duplicate: false, shouldHide: true });
  });

  it('returns the existing case without increasing duplicate reports', async () => {
    const existing = { _id: { toString: () => 'report-id' }, caseId: 'case-id' };
    const moderationCase = { _id: { toString: () => 'case-id' }, reportCount: 2 };
    (ModerationReportModel.findOne as jest.Mock).mockResolvedValue(existing);
    (ModerationCaseModel.findById as jest.Mock).mockResolvedValue(moderationCase);

    const result = await ingestMarketplaceReport(input);

    expect(ModerationReportModel.create).not.toHaveBeenCalled();
    expect(ModerationCaseModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(result.duplicate).toBe(true);
    expect(result.distinctReportCount).toBe(2);
  });

  it('rate limits new reports after ten submissions in an hour', async () => {
    (ModerationReportModel.findOne as jest.Mock).mockResolvedValue(null);
    (ModerationReportModel.countDocuments as jest.Mock).mockResolvedValue(10);

    await expect(ingestMarketplaceReport(input)).rejects.toBeInstanceOf(ReportRateLimitError);

    expect(ModerationReportModel.create).not.toHaveBeenCalled();
    expect(ModerationCaseModel.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
