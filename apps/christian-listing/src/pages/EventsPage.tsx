import { gql, useQuery } from '@apollo/client';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/cards/EventCard';
import { ArrowRightIcon, SearchIcon } from '../components/layout/icons';
import { usePreferredRegion } from '../lib/discovery';
import { useAuthStore } from '../store/authStore';

const EVENTS_HOME = gql`
  query EventsHome($region: String, $search: String, $dateFrom: DateTime) {
    trending: events(region: $region, search: $search, status: PUBLISHED, dateFrom: $dateFrom, sort: POPULAR, limit: 6, collapseSeries: true) { edges { ...HomeEvent } }
    upcoming: events(region: $region, search: $search, status: PUBLISHED, dateFrom: $dateFrom, sort: DATE_ASC, limit: 20, collapseSeries: true) { edges { ...HomeEvent } }
  }
  fragment HomeEvent on Event {
    id title description category date region rsvpCount imageUrls isPromoted
    location { type city country }
  }
`;

interface HomeEvent { id: string; title: string; description: string; category: string; date: string; region: string; rsvpCount: number; imageUrls: string[]; isPromoted: boolean; location: { type: string; city?: string | null; country?: string | null } }
interface HomeData { trending: { edges: HomeEvent[] }; upcoming: { edges: HomeEvent[] } }

const CATEGORIES = [
  ['WORSHIP', 'Study / Worship', '🙏'], ['MUSIC', 'Music', '♫'], ['COMMUNITY', 'Community', '♧'], ['CULTURAL', 'Culture', '◇'],
  ['CHARITY', 'Charity', '♡'], ['CONFERENCE', 'Conferences', '⌁'], ['YOUTH', 'Family & Youth', '☆'], ['BIBLE_STUDY', 'Bible Study', '✦'],
] as const;

const EMPTY_PREFERENCES: string[] = [];

export default function EventsPage() {
  const { region } = usePreferredRegion();
  const preferences = useAuthStore((state) => state.dbUser?.preferences ?? EMPTY_PREFERENCES);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const dateFrom = useMemo(() => new Date().toISOString(), []);
  const { data, loading, error } = useQuery<HomeData>(EVENTS_HOME, { variables: { region: region || null, search: search || null, dateFrom }, fetchPolicy: 'cache-and-network' });
  const upcoming = data?.upcoming.edges ?? [];
  const submit = (event: FormEvent) => { event.preventDefault(); setSearch(input.trim()); };
  const interestEvents = useMemo(() => {
    const categories = preferences.flatMap((preference) => preference.includes('Worship') ? ['WORSHIP', 'BIBLE_STUDY'] : preference.includes('Music') ? ['MUSIC'] : preference.includes('Charity') ? ['CHARITY', 'WELFARE'] : preference.includes('Youth') ? ['YOUTH'] : preference.includes('Conference') ? ['CONFERENCE'] : []);
    const matched = upcoming.filter((event) => categories.includes(event.category));
    return (matched.length ? matched : upcoming).slice(0, 4);
  }, [preferences, upcoming]);

  return <>
    <section className="relative flex min-h-[440px] items-center justify-center overflow-hidden bg-[#28241e] px-6 text-center">
      <img src="/assets/org-cta.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-white/15" />
      <div className="relative z-10 w-full max-w-2xl"><h1 className="font-serif text-4xl font-bold text-white md:text-5xl">Find Events that<br />you&apos;re looking for</h1><form onSubmit={submit} className="mx-auto mt-7 flex max-w-xl items-center overflow-hidden rounded-full bg-white shadow-lg"><SearchIcon className="ml-4 h-5 w-5 text-gray-400" /><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search events, ministries or locations…" className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" /><button className="m-1 rounded-full bg-[#1b1b1b] px-6 py-2.5 text-sm font-semibold text-white">Search</button></form>{region && <p className="mt-3 text-xs text-white/70">Showing events near {region}</p>}</div>
    </section>

    {error && <p className="px-6 py-10 text-center text-red-700">Events are temporarily unavailable.</p>}
    <EventSection title="Trending Events" events={data?.trending.edges ?? []} loading={loading} featured />
    <EventSection title="Based on your Interests" events={interestEvents} loading={loading} />

    <section className="bg-white px-6 py-12 md:px-10 lg:px-16"><h2 className="mb-6 font-serif text-3xl font-bold">Based on your Interests</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{CATEGORIES.map(([value, label, icon]) => <Link key={value} to={`/events/all?category=${value}`} className="relative flex h-28 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-[#20162a] to-[#785a75] p-4 text-left text-white transition hover:scale-[1.02]"><span className="absolute right-4 top-3 text-3xl">{icon}</span><strong className="text-sm">{label}</strong></Link>)}</div></section>

    <EventSection title="Religion & Theology" events={upcoming.filter((event) => ['WORSHIP', 'BIBLE_STUDY', 'CONFERENCE'].includes(event.category)).slice(0, 4)} loading={loading} />
    <section className="relative overflow-hidden bg-[#272018] px-6 py-14 text-center text-white"><img src="/assets/org-cta.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /><div className="relative"><p className="font-serif text-xl italic">“Let us be grateful for a space and hands to the Lord.<br />And He will repay him for his good deed.”</p><Link to="/events/all" className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-xs font-semibold text-black">View all events</Link></div></section>
    <EventSection title="Community & Fellowship" events={upcoming.filter((event) => ['COMMUNITY', 'YOUTH', 'CULTURAL'].includes(event.category)).slice(0, 4)} loading={loading} />
    <EventSection title="All Events" events={upcoming.slice(0, 12)} loading={loading} viewAll />
  </>;
}

function EventSection({ title, events, loading, featured = false, viewAll = false }: { title: string; events: HomeEvent[]; loading: boolean; featured?: boolean; viewAll?: boolean }) {
  return <section className="bg-white px-6 py-12 md:px-10 lg:px-16"><div className="mb-6 flex items-end justify-between"><h2 className="font-serif text-3xl font-bold">{title}</h2><Link to="/events/all" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500">View all <ArrowRightIcon className="h-3.5 w-3.5 -rotate-45" /></Link></div>{loading && events.length === 0 ? <p className="text-sm text-gray-500">Loading events…</p> : events.length === 0 ? <p className="text-sm text-gray-500">No matching events found.</p> : <div className={`grid gap-4 ${featured ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>{events.map((event) => <EventTile key={event.id} event={event} />)}</div>}{viewAll && events.length > 0 && <div className="mt-8 text-center"><Link to="/events/all" className="rounded-full border px-8 py-3 text-sm">Browse all events</Link></div>}</section>;
}

function EventTile({ event }: { event: HomeEvent }) { return <EventCard badge={event.category.replaceAll('_', ' ')} date={new Date(event.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} title={event.title} description={event.description} location={[event.location.city, event.location.country].filter(Boolean).join(', ') || event.region} invites={`${event.rsvpCount} RSVPs`} imageSrc={event.imageUrls[0] || '/assets/event-theology.png'} href={`/events/${event.id}`} className="h-[310px]" />; }
