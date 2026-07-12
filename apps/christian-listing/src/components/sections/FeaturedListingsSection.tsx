import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../layout/icons';
import MarketplaceCard from '../cards/MarketplaceCard';
import { formatPrice, useDiscovery, usePreferredRegion } from '../../lib/discovery';

export default function FeaturedListingsSection() {
  const { region } = usePreferredRegion();
  const { data, loading, error } = useDiscovery('', 4);
  const listings = data?.marketplaceItems.edges ?? [];

  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-16 border-t border-gray-50">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark">Featured Listings</h2>
          {region && <p className="mt-1 text-xs text-gray-400">Personalised for {region}</p>}
        </div>
        <Link to="/marketplace" className="font-display text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 mb-1">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4">
        {loading && !data && <p className="text-sm text-gray-500">Loading listings…</p>}
        {error && <p className="text-sm text-red-600">Listings are temporarily unavailable.</p>}
        {!loading && !error && listings.length === 0 && <p className="text-sm text-gray-500">No listings found{region ? ` in ${region}` : ''}.</p>}
        {listings.map((listing) => (
          <div key={listing.id} className="shrink-0 w-[75vw] sm:w-[48vw] md:w-auto">
            <MarketplaceCard
              badge={listing.isDonation ? 'COMMUNITY GIVES' : listing.condition.replaceAll('_', ' ')}
              title={listing.title} description={listing.description}
              price={listing.isDonation ? 'Free donation' : formatPrice(listing.price, listing.currency)}
              location={listing.area ? `${listing.area}, ${listing.region}` : listing.region}
              imageSrc={listing.imageUrls[0]} verified={listing.seller.isVerified}
              href={`/marketplace/${listing.id}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
