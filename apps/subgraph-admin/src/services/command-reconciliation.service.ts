import { AdminCommandModel, AuditEventModel, ModerationCaseModel } from '../models';

export async function reconcileAdminCommands() {
  const commands = await AdminCommandModel.find({ state: 'REQUIRES_RECONCILIATION', canonicalStatus: { $ne: null } }).sort({ updatedAt: 1 }).limit(25);
  const results = await Promise.allSettled(commands.map(async (command) => {
    const moderationCase = await ModerationCaseModel.findById(command.caseId);
    if (!moderationCase) {
      command.failureReason = 'Moderation case no longer exists';
      await command.save();
      return;
    }
    const beforeStatus = moderationCase.targetStatus;
    if (moderationCase.status !== 'RESOLVED') {
      moderationCase.status = 'RESOLVED';
      moderationCase.targetStatus = command.canonicalStatus ?? moderationCase.targetStatus;
      moderationCase.resolutionAction = command.action;
      moderationCase.resolutionReason = command.reason;
      moderationCase.resolvedByFirebaseUid = command.requestedByFirebaseUid;
      moderationCase.resolvedAt = new Date();
      moderationCase.version += 1;
      await moderationCase.save();
    }
    const existingAudit = await AuditEventModel.exists({ caseId: command.caseId, action: command.action, requestId: command.requestId });
    if (!existingAudit) await AuditEventModel.create({
      adminFirebaseUid: command.requestedByFirebaseUid,
      action: command.action,
      targetId: command.targetId,
      targetType: 'MARKETPLACE_ITEM',
      caseId: command.caseId,
      reason: command.reason,
      beforeStatus,
      afterStatus: command.canonicalStatus,
      requestId: command.requestId,
      route: 'background:command-reconciliation',
      result: 'SUCCESS',
    });
    command.state = 'COMPLETED';
    command.failureReason = null;
    await command.save();
  }));
  return { attempted: commands.length, completed: results.filter((result) => result.status === 'fulfilled').length };
}
