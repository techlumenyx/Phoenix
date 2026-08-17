import { gql, useQuery } from '@apollo/client';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MarketplaceCard from '../components/cards/MarketplaceCard';
import { ArrowRightIcon, SearchIcon } from '../components/layout/icons';
import ContentPlaceholder from '../components/media/ContentPlaceholder';
import ResilientImage from '../components/media/ResilientImage';
import { formatPrice, usePreferredRegion } from '../lib/discovery';
import { mergeUniqueById } from '../lib/homepage-selection';
import { useAuthStore } from '../store/authStore';

const MARKETPLACE_HOME = gql`
  query MarketplaceHome($region: String, $search: String, $hasRegion: Boolean!) {
    regionalPromoted: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: POPULAR, limit: 8) @include(if: $hasRegion) { edges { ...HomeListing } }
    globalPromoted: marketplaceItems(search: $search, status: AVAILABLE, sort: POPULAR, limit: 8) { edges { ...HomeListing } }
    regionalNewest: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: NEWEST, limit: 20) @include(if: $hasRegion) { edges { ...HomeListing } }
    globalNewest: marketplaceItems(search: $search, status: AVAILABLE, sort: NEWEST, limit: 20) { edges { ...HomeListing } }
    regionalDonations: marketplaceItems(region: $region, search: $search, status: AVAILABLE, isDonation: true, sort: NEWEST, limit: 8) @include(if: $hasRegion) { edges { ...HomeListing } }
    globalDonations: marketplaceItems(search: $search, status: AVAILABLE, isDonation: true, sort: NEWEST, limit: 8) { edges { ...HomeListing } }
  }
  fragment HomeListing on MarketplaceItem { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }
`;

interface HomeListing { id: string; title: string; description: string; price: number; currency: string; condition: string; category: string; region: string; imageUrls: string[]; isDonation: boolean; isPromoted: boolean; seller: { id: string; isVerified: boolean } }
interface HomeData { regionalPromoted?: { edges: HomeListing[] }; globalPromoted: { edges: HomeListing[] }; regionalNewest?: { edges: HomeListing[] }; globalNewest: { edges: HomeListing[] }; regionalDonations?: { edges: HomeListing[] }; globalDonations: { edges: HomeListing[] } }
const CATEGORIES = [
  { value: 'FURNITURE', label: 'Home & Living', image: 'https://images.unsplash.com/photo-1759722665629-29df6ee4f9a5?auto=format&fit=crop&w=720&h=480&q=78' },
  { value: 'ELECTRONICS', label: 'Electronics', image: 'https://images.unsplash.com/photo-1515940175183-6798529cb860?auto=format&fit=crop&w=720&h=480&q=78' },
  { value: 'BABY_AND_KIDS', label: 'Family & Kids', image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=720&h=480&q=78' },
  { value: 'CLOTHING', label: 'Clothing', image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=720&h=480&q=78' },
  { value: 'BOOKS', label: 'Books', image: 'https://images.unsplash.com/photo-1604866830893-c13cafa515d5?auto=format&fit=crop&w=720&h=480&q=78' },
  { value: 'OTHER', label: 'Transport', image: 'https://images.unsplash.com/photo-1778029229094-80c0fee4f4d1?auto=format&fit=crop&w=720&h=480&q=78' },
  { value: 'OTHER', label: 'Sports & Outdoor', image: 'https://images.unsplash.com/photo-1485809052957-5113b0ff51af?auto=format&fit=crop&w=720&h=480&q=78' },
  { value: 'FOOD', label: 'Food / Produce', image: 'https://images.unsplash.com/photo-1609126986933-e3c84f19d49c?auto=format&fit=crop&w=720&h=480&q=78' },
] as const;

const DISCOVER_CARDS = [
  { title: 'Used Goods', description: 'Find useful pre-owned items', filter: 'GOOD', image: 'https://images.unsplash.com/photo-1623503664086-475867ec20b3?auto=format&fit=crop&w=800&h=600&q=78' },
  { title: 'Donations', description: 'Community items offered freely', filter: 'donation', image: 'https://images.unsplash.com/photo-1750343293522-2f08b60a317a?auto=format&fit=crop&w=800&h=600&q=78' },
  { title: 'New & Packed', description: 'Browse brand-new products', filter: 'NEW', image: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&w=800&h=600&q=78' },
] as const;
const EMPTY_PREFERENCES: string[] = [];

export default function MarketplacePage() {
  const { region } = usePreferredRegion();
  const preferences = useAuthStore((state) => state.dbUser?.preferences ?? EMPTY_PREFERENCES);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const hasRegion = Boolean(region);
  const { data, loading, error } = useQuery<HomeData>(MARKETPLACE_HOME, { variables: { region: region || null, search: search || null, hasRegion }, fetchPolicy: 'cache-and-network' });
  const allowGlobalFallback = !search;
  const localNewest = data?.regionalNewest?.edges ?? [];
  const newest = (allowGlobalFallback ? mergeUniqueById(localNewest, data?.globalNewest.edges ?? []) : (hasRegion ? localNewest : data?.globalNewest.edges ?? [])).slice(0, 20);
  const promoted = (allowGlobalFallback ? mergeUniqueById(data?.regionalPromoted?.edges ?? [], data?.globalPromoted.edges ?? []) : (hasRegion ? data?.regionalPromoted?.edges ?? [] : data?.globalPromoted.edges ?? [])).slice(0, 8);
  const donations = (allowGlobalFallback ? mergeUniqueById(data?.regionalDonations?.edges ?? [], data?.globalDonations.edges ?? []) : (hasRegion ? data?.regionalDonations?.edges ?? [] : data?.globalDonations.edges ?? [])).slice(0, 8);
  const isShowingGlobalFallback = Boolean(hasRegion && allowGlobalFallback && localNewest.length === 0 && newest.length > 0);
  const submit = (event: FormEvent) => { event.preventDefault(); setSearch(input.trim()); };
  const interestListings = useMemo(() => preferences.includes('Marketplace Deals') ? newest : newest.filter((listing) => ['BOOKS', 'CHARITY_ITEMS', 'FURNITURE'].includes(listing.category)), [newest, preferences]);

  return <>
    <section className="relative flex min-h-[440px] items-center justify-center overflow-hidden bg-[#312a23] px-6 text-center"><img src="/assets/org-cta.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" /><div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/25" /><div className="relative w-full max-w-2xl"><h1 className="font-serif text-4xl font-bold text-white md:text-5xl">Discover what you&apos;re<br />looking for</h1><form onSubmit={submit} className="mx-auto mt-7 flex max-w-xl items-center overflow-hidden rounded-full bg-white shadow-lg"><SearchIcon className="ml-4 h-5 w-5 text-gray-400" /><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search products, categories or sellers…" className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" /><button className="m-1 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white">Explore</button></form>{region && <p className="mt-3 text-xs text-white/70">Showing listings near {region}</p>}</div></section>
    {error && <p className="py-10 text-center text-red-700">Marketplace listings are temporarily unavailable.</p>}
    {isShowingGlobalFallback && <p className="bg-amber-50 px-6 py-3 text-center text-sm text-amber-900">No current listings near {region}. Showing listings from across Christian Listings.</p>}
    <section className="px-6 py-12 md:px-10 lg:px-16"><h2 className="mb-6 font-serif text-3xl font-bold">Discover your Listing</h2><div className="grid gap-4 md:grid-cols-3">{DISCOVER_CARDS.map(({ title, description, filter, image }) => <Link key={title} to={filter === 'donation' ? '/marketplace/all?donation=true' : `/marketplace/all?condition=${filter}`} className="group relative flex h-56 items-end overflow-hidden rounded-2xl bg-[#222] p-5 text-white"><ResilientImage src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-300 group-hover:scale-[1.03]" fallback={<ContentPlaceholder variant="marketplace" title={title} label={title} className="absolute inset-0" />} /><span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" /><div className="relative"><h3 className="font-serif text-2xl font-bold">{title}</h3><p className="mt-1 text-xs text-white/75">{description}</p></div></Link>)}</div></section>
    <section className="px-6 py-10 md:px-10 lg:px-16"><h2 className="mb-6 font-serif text-3xl font-bold">Trending Categories</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{CATEGORIES.map(({ value, label, image }, index) => <Link key={`${label}-${index}`} to={`/marketplace/all?category=${value}`} className="group relative flex h-32 flex-col justify-end overflow-hidden rounded-2xl bg-[#332c31] p-4 text-left text-white sm:h-40"><ResilientImage src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" fallback={<ContentPlaceholder variant="marketplace" title={label} label={label} className="absolute inset-0" />} /><span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" aria-hidden="true" /><strong className="relative drop-shadow-sm">{label}</strong></Link>)}</div></section>
    <ListingSection title="Based on your Interests" listings={(interestListings.length ? interestListings : newest).slice(0, 4)} loading={loading} />
    <ListingSection title="Community Gives" listings={donations} loading={loading} />
    <ListingSection title="Featured Listings" listings={promoted} loading={loading} />
    <section className="relative overflow-hidden bg-[#2e2820] px-6 py-14 text-center text-white"><img src="/assets/org-cta.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /><div className="relative"><p className="font-serif text-xl italic">“One who is gracious to those in need lends to the Lord.”</p><Link to="/marketplace/all?donation=true" className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-xs font-semibold text-black">Browse donations</Link></div></section>
    <ListingSection title="All Listings" listings={newest.slice(0, 16)} loading={loading} viewAll />
  </>;
}

function ListingSection({ title, listings, loading, viewAll = false }: { title: string; listings: HomeListing[]; loading: boolean; viewAll?: boolean }) { return <section className="px-6 py-12 md:px-10 lg:px-16"><div className="mb-6 flex items-end justify-between"><h2 className="font-serif text-3xl font-bold">{title}</h2><Link to="/marketplace/all" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500">View all <ArrowRightIcon className="h-3.5 w-3.5 -rotate-45" /></Link></div>{loading && listings.length === 0 ? <p className="text-gray-500">Loading listings…</p> : listings.length === 0 ? <p className="text-gray-500">No listings are available in this section.</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{listings.map((listing) => <MarketplaceCard key={listing.id} badge={listing.isDonation ? 'Community Gives' : listing.condition.replaceAll('_', ' ')} title={listing.title} description={listing.description} price={listing.isDonation ? 'Free donation' : formatPrice(listing.price, listing.currency)} location={listing.region} imageSrc={listing.imageUrls[0]} verified={listing.seller.isVerified} href={`/marketplace/${listing.id}`} />)}</div>}{viewAll && listings.length > 0 && <div className="mt-8 text-center"><Link to="/marketplace/all" className="rounded-full border px-8 py-3 text-sm">Browse all listings</Link></div>}</section>; }
