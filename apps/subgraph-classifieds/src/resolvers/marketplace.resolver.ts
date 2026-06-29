import { GraphQLError } from 'graphql';
import mongoose, { type HydratedDocument } from 'mongoose';
import { type IMarketplaceItem } from '../models/marketplace-item.model';
import { MarketplaceItemModel } from '../models';
import type { GraphQLContext } from '../context';

type ItemDocument = HydratedDocument<IMarketplaceItem>;

function mapItem(doc: ItemDocument) {
  return {
    id:          doc._id.toString(),
    title:       doc.title,
    description: doc.description,
    seller:      { id: doc.createdBy },
    price:       doc.sellingPrice,
    currency:    doc.currency,
    condition:   doc.condition,
    category:    doc.category,
    area:        null,
    region:      doc.region ?? '',
    imageUrls:   doc.imageUrls ?? [],
    status:      doc.status,
    isDonation:  doc.isDonation,
    isPromoted:  doc.isPromoted,
    flagCount:   0,
    convertedPrice: null,
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
  isDonation:  boolean;
}

interface ItemsArgs {
  region?:     string;
  category?:   string;
  condition?:  string;
  isDonation?: boolean;
  status?:     string;
  limit?:      number;
  after?:      string;
}

export const marketplaceResolvers = {
  Query: {
    marketplaceItem: async (_: unknown, { id }: { id: string }) => {
      const doc = await MarketplaceItemModel.findById(id);
      return doc ? mapItem(doc) : null;
    },

    marketplaceItems: async (_: unknown, { region, category, condition, isDonation, status, limit = 20, after }: ItemsArgs) => {
      const filter: Record<string, unknown> = {};
      if (region)                 filter['region'] = region;
      if (category)               filter['category'] = category;
      if (condition)              filter['condition'] = condition;
      if (isDonation !== undefined) filter['isDonation'] = isDonation;
      if (status)                 filter['status'] = status;
      if (after)                  filter['_id'] = { $gt: new mongoose.Types.ObjectId(after) };

      const docs = await MarketplaceItemModel.find(filter).limit(limit + 1).sort({ _id: -1 });
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map(mapItem);
      return { edges, hasNextPage, endCursor: edges.length > 0 ? edges[edges.length - 1].id : null };
    },

    communityGives: async (_: unknown, { region, limit = 10 }: { region?: string; limit?: number }) => {
      const filter: Record<string, unknown> = { isDonation: true, status: 'AVAILABLE' };
      if (region) filter['region'] = region;
      const docs = await MarketplaceItemModel.find(filter).limit(limit).sort({ _id: -1 });
      return docs.map(mapItem);
    },
  },

  Mutation: {
    createMarketplaceItem: async (_: unknown, { input }: { input: CreateItemInput }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const doc = await MarketplaceItemModel.create({
        createdBy:    ctx.auth.firebaseUid,
        title:        input.title,
        description:  input.description,
        category:     input.category,
        condition:    input.condition,
        region:       input.region,
        sellingPrice: input.isDonation ? 0 : input.price,
        currency:     input.currency,
        isDonation:   input.isDonation,
        imageUrls:    input.imageUrls,
        status:       'AVAILABLE',
      });
      return mapItem(doc);
    },

    updateMarketplaceItem: async (_: unknown, { id, input }: { id: string; input: Partial<CreateItemInput> }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const update: Record<string, unknown> = {};
      if (input.title)       update['title'] = input.title;
      if (input.description) update['description'] = input.description;
      if (input.price !== undefined) update['sellingPrice'] = input.price;
      if (input.condition)   update['condition'] = input.condition;
      if (input.imageUrls)   update['imageUrls'] = input.imageUrls;
      if (input.isDonation !== undefined) update['isDonation'] = input.isDonation;

      const doc = await MarketplaceItemModel.findOneAndUpdate(
        { _id: id, createdBy: ctx.auth.firebaseUid },
        { $set: update },
        { new: true },
      );
      if (!doc) throw new GraphQLError('Item not found or access denied', { extensions: { code: 'NOT_FOUND' } });
      return mapItem(doc);
    },

    deleteMarketplaceItem: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const result = await MarketplaceItemModel.deleteOne({ _id: id, createdBy: ctx.auth.firebaseUid });
      return result.deletedCount > 0;
    },

    updateMarketplaceItemStatus: async (_: unknown, { id, status }: { id: string; status: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const doc = await MarketplaceItemModel.findOneAndUpdate(
        { _id: id, createdBy: ctx.auth.firebaseUid },
        { $set: { status } },
        { new: true },
      );
      if (!doc) throw new GraphQLError('Item not found or access denied', { extensions: { code: 'NOT_FOUND' } });
      return mapItem(doc);
    },

    reportListing: async (_: unknown, { itemId }: { itemId: string; reason: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      await MarketplaceItemModel.updateOne({ _id: itemId }, { $inc: { flagCount: 1 } });
      return true;
    },
  },

  MarketplaceItem: {
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await MarketplaceItemModel.findById(id);
      return doc ? mapItem(doc) : null;
    },
    seller: (item: { seller: { id: string } }) => item.seller,
  },

  User: {
    __resolveReference: ({ id }: { id: string }) => ({ id }),
    marketplaceListings: async ({ id }: { id: string }) => {
      const docs = await MarketplaceItemModel.find({ createdBy: id }).sort({ _id: -1 });
      return docs.map(mapItem);
    },
    jobApplications: () => [],
    savedJobs: () => [],
  },
};
