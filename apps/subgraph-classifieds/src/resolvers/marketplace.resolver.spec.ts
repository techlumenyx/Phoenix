import mongoose from 'mongoose';
import { mapItem } from './marketplace.resolver';

function marketplaceDocument(organisationId: mongoose.Types.ObjectId | null) {
  return {
    _id: new mongoose.Types.ObjectId(),
    organisationId,
    createdBy: 'firebase-user-id',
    title: 'Community table',
    description: 'A listing description',
    sellingPrice: 25,
    currency: 'GBP',
    condition: 'GOOD',
    category: 'FURNITURE',
    area: 'Camden',
    region: 'London, United Kingdom',
    imageUrls: [],
    videoUrl: null,
    videoPosterUrl: null,
    status: 'AVAILABLE',
    isDonation: false,
    isPromoted: false,
    flagCount: 0,
    subCategory: null,
    dimensions: null,
    otherAttributes: null,
    maxRetailPrice: null,
    contactInfo: null,
    showContactOnOffer: false,
    createdAt: new Date('2026-08-01T10:00:00.000Z'),
    updatedAt: new Date('2026-08-01T10:00:00.000Z'),
  } as unknown as Parameters<typeof mapItem>[0];
}

describe('marketplace federation mapping', () => {
  it('exposes an organisation reference for organisation-owned listings', () => {
    const organisationId = new mongoose.Types.ObjectId();
    expect(mapItem(marketplaceDocument(organisationId)).organisation).toEqual({ id: organisationId.toString() });
  });

  it('keeps individual listings free of an organisation reference', () => {
    expect(mapItem(marketplaceDocument(null)).organisation).toBeNull();
  });
});
