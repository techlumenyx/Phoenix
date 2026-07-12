import { gql, useQuery } from '@apollo/client';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MarketplaceCard from '../components/cards/MarketplaceCard';
import { ArrowRightIcon, SearchIcon } from '../components/layout/icons';
import { formatPrice, usePreferredRegion } from '../lib/discovery';
import { useAuthStore } from '../store/authStore';

const MARKETPLACE_HOME = gql`
  query MarketplaceHome($region: String, $search: String) {
    promoted: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: POPULAR, limit: 8) { edges { ...HomeListing } }
    newest: marketplaceItems(region: $region, search: $search, status: AVAILABLE, sort: NEWEST, limit: 20) { edges { ...HomeListing } }
    donations: marketplaceItems(region: $region, search: $search, status: AVAILABLE, isDonation: true, sort: NEWEST, limit: 8) { edges { ...HomeListing } }
  }
  fragment HomeListing on MarketplaceItem { id title description price currency condition category region imageUrls isDonation isPromoted seller { id isVerified } }
`;

interface HomeListing { id: string; title: string; description: string; price: number; currency: string; condition: string; category: string; region: string; imageUrls: string[]; isDonation: boolean; isPromoted: boolean; seller: { id: string; isVerified: boolean } }
interface HomeData { promoted: { edges: HomeListing[] }; newest: { edges: HomeListing[] }; donations: { edges: HomeListing[] } }
const CATEGORIES = [['FURNITURE', 'Home & Living', '⌂'], ['ELECTRONICS', 'Electronics', '▣'], ['BABY_AND_KIDS', 'Family & Kids', '♧'], ['CLOTHING', 'Clothing', '♢'], ['BOOKS', 'Books', '▤'], ['OTHER', 'Transport', '◇'], ['OTHER', 'Sports & Outdoor', '○'], ['FOOD', 'Food / Produce', '♨']] as const;

export default function MarketplacePage() {
  const { region } = usePreferredRegion();
  const preferences = useAuthStore((state) => state.dbUser?.preferences ?? []);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, error } = useQuery<HomeData>(MARKETPLACE_HOME, { variables: { region: region || null, search: search || null }, fetchPolicy: 'cache-and-network' });
  const newest = data?.newest.edges ?? [];
  const submit = (event: FormEvent) => { event.preventDefault(); setSearch(input.trim()); };
  const interestListings = useMemo(() => preferences.includes('Marketplace Deals') ? newest : newest.filter((listing) => ['BOOKS', 'CHARITY_ITEMS', 'FURNITURE'].includes(listing.category)), [newest, preferences]);

  return <>
    <section className="relative flex min-h-[440px] items-center justify-center overflow-hidden bg-[#312a23] px-6 text-center"><img src="/assets/org-cta.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" /><div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/25" /><div className="relative w-full max-w-2xl"><h1 className="font-serif text-4xl font-bold text-white md:text-5xl">Discover what you&apos;re<br />looking for</h1><form onSubmit={submit} className="mx-auto mt-7 flex max-w-xl items-center overflow-hidden rounded-full bg-white shadow-lg"><SearchIcon className="ml-4 h-5 w-5 text-gray-400" /><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search products, categories or sellers…" className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" /><button className="m-1 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white">Explore</button></form>{region && <p className="mt-3 text-xs text-white/70">Showing listings near {region}</p>}</div></section>
    {error && <p className="py-10 text-center text-red-700">Marketplace listings are temporarily unavailable.</p>}
    <section className="px-6 py-12 md:px-10 lg:px-16"><h2 className="mb-6 font-serif text-3xl font-bold">Discover your Listing</h2><div className="grid gap-4 md:grid-cols-3">{[['Used Goods', 'Find useful pre-owned items', 'GOOD'], ['Donations', 'Community items offered freely', 'donation'], ['New & Packed', 'Browse brand-new products', 'NEW']].map(([title, description, filter]) => <Link key={title} to={filter === 'donation' ? '/marketplace/all?donation=true' : `/marketplace/all?condition=${filter}`} className="relative flex h-56 items-end overflow-hidden rounded-2xl bg-[#222] p-5 text-white"><img src={title === 'Used Goods' ? '/assets/car-ford.png' : '/assets/event-theology.png'} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" /><div className="relative"><h3 className="font-serif text-2xl font-bold">{title}</h3><p className="mt-1 text-xs text-white/75">{description}</p></div></Link>)}</div></section>
    <section className="px-6 py-10 md:px-10 lg:px-16"><h2 className="mb-6 font-serif text-3xl font-bold">Trending Categories</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{CATEGORIES.map(([value, label, icon], index) => <Link key={`${label}-${index}`} to={`/marketplace/all?category=${value}`} className="relative flex h-32 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b2420] to-[#6d826e] p-4 text-white"><span className="absolute right-4 top-3 text-3xl">{icon}</span><strong>{label}</strong></Link>)}</div></section>
    <ListingSection title="Based on your Interests" listings={(interestListings.length ? interestListings : newest).slice(0, 4)} loading={loading} />
    <ListingSection title="Community Gives" listings={data?.donations.edges ?? []} loading={loading} />
    <ListingSection title="Featured Listings" listings={data?.promoted.edges ?? []} loading={loading} />
    <section className="relative overflow-hidden bg-[#2e2820] px-6 py-14 text-center text-white"><img src="/assets/org-cta.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /><div className="relative"><p className="font-serif text-xl italic">“One who is gracious to those in need lends to the Lord.”</p><Link to="/marketplace/all?donation=true" className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-xs font-semibold text-black">Browse donations</Link></div></section>
    <ListingSection title="All Listings" listings={newest.slice(0, 16)} loading={loading} viewAll />
  </>;
}

function ListingSection({ title, listings, loading, viewAll = false }: { title: string; listings: HomeListing[]; loading: boolean; viewAll?: boolean }) { return <section className="px-6 py-12 md:px-10 lg:px-16"><div className="mb-6 flex items-end justify-between"><h2 className="font-serif text-3xl font-bold">{title}</h2><Link to="/marketplace/all" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500">View all <ArrowRightIcon className="h-3.5 w-3.5 -rotate-45" /></Link></div>{loading && listings.length === 0 ? <p className="text-gray-500">Loading listings…</p> : listings.length === 0 ? <p className="text-gray-500">No listings are available in this section.</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{listings.map((listing) => <MarketplaceCard key={listing.id} badge={listing.isDonation ? 'Community Gives' : listing.condition.replaceAll('_', ' ')} title={listing.title} description={listing.description} price={listing.isDonation ? 'Free donation' : formatPrice(listing.price, listing.currency)} location={listing.region} imageSrc={listing.imageUrls[0]} verified={listing.seller.isVerified} href={`/marketplace/${listing.id}`} />)}</div>}{viewAll && listings.length > 0 && <div className="mt-8 text-center"><Link to="/marketplace/all" className="rounded-full border px-8 py-3 text-sm">Browse all listings</Link></div>}</section>; }
