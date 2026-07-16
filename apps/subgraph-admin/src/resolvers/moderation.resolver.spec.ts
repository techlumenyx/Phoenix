import { AdminCommandModel, AdminNotificationModel, AuditEventModel, ModerationCaseModel } from '../models';
import { moderationResolvers } from './moderation.resolver';

jest.mock('../models', () => ({
  AdminCommandModel: { create: jest.fn(), findOne: jest.fn() },
  AdminNotificationModel: { updateOne: jest.fn() },
  AuditEventModel: { create: jest.fn(), find: jest.fn() },
  CaseNoteModel: { create: jest.fn(), find: jest.fn() },
  ModerationCaseModel: { findOne: jest.fn(), findById: jest.fn(), findOneAndUpdate: jest.fn(), exists: jest.fn() },
  ModerationReportModel: { find: jest.fn() },
}));

const context = {
  auth: { isAuthenticated: true, firebaseUid: 'admin-1', email: 'admin@example.test', decodedToken: { accountType: 'admin', roles: ['TRUST_SAFETY'] } },
  admin: { firebaseUid: 'admin-1', email: 'admin@example.test', roles: ['TRUST_SAFETY'] },
  request: { headers: { 'x-request-id': 'request-1' } },
} as never;

function caseDocument() {
  const doc = {
    _id: { toString: () => 'case-1' }, targetId: 'listing-1', targetStatus: 'PENDING_REVIEW', status: 'OPEN', version: 1,
    resolutionAction: null, resolutionReason: null, resolvedByFirebaseUid: null, resolvedAt: null,
    save: jest.fn().mockResolvedValue(undefined),
    toObject() { return { ...this, _id: undefined }; },
  };
  return doc;
}

function commandDocument() {
  return { _id: 'command-1', state: 'PENDING', canonicalStatus: null, failureReason: null, save: jest.fn().mockResolvedValue(undefined) };
}

describe('moderation command safety', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['INTERNAL_SERVICE_KEY'] = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'REMOVED' }) }) as jest.Mock;
    (AuditEventModel.create as jest.Mock).mockResolvedValue({});
    (AdminNotificationModel.updateOne as jest.Mock).mockResolvedValue({});
  });

  it('rejects a stale second decision and calls the canonical service once', async () => {
    const item = caseDocument(); const command = commandDocument();
    (ModerationCaseModel.findOne as jest.Mock).mockResolvedValueOnce(item).mockResolvedValueOnce(null);
    (AdminCommandModel.create as jest.Mock).mockResolvedValue(command);
    await moderationResolvers.Mutation.resolveModerationCase(null, { id: 'case-1', action: 'REMOVE', reason: 'Confirmed policy violation', expectedVersion: 1 }, context);
    await expect(moderationResolvers.Mutation.resolveModerationCase(null, { id: 'case-1', action: 'REMOVE', reason: 'Confirmed policy violation', expectedVersion: 1 }, context)).rejects.toThrow('changed since it was opened');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(command.state).toBe('COMPLETED');
  });

  it('records reconciliation work when canonical state changed but audit persistence fails', async () => {
    const item = caseDocument(); const command = commandDocument();
    (ModerationCaseModel.findOne as jest.Mock).mockResolvedValue(item);
    (AdminCommandModel.create as jest.Mock).mockResolvedValue(command);
    (AuditEventModel.create as jest.Mock).mockRejectedValue(new Error('database unavailable'));
    await expect(moderationResolvers.Mutation.resolveModerationCase(null, { id: 'case-1', action: 'REMOVE', reason: 'Confirmed policy violation', expectedVersion: 1 }, context)).rejects.toThrow('needs reconciliation');
    expect(command.state).toBe('REQUIRES_RECONCILIATION');
    expect(AdminNotificationModel.updateOne).toHaveBeenCalled();
  });
});
