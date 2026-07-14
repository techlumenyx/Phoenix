import { gql, NetworkStatus, useQuery } from '@apollo/client';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarketplaceCard from '../components/cards/MarketplaceCard';
import FAQSection from '../components/sections/FAQSection';
import OrgCTASection from '../components/sections/OrgCTASection';
import { formatPrice, usePreferredRegion } from '../lib/discovery';
import DirectoryFilters from '../components/ui/DirectoryFilters';
import DirectoryState from '../components/ui/DirectoryState';
import LoadMoreButton from '../components/ui/LoadMoreButton';

const ALL_LISTINGS = gql`
  query AllMarketplaceListings(
    $region: String
    $search: String
    $category: MarketplaceCategory
    $condition: ItemCondition
    $subCategory: String
    $minPrice: Float
    $maxPrice: Float
    $isDonation: Boolean
    $sort: MarketplaceSort
    $limit: Int
    $after: String
  ) {
    marketplaceItems(
      region: $region
      search: $search
      category: $category
      condition: $condition
      subCategory: $subCategory
      minPrice: $minPrice
      maxPrice: $maxPrice
      isDonation: $isDonation
      status: AVAILABLE
      sort: $sort
      limit: $limit
      after: $after
    ) {
      edges {
        id
        title
        description
        price
        currency
        condition
        category
        region
        imageUrls
        isDonation
        isPromoted
        seller {
          id
          isVerified
        }
      }
      hasNextPage
      endCursor
    }
  }
`;

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  category: string;
  region: string;
  imageUrls: string[];
  isDonation: boolean;
  isPromoted: boolean;
  seller: { id: string; isVerified: boolean };
}
interface ListingsData {
  marketplaceItems: { edges: Listing[]; hasNextPage: boolean; endCursor?: string | null };
}
const CATEGORIES = [
  'ELECTRONICS',
  'CLOTHING',
  'BOOKS',
  'FURNITURE',
  'FOOD',
  'BABY_AND_KIDS',
  'CHARITY_ITEMS',
  'OTHER',
] as const;
const SUBCATEGORIES = [
  'Bibles',
  'Science',
  'Lifestyle',
  'Novels',
  'Academic',
  'Self Help',
  'Non Fiction',
  'Other',
];
const SORTS = [
  ['POPULAR', 'Trending'],
  ['NEWEST', 'Newly Added'],
  ['PRICE_ASC', 'Price Low–High'],
  ['PRICE_DESC', 'Price High–Low'],
] as const;

export default function AllListingsPage() {
  const { region: preferredRegion } = usePreferredRegion();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(params.get('category') || '');
  const [condition, setCondition] = useState(params.get('condition') || '');
  const [donation, setDonation] = useState(params.get('donation') === 'true');
  const [subCategory, setSubCategory] = useState('');
  const [region, setRegion] = useState(preferredRegion);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('POPULAR');
  const variables = {
    region: region || null,
    search: search || null,
    category: category || null,
    condition: donation ? null : condition || null,
    subCategory: subCategory || null,
    minPrice: minPrice ? Number(minPrice) : null,
    maxPrice: maxPrice ? Number(maxPrice) : null,
    isDonation: donation ? true : null,
    sort,
    limit: 12,
    after: null,
  };
  const { data, loading, error, fetchMore, networkStatus } = useQuery<ListingsData>(ALL_LISTINGS, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });
  const clear = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setDonation(false);
    setSubCategory('');
    setRegion(preferredRegion);
    setMinPrice('');
    setMaxPrice('');
    setSort('POPULAR');
  };
  const loadMore = () =>
    fetchMore({
      variables: { ...variables, after: data?.marketplaceItems.endCursor },
      updateQuery: (previous, { fetchMoreResult }) =>
        fetchMoreResult
          ? {
              marketplaceItems: {
                ...fetchMoreResult.marketplaceItems,
                edges: [
                  ...previous.marketplaceItems.edges,
                  ...fetchMoreResult.marketplaceItems.edges.filter(
                    (next) =>
                      !previous.marketplaceItems.edges.some((current) => current.id === next.id),
                  ),
                ],
              },
            }
          : previous,
    });

  return (
    <>
      <main className="bg-white px-5 py-9 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serif text-sm text-gray-500">
                Marketplace › <strong className="text-black">All Listings</strong>
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold">All Listings</h1>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search listings…"
              className="w-full rounded-full bg-[#e5f5e7] px-5 py-3 text-sm outline-none sm:w-80"
            />
          </div>
          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <DirectoryFilters>
              <Filter title="Condition">
                <label className="flex gap-2 text-sm">
                  <input
                    type="radio"
                    checked={!condition && !donation}
                    onChange={() => {
                      setCondition('');
                      setDonation(false);
                    }}
                  />
                  All Items
                </label>
                {['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'].map((value) => (
                  <label key={value} className="flex gap-2 text-sm">
                    <input
                      type="radio"
                      checked={condition === value && !donation}
                      onChange={() => {
                        setCondition(value);
                        setDonation(false);
                      }}
                    />
                    {value.replaceAll('_', ' ')}
                  </label>
                ))}
                <label className="flex gap-2 text-sm">
                  <input
                    type="radio"
                    checked={donation}
                    onChange={() => {
                      setDonation(true);
                      setCondition('');
                    }}
                  />
                  Donations
                </label>
              </Filter>
              <Filter title="Category">
                {CATEGORIES.map((value) => (
                  <label key={value} className="flex gap-2 text-sm">
                    <input
                      type="radio"
                      checked={category === value}
                      onChange={() => setCategory(value)}
                    />
                    {value.replaceAll('_', ' ')}
                  </label>
                ))}
              </Filter>
              <Filter title="Sub Category">
                {SUBCATEGORIES.map((value) => (
                  <label key={value} className="flex gap-2 text-sm">
                    <input
                      type="radio"
                      checked={subCategory === value}
                      onChange={() => setSubCategory(value)}
                    />
                    {value}
                  </label>
                ))}
              </Filter>
              <Filter title="Location">
                <input
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  placeholder="City or country"
                  className="w-full rounded-lg bg-[#e5f5e7] px-3 py-2 text-sm"
                />
              </Filter>
              <Filter title="Price Range">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="Min"
                    className="w-full rounded-lg bg-[#e5f5e7] px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="Max"
                    className="w-full rounded-lg bg-[#e5f5e7] px-3 py-2 text-sm"
                  />
                </div>
              </Filter>
              <button onClick={clear} className="w-full rounded-lg bg-gray-100 py-2 text-sm">
                Clear Filters
              </button>
        </DirectoryFilters>
            <section>
              <div className="mb-6 flex gap-2 overflow-x-auto">
                {SORTS.map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setSort(value)}
                    className={`shrink-0 rounded-full px-5 py-2 text-sm ${sort === value ? 'bg-[#07523f] text-white' : 'bg-[#dff5e3]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {error ? (
                <DirectoryState kind="error" title="Listings could not be loaded" detail="Check your connection and try again." />
              ) : loading && !data ? (
                <DirectoryState kind="loading" />
              ) : data?.marketplaceItems.edges.length === 0 ? (
                <DirectoryState kind="empty" title="No matching listings" detail="Try changing the category, condition, price, or region." />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {data?.marketplaceItems.edges.map((listing) => (
                    <MarketplaceCard
                      key={listing.id}
                      badge={
                        listing.isDonation
                          ? 'Community Gives'
                          : listing.condition.replaceAll('_', ' ')
                      }
                      title={listing.title}
                      description={listing.description}
                      price={
                        listing.isDonation
                          ? 'Free donation'
                          : formatPrice(listing.price, listing.currency)
                      }
                      location={listing.region}
                      imageSrc={listing.imageUrls[0]}
                      verified={listing.seller.isVerified}
                      href={`/marketplace/${listing.id}`}
                    />
                  ))}
                </div>
              )}
              <LoadMoreButton hasMore={data?.marketplaceItems.hasNextPage} loading={networkStatus === NetworkStatus.fetchMore} label="Load more listings" onClick={loadMore} />
            </section>
          </div>
        </div>
      </main>
      <OrgCTASection />
      <FAQSection />
    </>
  );
}

function Filter({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 w-full rounded-lg bg-[#d9f0dc] px-3 py-2 text-sm font-semibold">
        {title}
      </legend>
      <div className="space-y-2 px-2 text-gray-600">{children}</div>
    </fieldset>
  );
}
