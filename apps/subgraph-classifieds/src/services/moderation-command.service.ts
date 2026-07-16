import { ClassifiedOrganisationNotificationModel, MarketplaceItemModel } from '../models';

export interface MarketplaceModerationCommand {
  itemId: string;
  caseId: string;
  action: 'DISMISS' | 'WARN' | 'REMOVE';
  reason: string;
  requestId?: string | null;
}

export async function executeMarketplaceModerationCommand(input: MarketplaceModerationCommand) {
  const item = await MarketplaceItemModel.findById(input.itemId);
  if (!item) return null;

  if (input.action === 'DISMISS' || input.action === 'WARN') {
    item.status = item.preReviewStatus ?? 'AVAILABLE';
    item.preReviewStatus = null;
    item.moderationCaseId = null;
  } else if (input.action === 'REMOVE') {
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
