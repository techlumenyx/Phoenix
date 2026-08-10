import { ModerationCaseModel, ReportConversationModel } from '../models';
import { reportConversationResolvers } from './report-conversation.resolver';

jest.mock('../models', () => ({
  AuditEventModel: { create: jest.fn() },
  ModerationCaseModel: { find: jest.fn(), findById: jest.fn(), updateOne: jest.fn() },
  ModerationReportModel: { findOne: jest.fn() },
  ReportAppealModel: { find: jest.fn(), findOne: jest.fn(), create: jest.fn() },
  ReportConversationModel: { find: jest.fn(), findById: jest.fn(), findOne: jest.fn(), findOneAndUpdate: jest.fn(), countDocuments: jest.fn(), updateOne: jest.fn() },
  ReportMessageModel: { find: jest.fn(), create: jest.fn(), countDocuments: jest.fn() },
}));

function memberContext(uid: string, claims: Record<string, unknown> = {}) {
  return { auth: { isAuthenticated: true, firebaseUid: uid, email: `${uid}@example.test`, decodedToken: { uid, ...claims } }, admin: null, request: { headers: {} } } as never;
}

function conversation(overrides: Record<string, unknown> = {}) {
  const value = { _id: { toString: () => 'conversation-1' }, caseId: { toString: () => 'case-1' }, reportId: { toString: () => 'report-1' }, audience: 'REPORTER', participantFirebaseUid: 'reporter-1', organisationId: null, unreadForParticipant: false, unreadForAdmin: false, ...overrides };
  return { ...value, toObject: () => value };
}

describe('report conversation privacy', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists only the signed-in reporter conversations', async () => {
    const sort = jest.fn().mockResolvedValue([conversation()]);
    (ReportConversationModel.find as jest.Mock).mockReturnValue({ sort });
    const result = await reportConversationResolvers.Query.myReportConversations(null, null, memberContext('reporter-1'));
    expect(ReportConversationModel.find).toHaveBeenCalledWith({ audience: 'REPORTER', participantFirebaseUid: 'reporter-1' });
    expect(result).toHaveLength(1);
  });

  it('does not expose one reporter conversation to another member', async () => {
    (ReportConversationModel.findById as jest.Mock).mockResolvedValue(conversation());
    await expect(reportConversationResolvers.Query.reportConversation(null, { id: '507f1f77bcf86cd799439011' }, memberContext('other-member'))).rejects.toThrow('do not have access');
  });

  it('limits organisation conversations to the applicable manager role', async () => {
    (ReportConversationModel.findById as jest.Mock).mockResolvedValue(conversation({ audience: 'OWNER', participantFirebaseUid: null, organisationId: 'org-1' }));
    (ModerationCaseModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ targetType: 'EVENT' }) });
    await expect(reportConversationResolvers.Query.reportConversation(null, { id: '507f1f77bcf86cd799439011' }, memberContext('jobs-manager', { orgId: 'org-1', roles: ['jobs_manager'] }))).rejects.toThrow('role cannot access');
  });
});
