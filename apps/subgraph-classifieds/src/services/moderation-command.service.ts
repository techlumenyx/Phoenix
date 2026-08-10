import { ClassifiedOrganisationNotificationModel, JobListingModel, MarketplaceItemModel } from '../models';

export interface MarketplaceModerationCommand {
  itemId: string;
  caseId: string;
  action: 'DISMISS' | 'WARN' | 'REMOVE' | 'RESTORE' | 'REQUEST_CHANGES';
  reason: string;
  requestId?: string | null;
}

export async function executeMarketplaceModerationCommand(input: MarketplaceModerationCommand) {
  const item = await MarketplaceItemModel.findById(input.itemId);
  if (!item) return null;

  if (input.action === 'DISMISS' || input.action === 'WARN' || input.action === 'RESTORE') {
    item.status = item.preReviewStatus ?? 'AVAILABLE';
    item.preReviewStatus = null;
    item.moderationCaseId = null;
  } else if (input.action === 'REMOVE' || input.action === 'REQUEST_CHANGES') {
    item.status = 'REMOVED';
    item.moderationCaseId = input.caseId;
  }
  await item.save();

  if (item.organisationId) {
    const actionLabel = input.action === 'DISMISS'
      ? 'restored after review'
      : input.action === 'WARN'
        ? 'reviewed with a warning'
        : 'removed after review';
    await ClassifiedOrganisationNotificationModel.updateOne(
      { dedupeKey: `moderation:${input.caseId}:${input.action}` },
      {
        $setOnInsert: {
          organisationId: item.organisationId,
          type: 'LISTING_MODERATION_DECISION',
          title: 'Listing review completed',
          message: `${item.title} was ${actionLabel}. ${input.reason}`,
          href: `/org/listings`,
          sourceId: item._id.toString(),
          dedupeKey: `moderation:${input.caseId}:${input.action}`,
          readAt: null,
        },
      },
      { upsert: true },
    );
  }

  return { id: item._id.toString(), status: item.status };
}

export interface ClassifiedModerationCommand {
  targetType: 'JOB' | 'MARKETPLACE_ITEM';
  targetId: string;
  caseId: string;
  action: 'DISMISS' | 'WARN' | 'REMOVE' | 'RESTORE' | 'REQUEST_CHANGES';
  reason: string;
}

export async function executeClassifiedModerationCommand(input: ClassifiedModerationCommand) {
  if (input.targetType === 'MARKETPLACE_ITEM') return executeMarketplaceModerationCommand({ itemId: input.targetId, caseId: input.caseId, action: input.action, reason: input.reason });
  const job = await JobListingModel.findById(input.targetId);
  if (!job) return null;
  job.status = input.action === 'REMOVE' || input.action === 'REQUEST_CHANGES' ? 'ARCHIVED' : 'ACTIVE';
  await job.save();
  await ClassifiedOrganisationNotificationModel.updateOne(
    { dedupeKey: `job-moderation:${input.caseId}:${input.action}` },
    { $setOnInsert: { organisationId: job.organisationId, type: 'JOB_MODERATION_DECISION', title: 'Job review update', message: `${job.title}: ${input.reason}`, href: '/org/jobs', sourceId: job._id.toString(), dedupeKey: `job-moderation:${input.caseId}:${input.action}`, readAt: null } },
    { upsert: true },
  );
  return { id: job._id.toString(), status: job.status };
}
