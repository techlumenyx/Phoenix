import { GraphQLError } from 'graphql';
import mongoose, { type HydratedDocument } from 'mongoose';
import { type IMarketplaceItem } from '../models/marketplace-item.model';
import { ClassifiedOrganisationNotificationModel, MarketplaceItemModel } from '../models';
import type { GraphQLContext } from '../context';
import { canAccessOrganisation } from '@christian-listings/auth';
import { sendMarketplaceReport } from '../services/admin-report.service';
import { resolveLocationRegion } from '@christian-listings/utils';

type ItemDocument = HydratedDocument<IMarketplaceItem>;

export function mapItem(doc: ItemDocument) {
  return {
    id:          doc._id.toString(),
    title:       doc.title,
    description: doc.description,
    seller:      { firebaseUid: doc.createdBy },
    price:       doc.sellingPrice,
    currency:    doc.currency,
    condition:   doc.condition,
    category:    doc.category,
    area:        null,
    region:      doc.region ?? '',
    imageUrls:   doc.imageUrls ?? [],
    videoUrl:    doc.videoUrl ?? null,
    videoPosterUrl: doc.videoPosterUrl ?? null,
    status:      doc.status,
    isDonation:  doc.isDonation,
    isPromoted:  doc.isPromoted,
    flagCount:   doc.flagCount ?? 0,
    convertedPrice: null,
    subCategory: doc.subCategory ?? null,
    dimensions: doc.dimensions ?? null,
    otherAttributes: doc.otherAttributes ?? null,
    maxRetailPrice: doc.maxRetailPrice ?? null,
    contactInfo: doc.contactInfo ?? null,
    showContactOnOffer: doc.showContactOnOffer,
    createdAt:   doc.createdAt,
    updatedAt:   doc.updatedAt,
  };
}

interface CreateItemInput {
  title:       string;
  description: string;
  price:       number;
  currency:    string;
  condition:   string;
  category:    string;
  area?:       string;
  region:      string;
  imageUrls:   string[];
  videoUrl?: string;
  videoPosterUrl?: string;
  isDonation:  boolean;
  organisationId?: string;
}

type UpdateItemInput = Partial<Pick<CreateItemInput,
  'title' | 'description' | 'price' | 'currency' | 'condition' | 'category' |
  'region' | 'imageUrls' | 'videoUrl' | 'videoPosterUrl' | 'isDonation'
>>;

const LISTING_MANAGER_ROLES = ['master_admin', 'site_admin', 'classifieds_manager'] as const;

function canManageItem(doc: ItemDocument, ctx: GraphQLContext) {
  if (doc.organisationId) {
    return canAccessOrganisation(ctx.auth, doc.organisationId.toString(), [...LISTING_MANAGER_ROLES]);
  }
  return doc.createdBy === ctx.auth.firebaseUid;
}

async function requireManageableItem(id: string, ctx: GraphQLContext) {
  if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  const doc = await MarketplaceItemModel.findById(id);
  if (!doc || !canManageItem(doc, ctx)) {
    throw new GraphQLError('Item not found or access denied', { extensions: { code: 'NOT_FOUND' } });
  }
  return doc;
}

interface ItemsArgs {
  region?:     string;
  search?:     string;
  category?:   string;
  condition?:  string;
  subCategory?: string;
  minPrice?:   number;
  maxPrice?:   number;
  isDonation?: boolean;
  status?:     string;
  limit?:      number;
  after?:      string;
  sort?:       string;
}

export const marketplaceResolvers = {
  Query: {
    marketplaceItem: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const doc = await MarketplaceItemModel.findById(id);
      if (doc && ['PENDING_REVIEW', 'REMOVED'].includes(doc.status) && !isPlatformAdmin(ctx) && !canManageItem(doc, ctx)) {
        return null;
      }
      return doc ? mapItem(doc) : null;
    },

    marketplaceItems: async (_: unknown, { region, search, category, condition, subCategory, minPrice, maxPrice, isDonation, status, sort = 'NEWEST', limit = 20, after }: ItemsArgs, ctx: GraphQLContext) => {
      const filter: Record<string, unknown> = {};
      if (region) {
        const resolved = resolveLocationRegion(region);
        if (resolved) filter['$and'] = [{ $or: [{ region: resolved.displayName }, { regionCode: { $in: resolved.codes } }] }];
      }
      if (search?.trim()) {
        const pattern = { $regex: escapeRegex(search.trim()), $options: 'i' };
        filter['$and'] = [...((filter['$and'] as unknown[]) ?? []), { $or: [{ title: pattern }, { description: pattern }, { area: pattern }] }];
      }
      if (category)               filter['category'] = category;
      if (condition)              filter['condition'] = condition;
      if (subCategory)            filter['subCategory'] = { $regex: escapeRegex(subCategory), $options: 'i' };
      if (minPrice != null || maxPrice != null) filter['sellingPrice'] = { ...(minPrice != null && { $gte: minPrice }), ...(maxPrice != null && { $lte: maxPrice }) };
      if (isDonation != null) filter['isDonation'] = isDonation;
      if (isPlatformAdmin(ctx)) {
        if (status) filter['status'] = status;
      } else {
        filter['status'] = 'AVAILABLE';
      }
      if (after)                  filter['_id'] = { $gt: new mongoose.Types.ObjectId(after) };

      const sortBy: Record<string, 1 | -1> = sort === 'PRICE_ASC' ? { sellingPrice: 1 } : sort === 'PRICE_DESC' ? { sellingPrice: -1 } : sort === 'POPULAR' ? { isPromoted: -1, createdAt: -1 } : { createdAt: -1 };
      const docs = await MarketplaceItemModel.find(filter).limit(limit + 1).sort(sortBy);
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map(mapItem);
      return { edges, hasNextPage, endCursor: edges.length > 0 ? edges[edges.length - 1].id : null };
    },

    communityGives: async (_: unknown, { region, limit = 10 }: { region?: string; limit?: number }) => {
      const filter: Record<string, unknown> = { isDonation: true, status: 'AVAILABLE' };
      if (region) {
        const resolved = resolveLocationRegion(region);
        if (resolved) filter['$or'] = [{ region: resolved.displayName }, { regionCode: { $in: resolved.codes } }];
      }
      const docs = await MarketplaceItemModel.find(filter).limit(limit).sort({ _id: -1 });
      return docs.map(mapItem);
    },
  },

  Mutation: {
    createMarketplaceItem: async (_: unknown, { input }: { input: CreateItemInput }, ctx: GraphQLContext) => {
      if (input.imageUrls.length > 8) throw new GraphQLError('Listings support up to 8 images', { extensions: { code: 'BAD_USER_INPUT' } });
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      if (input.organisationId && !canAccessOrganisation(ctx.auth, input.organisationId, ['master_admin', 'site_admin', 'classifieds_manager'])) {
        throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      }
      const region = resolveLocationRegion(input.region);
      const doc = await MarketplaceItemModel.create({
        createdBy:    ctx.auth.firebaseUid,
        organisationId: input.organisationId ? new mongoose.Types.ObjectId(input.organisationId) : null,
        title:        input.title,
        description:  input.description,
        category:     input.category,
        condition:    input.condition,
        region:       region?.displayName ?? input.region.trim(),
        regionCode:   region?.code ?? null,
        sellingPrice: input.isDonation ? 0 : input.price,
        currency:     input.currency,
        isDonation:   input.isDonation,
        imageUrls:    input.imageUrls,
        videoUrl:     input.videoUrl ?? null,
        videoPosterUrl: input.videoPosterUrl ?? null,
        status:       'AVAILABLE',
      });
      return mapItem(doc);
    },

    updateMarketplaceItem: async (_: unknown, { id, input }: { id: string; input: UpdateItemInput }, ctx: GraphQLContext) => {
      const doc = await requireManageableItem(id, ctx);
      const update: Record<string, unknown> = {};
      if (input.title?.trim())       update['title'] = input.title.trim();
      if (input.description?.trim()) update['description'] = input.description.trim();
      if (input.price !== undefined) update['sellingPrice'] = input.price;
      if (input.currency?.trim()) update['currency'] = input.currency.trim().toUpperCase();
      if (input.condition)   update['condition'] = input.condition;
      if (input.category)    update['category'] = input.category;
      if (input.region?.trim()) {
        const region = resolveLocationRegion(input.region);
        update['region'] = region?.displayName ?? input.region.trim();
        update['regionCode'] = region?.code ?? null;
      }
      if (input.imageUrls)   update['imageUrls'] = input.imageUrls;
      if (input.videoUrl !== undefined) update['videoUrl'] = input.videoUrl || null;
      if (input.videoPosterUrl !== undefined) update['videoPosterUrl'] = input.videoPosterUrl || null;
      if (input.isDonation !== undefined) {
        update['isDonation'] = input.isDonation;
        if (input.isDonation) update['sellingPrice'] = 0;
      }

      doc.set(update);
      await doc.save();
      return mapItem(doc);
    },

    deleteMarketplaceItem: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const doc = await requireManageableItem(id, ctx);
      const result = await MarketplaceItemModel.deleteOne({ _id: doc._id });
      return result.deletedCount > 0;
    },

    updateMarketplaceItemStatus: async (_: unknown, { id, status }: { id: string; status: string }, ctx: GraphQLContext) => {
      if (!['AVAILABLE', 'RESERVED', 'SOLD'].includes(status)) {
        throw new GraphQLError('This listing status cannot be set manually', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const doc = await requireManageableItem(id, ctx);
      doc.status = status as ItemDocument['status'];
      await doc.save();
      return mapItem(doc);
    },

    reportListing: async (_: unknown, { itemId, reason }: { itemId: string; reason: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const value = reason.trim();
      if (!value || value.length > 1100) {
        throw new GraphQLError('A valid report reason is required', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const item = await MarketplaceItemModel.findById(itemId);
      if (!item) throw new GraphQLError('Listing not found', { extensions: { code: 'NOT_FOUND' } });
      if (canManageItem(item, ctx)) {
        throw new GraphQLError('You cannot report a listing you manage', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (item.status === 'REMOVED') {
        throw new GraphQLError('This listing is no longer available', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const intake = await sendMarketplaceReport({
        itemId: item._id.toString(),
        reporterFirebaseUid: ctx.auth.firebaseUid,
        reason: value,
        snapshot: {
          title: item.title,
          ownerFirebaseUid: item.createdBy,
          organisationId: item.organisationId?.toString() ?? null,
          status: item.status,
        },
      });

      item.flagCount = intake.distinctReportCount;
      if (intake.shouldHide && item.status !== 'PENDING_REVIEW') {
        if (['AVAILABLE', 'RESERVED', 'SOLD'].includes(item.status)) {
          item.preReviewStatus = item.status as 'AVAILABLE' | 'RESERVED' | 'SOLD';
        }
        item.status = 'PENDING_REVIEW';
        item.moderationCaseId = intake.caseId;
      }
      await item.save();

      if (intake.shouldHide && item.organisationId) {
        const dedupeKey = `review:${intake.caseId}`;
        await ClassifiedOrganisationNotificationModel.updateOne(
          { dedupeKey },
          { $setOnInsert: { organisationId: item.organisationId, type: 'LISTING_UNDER_REVIEW', title: 'Listing under review', message: `${item.title} is temporarily hidden while our moderation team reviews community reports.`, href: '/org/listings', sourceId: item._id.toString(), dedupeKey, readAt: null } },
          { upsert: true },
        );
      }
      return true;
    },
  },

  MarketplaceItem: {
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await MarketplaceItemModel.findById(id);
      return doc ? mapItem(doc) : null;
    },
    seller: (item: { seller: { firebaseUid: string } }) => item.seller,
  },

  User: {
    __resolveReference: ({ firebaseUid }: { firebaseUid: string }) => ({ firebaseUid }),
    marketplaceListings: async ({ firebaseUid }: { firebaseUid: string }) => {
      const docs = await MarketplaceItemModel.find({ createdBy: firebaseUid }).sort({ _id: -1 });
      return docs.map(mapItem);
    },
    jobApplications: () => [],
    savedJobs: () => [],
  },
  Organisation: {
    marketplaceListings: async ({ id }: { id: string }) => {
      const docs = await MarketplaceItemModel.find({ organisationId: new mongoose.Types.ObjectId(id) }).sort({ createdAt: -1 });
      return docs.map(mapItem);
    },
  },
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isPlatformAdmin(ctx: GraphQLContext) {
  return ctx.auth.decodedToken?.['accountType'] === 'admin';
}
