import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../layout/icons';
import EventCard from '../cards/EventCard';
import JobCard from '../cards/JobCard';
import MarketplaceCard from '../cards/MarketplaceCard';
import { formatPrice } from '../../lib/discovery';
import { HomepageEvent, HomepageJob, HomepageListing, SpotlightSet } from '../../lib/homepage-selection';

const TABS = ['Trending', 'Featured'] as const;
type Tab = (typeof TABS)[number];

interface SpotlightSectionProps {
  content?: { trending: SpotlightSet; featured: SpotlightSet } | null;
  loading: boolean;
  error?: Error;
  region?: string;
}

function eventLocation(event: HomepageEvent) {
  return [event.location.city, event.location.country].filter(Boolean).join(', ') || event.region;
}

function eventDate(event: HomepageEvent) {
  return new Date(event.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function eventTime(event: HomepageEvent) {
  const start = new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (!event.endDate) return start;
  const end = new Date(event.endDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${start} – ${end}`;
}

function EventSpotlightCard({ event, className = '' }: { event: HomepageEvent; className?: string }) {
  return <EventCard badge={event.isPromoted ? 'FEATURED EVENT' : event.category.replaceAll('_', ' ')} date={eventDate(event)} title={event.title} description={event.description} location={eventLocation(event)} time={eventTime(event)} invites={`${event.rsvpCount} RSVPs`} verified={event.hosts.some((host) => host.isVerified)} imageSrc={event.imageUrls[0] || '/assets/event-theology.png'} href={`/events/${event.id}`} className={className} />;
}

function JobSpotlightCard({ job, className = '' }: { job: HomepageJob; className?: string }) {
  return <JobCard badge={job.isPromoted ? 'FEATURED JOB' : job.roleType.replaceAll('_', ' ')} badgeColor={job.isPromoted ? 'purple' : 'blue'} title={job.title} company={job.organisation.name} salaryRange={job.salaryRange ? `${formatPrice(job.salaryRange.min, job.salaryRange.currency)} – ${formatPrice(job.salaryRange.max, job.salaryRange.currency)}` : undefined} employmentType={`${job.roleType.replaceAll('_', ' ')} · ${job.workLocation.replaceAll('_', ' ')}`} location={job.region} verified={job.organisation.isVerified} href={`/jobs/${job.id}`} className={className} />;
}

function ListingSpotlightCard({ listing, className = '' }: { listing: HomepageListing; className?: string }) {
  return <MarketplaceCard badge={listing.isDonation ? 'COMMUNITY GIVES' : listing.isPromoted ? 'FEATURED' : listing.condition.replaceAll('_', ' ')} title={listing.title} description={listing.description} price={listing.isDonation ? 'Free donation' : formatPrice(listing.price, listing.currency)} location={listing.area || listing.region} imageSrc={listing.imageUrls[0]} href={`/marketplace/${listing.id}`} className={className} />;
}

function ScriptureCard({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-2xl bg-[#1A1A1A] ${className}`}>
      <img src="/assets/spotlight-ad.jpg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center opacity-50" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full flex-col justify-end gap-4 p-5">
        <p className="font-serif text-lg leading-snug text-white">“A generous person will prosper; whoever refreshes others will be refreshed.”</p>
        <Link to="/events" className="flex self-start items-center gap-1 rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:text-white">Explore the community <ArrowRightIcon className="h-3.5 w-3.5" /></Link>
      </div>
    </div>
  );
}

export default function SpotlightSection({ content, loading, error, region }: SpotlightSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Trending');
  const selected = activeTab === 'Featured' ? content?.featured : content?.trending;
  const hasContent = Boolean(selected?.events.length || selected?.jobs.length || selected?.listings.length);

  return (
    <section className="w-full bg-white px-6 py-16 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><p className="mb-1 font-display text-xs font-semibold uppercase tracking-widest text-gray-400">Curated Highlights</p><h2 className="font-serif text-3xl font-bold text-dark md:text-4xl">The Spotlight</h2>{region && <p className="mt-1 text-xs text-gray-400">Prioritising highlights near {region}</p>}</div>
        <div className="flex items-center gap-1 self-center rounded-full bg-gray-100 p-1">{TABS.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeTab === tab ? 'bg-dark text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>{tab}</button>)}</div>
      </div>

      {loading && !content && <div className="grid gap-4 md:grid-cols-3"><div className="h-[360px] animate-pulse rounded-2xl bg-gray-100 md:col-span-2" /><div className="h-[360px] animate-pulse rounded-2xl bg-gray-100" /></div>}
      {error && !content && <p className="text-sm text-red-600">Spotlight content is temporarily unavailable.</p>}
      {!loading && !error && !hasContent && <p className="text-sm text-gray-500">No current highlights are available.</p>}

      {selected && hasContent && <div className="flex flex-col gap-4">
        <div className="grid min-h-[360px] gap-4 lg:grid-cols-[5fr_3fr_3fr]">
          {selected.events[0] && <EventSpotlightCard event={selected.events[0]} className="h-full" />}
          {selected.jobs[0] && <JobSpotlightCard job={selected.jobs[0]} className="h-full" />}
          {selected.listings[0] && <ListingSpotlightCard listing={selected.listings[0]} className="h-full" />}
        </div>
        <div className="grid min-h-[360px] gap-4 lg:grid-cols-[4fr_4fr_3fr]">
          {selected.events[1] && <EventSpotlightCard event={selected.events[1]} className="h-full" />}
          <ScriptureCard className="h-full min-h-[320px]" />
          {selected.jobs[1] ? <JobSpotlightCard job={selected.jobs[1]} className="h-full" /> : selected.listings[1] ? <ListingSpotlightCard listing={selected.listings[1]} className="h-full" /> : null}
        </div>
      </div>}
    </section>
  );
}
