const mockFindOneAndUpdate = jest.fn();
const mockAuditCreate = jest.fn();
const mockRetryRiskAnalysis = jest.fn();

jest.mock('@christian-listings/auth', () => ({
  requirePlatformAdmin: jest.fn(() => ({ firebaseUid: 'admin-1', roles: ['TRUST_SAFETY'] })),
}));
jest.mock('../models', () => ({
  ContentRiskAnalysisModel: { findOneAndUpdate: mockFindOneAndUpdate },
  AuditEventModel: { create: mockAuditCreate },
}));
jest.mock('../services/risk-analysis.service', () => ({
  riskAnalysisEnabled: jest.fn(() => true),
  retryRiskAnalysis: mockRetryRiskAnalysis,
}));

import { riskAnalysisResolvers } from './risk-analysis.resolver';

describe('risk analysis resolver', () => {
  const context = { auth: {}, request: { headers: { 'x-request-id': 'request-1' } } } as never;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindOneAndUpdate.mockResolvedValue({
      _id: { toString: () => 'analysis-1' }, targetId: 'listing-1', status: 'COMPLETED',
      toObject: () => ({ targetId: 'listing-1', status: 'COMPLETED', reviewerVerdict: 'FALSE_POSITIVE' }),
    });
    mockRetryRiskAnalysis.mockResolvedValue({
      _id: { toString: () => 'analysis-1' }, targetId: 'listing-1', status: 'PENDING',
      toObject: () => ({ targetId: 'listing-1', status: 'PENDING' }),
    });
  });

  it('requeues a terminal analysis and audits the administrator action', async () => {
    const result = await riskAnalysisResolvers.Mutation.retryContentRiskAnalysis(undefined, { id: 'analysis-1' }, context);
    expect(result).toEqual(expect.objectContaining({ id: 'analysis-1', status: 'PENDING' }));
    expect(mockRetryRiskAnalysis).toHaveBeenCalledWith('analysis-1');
    expect(mockAuditCreate).toHaveBeenCalledWith(expect.objectContaining({ action: 'AI_RISK_RETRY', targetId: 'listing-1' }));
  });

  it('records human feedback without changing listing state', async () => {
    const result = await riskAnalysisResolvers.Mutation.reviewContentRiskAnalysis(undefined, {
      id: 'analysis-1', verdict: 'FALSE_POSITIVE', note: 'Benign community fundraiser.',
    }, context);

    expect(result).toEqual(expect.objectContaining({ id: 'analysis-1', reviewerVerdict: 'FALSE_POSITIVE' }));
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'analysis-1', status: 'COMPLETED' },
      expect.objectContaining({ $set: expect.objectContaining({ reviewerVerdict: 'FALSE_POSITIVE', reviewedByFirebaseUid: 'admin-1' }) }),
      { new: true },
    );
    expect(mockAuditCreate).toHaveBeenCalledWith(expect.objectContaining({ action: 'AI_RISK_REVIEW', targetId: 'listing-1' }));
  });
});
