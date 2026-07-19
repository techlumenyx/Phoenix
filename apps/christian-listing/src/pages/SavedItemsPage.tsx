import React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import EventCard from '../components/cards/EventCard';
import JobCard from '../components/cards/JobCard';
import MarketplaceCard from '../components/cards/MarketplaceCard';
import { formatPrice } from '../lib/discovery';

const SAVED_ITEMS = gql`query SavedItemsHub { myRsvps(stage: SAVED) { id event { id title description category date region rsvpCount imageUrls hosts { isVerified } } } mySavedJobs { id title roleType workLocation region salaryRange { min max currency } organisation { name isVerified } } mySavedMarketplaceItems { id title description price currency region imageUrls isDonation seller { isVerified } } }`;
const REMOVE_EVENT = gql`mutation RemoveSavedEvent($id: ID!) { cancelRsvp(eventId: $id) }`;
const REMOVE_JOB = gql`mutation RemoveSavedJob($id: ID!) { unsaveJob(id: $id) }`;
const REMOVE_MARKETPLACE = gql`mutation RemoveSavedMarketplace($id: ID!) { unsaveMarketplaceItem(id: $id) }`;

interface SavedData {
  myRsvps: Array<{ id: string; event: { id: string; title: string; description: string; category: string; date: string; region: string; rsvpCount: number; imageUrls: string[]; hosts: Array<{ isVerified: boolean }> } }>;
  mySavedJobs: Array<{ id: string; title: string; roleType: string; workLocation: string; region: string; salaryRange?: { min: number; max: number; currency: string } | null; organisation: { name: string; isVerified: boolean } }>;
  mySavedMarketplaceItems: Array<{ id: string; title: string; description: string; price: number; currency: string; region: string; imageUrls: string[]; isDonation: boolean; seller: { isVerified: boolean } }>;
}
type Tab = 'ALL' | 'EVENTS' | 'JOBS' | 'MARKETPLACE';

export default function SavedItemsPage() {
  const { data, loading, error, refetch } = useQuery<SavedData>(SAVED_ITEMS, { fetchPolicy: 'cache-and-network' });
  const [tab, setTab] = React.useState<Tab>('ALL');
  const [removeEvent] = useMutation(REMOVE_EVENT); const [removeJob] = useMutation(REMOVE_JOB); const [removeMarketplace] = useMutation(REMOVE_MARKETPLACE);
  const events = data?.myRsvps ?? []; const jobs = data?.mySavedJobs ?? []; const marketplace = data?.mySavedMarketplaceItems ?? [];
  const total = events.length + jobs.length + marketplace.length;
  async function remove(kind: Tab, id: string) { if (kind === 'EVENTS') await removeEvent({ variables: { id } }); if (kind === 'JOBS') await removeJob({ variables: { id } }); if (kind === 'MARKETPLACE') await removeMarketplace({ variables: { id } }); await refetch(); }

  return <main className="mx-auto max-w-7xl px-5 pb-12 pt-28 md:px-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-gray-500"><Link to="/dashboard" className="hover:underline">Dashboard</Link> / Saved</p><h1 className="mt-2 font-serif text-4xl font-bold">Saved Items</h1><p className="mt-2 text-sm text-gray-500">Keep events, opportunities and community listings in one place.</p></div><span className="rounded-full bg-[#f3eee6] px-4 py-2 text-sm font-semibold">{total} saved</span></div>
    <div className="mt-8 flex gap-2 overflow-x-auto border-b border-gray-200 pb-3">{(['ALL','EVENTS','JOBS','MARKETPLACE'] as Tab[]).map((value) => <button key={value} onClick={() => setTab(value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${tab === value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>{value === 'ALL' ? 'All saved' : value.charAt(0) + value.slice(1).toLowerCase()}</button>)}</div>
    {loading && !data && <p className="py-20 text-center text-sm text-gray-500">Loading saved items...</p>}{error && <p className="py-20 text-center text-sm text-red-600">We couldn’t load your saved items. Please try again.</p>}
    {!loading && !error && total === 0 && <div className="my-10 rounded-3xl border border-dashed border-gray-300 px-6 py-20 text-center"><h2 className="font-serif text-2xl font-bold">Nothing saved yet</h2><p className="mt-2 text-sm text-gray-500">Use the save button on an event, job or marketplace listing.</p><Link to="/" className="mt-6 inline-block rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">Explore Christian Listings</Link></div>}
    {(tab === 'ALL' || tab === 'EVENTS') && events.length > 0 && <SavedSection title="Events">{events.map(({ event }) => <SavedCard key={event.id} onRemove={() => remove('EVENTS', event.id)}><EventCard title={event.title} description={event.description} badge={event.category.replaceAll('_',' ')} date={new Date(event.date).toLocaleDateString()} location={event.region} invites={`${event.rsvpCount} attending`} verified={event.hosts.some((host) => host.isVerified)} imageSrc={event.imageUrls[0] || '/assets/event-theology.png'} href={`/events/${event.id}`} /></SavedCard>)}</SavedSection>}
    {(tab === 'ALL' || tab === 'JOBS') && jobs.length > 0 && <SavedSection title="Jobs">{jobs.map((job) => <SavedCard key={job.id} onRemove={() => remove('JOBS', job.id)}><JobCard title={job.title} company={job.organisation.name} badge={job.roleType} employmentType={`${job.roleType} · ${job.workLocation}`} location={job.region} salaryRange={job.salaryRange ? `${formatPrice(job.salaryRange.min, job.salaryRange.currency)} – ${formatPrice(job.salaryRange.max, job.salaryRange.currency)}` : undefined} verified={job.organisation.isVerified} href={`/jobs/${job.id}`} /></SavedCard>)}</SavedSection>}
    {(tab === 'ALL' || tab === 'MARKETPLACE') && marketplace.length > 0 && <SavedSection title="Marketplace">{marketplace.map((item) => <SavedCard key={item.id} onRemove={() => remove('MARKETPLACE', item.id)}><MarketplaceCard title={item.title} description={item.description} badge={item.isDonation ? 'COMMUNITY GIFT' : 'FOR SALE'} price={item.isDonation ? 'Free' : formatPrice(item.price, item.currency)} location={item.region} imageSrc={item.imageUrls[0] || '/assets/car-ford.png'} verified={item.seller.isVerified} href={`/marketplace/${item.id}`} /></SavedCard>)}</SavedSection>}
  </main>;
}
function SavedSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-10"><h2 className="mb-5 font-serif text-2xl font-bold">{title}</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{children}</div></section>; }
function SavedCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) { return <div className="relative"><button type="button" onClick={onRemove} aria-label="Remove saved item" className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-[#7a315f] shadow-md hover:bg-red-50">♥</button>{children}</div>; }
