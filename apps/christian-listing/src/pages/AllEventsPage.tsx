import { gql, NetworkStatus, useQuery } from '@apollo/client';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventCard from '../components/cards/EventCard';
import FAQSection from '../components/sections/FAQSection';
import OrgCTASection from '../components/sections/OrgCTASection';
import { usePreferredRegion } from '../lib/discovery';
import DirectoryFilters from '../components/ui/DirectoryFilters';
import DirectoryState from '../components/ui/DirectoryState';
import LoadMoreButton from '../components/ui/LoadMoreButton';

const ALL_EVENTS = gql`
  query AllEventsDirectory(
    $region: String
    $search: String
    $category: EventCategory
    $dateFrom: DateTime
    $locationType: LocationType
    $ticketed: Boolean
    $sort: EventSort
    $limit: Int
    $after: String
  ) {
    events(
      region: $region
      search: $search
      category: $category
      status: PUBLISHED
      dateFrom: $dateFrom
      locationType: $locationType
      ticketed: $ticketed
      sort: $sort
      limit: $limit
      after: $after
    ) {
      edges {
        id
        title
        description
        category
        date
        region
        rsvpCount
        imageUrls
        isPromoted
        location {
          type
          city
          country
        }
      }
      hasNextPage
      endCursor
    }
  }
`;

interface DirectoryEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  region: string;
  rsvpCount: number;
  imageUrls: string[];
  isPromoted: boolean;
  location: { type: string; city?: string | null; country?: string | null };
}
interface DirectoryData {
  events: { edges: DirectoryEvent[]; hasNextPage: boolean; endCursor?: string | null };
}
const CATEGORIES = [
  'WORSHIP',
  'BIBLE_STUDY',
  'MUSIC',
  'CULTURAL',
  'COMMUNITY',
  'CONFERENCE',
  'CHARITY',
  'YOUTH',
] as const;
const SORTS = [
  ['POPULAR', 'Trending'],
  ['NEWEST', 'Newly Added'],
  ['DATE_ASC', 'Soonest'],
] as const;

export default function AllEventsPage() {
  const { region: preferredRegion } = usePreferredRegion();
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get('category') || '');
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState(preferredRegion);
  const [dateFrom, setDateFrom] = useState('');
  const [locationType, setLocationType] = useState('');
  const [ticketed, setTicketed] = useState<'' | 'true' | 'false'>('');
  const [sort, setSort] = useState('POPULAR');
  const variables = {
    region: region || null,
    search: search || null,
    category: category || null,
    dateFrom: dateFrom ? new Date(`${dateFrom}T00:00:00`).toISOString() : null,
    locationType: locationType || null,
    ticketed: ticketed === '' ? null : ticketed === 'true',
    sort,
    limit: 12,
    after: null,
  };
  const { data, loading, error, fetchMore, networkStatus } = useQuery<DirectoryData>(ALL_EVENTS, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });
  const clear = () => {
    setCategory('');
    setSearch('');
    setRegion(preferredRegion);
    setDateFrom('');
    setLocationType('');
    setTicketed('');
    setSort('POPULAR');
  };
  const loadMore = () =>
    fetchMore({
      variables: { ...variables, after: data?.events.endCursor },
      updateQuery: (previous, { fetchMoreResult }) =>
        fetchMoreResult
          ? {
              events: {
                ...fetchMoreResult.events,
                edges: [
                  ...previous.events.edges,
                  ...fetchMoreResult.events.edges.filter(
                    (next) => !previous.events.edges.some((current) => current.id === next.id),
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
                Events › <strong className="text-black">All Events</strong>
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold">All Events</h1>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search events…"
              className="w-full rounded-full bg-[#f3e8f4] px-5 py-3 text-sm outline-none sm:w-80"
            />
          </div>
          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <DirectoryFilters>
              <Filter title="Categories">
                {CATEGORIES.map((value) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="radio"
                      name="category"
                      checked={category === value}
                      onChange={() => setCategory(value)}
                    />
                    {value.replaceAll('_', ' ')}
                  </label>
                ))}
              </Filter>
              <Filter title="Type">
                <label className="flex gap-2 text-sm">
                  <input
                    type="radio"
                    name="type"
                    checked={ticketed === 'false'}
                    onChange={() => {
                      setTicketed('false');
                      setLocationType('');
                    }}
                  />
                  Free
                </label>
                <label className="flex gap-2 text-sm">
                  <input
                    type="radio"
                    name="type"
                    checked={ticketed === 'true'}
                    onChange={() => {
                      setTicketed('true');
                      setLocationType('');
                    }}
                  />
                  Ticketed
                </label>
                <label className="flex gap-2 text-sm">
                  <input
                    type="radio"
                    name="type"
                    checked={locationType === 'VIRTUAL'}
                    onChange={() => {
                      setLocationType('VIRTUAL');
                      setTicketed('');
                    }}
                  />
                  Online
                </label>
              </Filter>
              <Filter title="Date">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="w-full rounded-lg bg-[#f3e8f4] px-3 py-2 text-sm"
                />
              </Filter>
              <Filter title="Location">
                <input
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  placeholder="City or country"
                  className="w-full rounded-lg bg-[#f3e8f4] px-3 py-2 text-sm"
                />
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
                    className={`shrink-0 rounded-full px-5 py-2 text-sm ${sort === value ? 'bg-[#a84eaa] text-white' : 'bg-[#f6dafa]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {error ? (
                <DirectoryState kind="error" title="Events could not be loaded" detail="Check your connection and try again." />
              ) : loading && !data ? (
                <DirectoryState kind="loading" />
              ) : data?.events.edges.length === 0 ? (
                <DirectoryState kind="empty" title="No matching events" detail="Try changing your date, category, or region filters." />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {data?.events.edges.map((event) => (
                    <EventCard
                      key={event.id}
                      badge={event.category.replaceAll('_', ' ')}
                      date={new Date(event.date).toLocaleDateString(undefined, {
                        day: '2-digit',
                        month: 'short',
                      })}
                      title={event.title}
                      description={event.description}
                      location={
                        [event.location.city, event.location.country].filter(Boolean).join(', ') ||
                        event.region
                      }
                      invites={`${event.rsvpCount} RSVPs`}
                      imageSrc={event.imageUrls[0] || '/assets/event-theology.png'}
                      href={`/events/${event.id}`}
                      className="h-[330px]"
                    />
                  ))}
                </div>
              )}
              <LoadMoreButton hasMore={data?.events.hasNextPage} loading={networkStatus === NetworkStatus.fetchMore} label="Load more events" onClick={loadMore} />
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
      <legend className="mb-3 w-full rounded-lg bg-[#e8d1e8] px-3 py-2 text-sm font-semibold">
        {title}
      </legend>
      <div className="space-y-2 px-2">{children}</div>
    </fieldset>
  );
}
