import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import EventCard from '../components/cards/EventCard';
import JobCard from '../components/cards/JobCard';
import MarketplaceCard from '../components/cards/MarketplaceCard';
import { SearchIcon } from '../components/layout/icons';
import LoadMoreButton from '../components/ui/LoadMoreButton';
import {
  DiscoveryData,
  GLOBAL_SEARCH_QUERY,
  formatPrice,
  usePreferredRegion,
} from '../lib/discovery';

type ResultType = 'all' | 'events' | 'jobs' | 'marketplace' | 'organisations';
type ConnectionKey = keyof DiscoveryData;

const PAGE_SIZE = 12;
const TYPE_TABS: Array<{ id: ResultType; label: string }> = [
  { id: 'all', label: 'All results' },
  { id: 'events', label: 'Events' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'organisations', label: 'Organisations' },
];

const EVENT_CATEGORIES = [
  ['WORSHIP_SERVICE', 'Worship service'],
  ['CONFERENCE', 'Conference'],
  ['COMMUNITY_OUTREACH', 'Community outreach'],
  ['YOUTH', 'Youth'],
  ['FUNDRAISER', 'Fundraiser'],
  ['OTHER', 'Other'],
];
const JOB_ROLE_TYPES = [
  ['PAID', 'Paid'],
  ['VOLUNTEER', 'Volunteer'],
  ['INTERNSHIP', 'Internship'],
];
const WORK_LOCATIONS = [
  ['PHYSICAL', 'On-site'],
  ['REMOTE', 'Remote'],
  ['HYBRID', 'Hybrid'],
];
const LISTING_CATEGORIES = [
  ['ELECTRONICS', 'Electronics'],
  ['CLOTHING', 'Clothing'],
  ['BOOKS', 'Books'],
  ['FURNITURE', 'Furniture'],
  ['FOOD', 'Food'],
  ['BABY_AND_KIDS', 'Baby & Kids'],
  ['CHARITY_ITEMS', 'Charity items'],
  ['OTHER', 'Other'],
];
const ITEM_CONDITIONS = [
  ['NEW', 'New'],
  ['LIKE_NEW', 'Like new'],
  ['GOOD', 'Good'],
  ['FAIR', 'Fair'],
];

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function eventDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-[170px] text-xs font-bold uppercase tracking-wide text-gray-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-gray-700 outline-none focus:border-[#C9A96E]"
      >
        <option value="">All</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultSection({
  title,
  count,
  hasMore,
  loadingMore,
  onLoadMore,
  children,
}: {
  title: string;
  count: number;
  hasMore?: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  children: ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="mb-14">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-gray-200 pb-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1B1B1B]">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {count} result{count === 1 ? '' : 's'} loaded
          </p>
        </div>
      </div>
      {children}
      <LoadMoreButton
        hasMore={hasMore}
        loading={loadingMore}
        label={`Load more ${title.toLowerCase()}`}
        onClick={onLoadMore}
      />
    </section>
  );
}

export default function GlobalSearchPage() {
  const [params, setParams] = useSearchParams();
  const { region: preferredRegion } = usePreferredRegion();
  const query = params.get('q')?.trim() ?? '';
  const rawType = params.get('type') ?? 'all';
  const type: ResultType = TYPE_TABS.some((tab) => tab.id === rawType)
    ? (rawType as ResultType)
    : 'all';
  const region = params.get('region') ?? preferredRegion;
  const [input, setInput] = useState(query);
  const [loadingMore, setLoadingMore] = useState<ConnectionKey | null>(null);

  useEffect(() => setInput(query), [query]);

  const variables = useMemo(
    () => ({
      region: region || null,
      search: query || null,
      limit: PAGE_SIZE,
      eventCategory: params.get('eventCategory') || null,
      eventDateFrom: params.get('dateFrom')
        ? new Date(`${params.get('dateFrom')}T00:00:00`).toISOString()
        : null,
      jobRoleType: params.get('roleType') || null,
      jobWorkLocation: params.get('workLocation') || null,
      listingCategory: params.get('listingCategory') || null,
      listingCondition: params.get('condition') || null,
      eventAfter: null,
      jobAfter: null,
      listingAfter: null,
      organisationAfter: null,
    }),
    [params, query, region],
  );

  const { data, loading, error, refetch, fetchMore } = useQuery<DiscoveryData>(
    GLOBAL_SEARCH_QUERY,
    {
      variables,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setParam('q', input.trim());
  }

  function clearFilters() {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (type !== 'all') next.set('type', type);
    setParams(next);
  }

  const afterVariable: Record<ConnectionKey, string> = {
    events: 'eventAfter',
    jobListings: 'jobAfter',
    marketplaceItems: 'listingAfter',
    organisations: 'organisationAfter',
  };

  async function loadMore(key: ConnectionKey) {
    const cursor = data?.[key].endCursor;
    if (!cursor) return;
    setLoadingMore(key);
    try {
      await fetchMore({
        variables: { ...variables, [afterVariable[key]]: cursor },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous;
          return {
            ...previous,
            [key]: {
              ...fetchMoreResult[key],
              edges: [...previous[key].edges, ...fetchMoreResult[key].edges],
            },
          } as DiscoveryData;
        },
      });
    } finally {
      setLoadingMore(null);
    }
  }

  const events = data?.events.edges ?? [];
  const jobs = data?.jobListings.edges ?? [];
  const listings = data?.marketplaceItems.edges ?? [];
  const organisations = data?.organisations.edges ?? [];
  const totalLoaded = events.length + jobs.length + listings.length + organisations.length;
  const visibleCount =
    type === 'events'
      ? events.length
      : type === 'jobs'
        ? jobs.length
        : type === 'marketplace'
          ? listings.length
          : type === 'organisations'
            ? organisations.length
            : totalLoaded;

  return (
    <main className="min-h-screen bg-[#FCFBF8]">
      <section className="border-b border-[#eadfc9] bg-[#F8F0E1] px-5 py-12 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B6E3F]">
            Christian Listings discovery
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-[#1B1B1B] md:text-5xl">
            Search the whole community
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Find events, opportunities, marketplace items, and trusted organisations from one place.
          </p>
          <form
            onSubmit={submit}
            className="mt-7 flex max-w-3xl items-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm"
          >
            <SearchIcon className="ml-5 h-5 w-5 shrink-0 text-gray-400" />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              autoFocus
              placeholder="Search events, jobs, listings or organisations…"
              className="min-w-0 flex-1 px-3 py-3.5 text-sm outline-none"
            />
            <button
              type="submit"
              className="m-1 rounded-full bg-[#1B1B1B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#333]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 lg:px-16">
        <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Search result types">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setParam('type', tab.id === 'all' ? '' : tab.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${type === tab.id ? 'bg-[#1B1B1B] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
          <label className="block min-w-[210px] flex-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Region
            <input
              value={region}
              onChange={(event) => setParam('region', event.target.value)}
              placeholder="All regions"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-gray-700 outline-none focus:border-[#C9A96E]"
            />
          </label>
          {(type === 'all' || type === 'events') && (
            <>
              <SelectFilter
                label="Event category"
                value={params.get('eventCategory') ?? ''}
                options={EVENT_CATEGORIES}
                onChange={(value) => setParam('eventCategory', value)}
              />
              <label className="block min-w-[170px] text-xs font-bold uppercase tracking-wide text-gray-500">
                From date
                <input
                  type="date"
                  value={params.get('dateFrom') ?? ''}
                  onChange={(event) => setParam('dateFrom', event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-700"
                />
              </label>
            </>
          )}
          {(type === 'all' || type === 'jobs') && (
            <>
              <SelectFilter
                label="Job type"
                value={params.get('roleType') ?? ''}
                options={JOB_ROLE_TYPES}
                onChange={(value) => setParam('roleType', value)}
              />
              <SelectFilter
                label="Work style"
                value={params.get('workLocation') ?? ''}
                options={WORK_LOCATIONS}
                onChange={(value) => setParam('workLocation', value)}
              />
            </>
          )}
          {(type === 'all' || type === 'marketplace') && (
            <>
              <SelectFilter
                label="Listing category"
                value={params.get('listingCategory') ?? ''}
                options={LISTING_CATEGORIES}
                onChange={(value) => setParam('listingCategory', value)}
              />
              <SelectFilter
                label="Condition"
                value={params.get('condition') ?? ''}
                options={ITEM_CONDITIONS}
                onChange={(value) => setParam('condition', value)}
              />
            </>
          )}
          <button
            onClick={clearFilters}
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 underline underline-offset-4 hover:text-black"
          >
            Clear filters
          </button>
        </div>

        <div className="mb-8 mt-7 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            {loading && !data ? (
              'Searching…'
            ) : (
              <>
                <strong className="text-[#1B1B1B]">{visibleCount}</strong> result
                {visibleCount === 1 ? '' : 's'} loaded{query ? <> for “{query}”</> : ''}
                {region ? <> near {region}</> : ''}
              </>
            )}
          </p>
          {(query || region || params.size > 0) && (
            <Link to="/search" className="text-xs font-semibold text-gray-500 hover:text-black">
              Start a new search
            </Link>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            Search could not be loaded.{' '}
            <button onClick={() => refetch()} className="font-semibold underline">
              Try again
            </button>
          </div>
        )}
        {loading && !data && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        )}
        {!loading && !error && visibleCount === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="font-serif text-2xl font-bold">No matching results</p>
            <p className="mt-2 text-sm text-gray-500">
              Try a broader keyword, remove a filter, or search all regions.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 rounded-full bg-[#1B1B1B] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Clear filters
            </button>
          </div>
        )}

        {!error && (type === 'all' || type === 'events') && (
          <ResultSection
            title="Events"
            count={events.length}
            hasMore={data?.events.hasNextPage}
            loadingMore={loadingMore === 'events'}
            onLoadMore={() => loadMore('events')}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  description={event.description}
                  badge={titleCase(event.category)}
                  date={eventDate(event.date)}
                  location={event.region}
                  invites={`${event.rsvpCount} attending`}
                  imageSrc={event.imageUrls[0]}
                  href={`/events/${event.id}`}
                />
              ))}
            </div>
          </ResultSection>
        )}

        {!error && (type === 'all' || type === 'jobs') && (
          <ResultSection
            title="Jobs"
            count={jobs.length}
            hasMore={data?.jobListings.hasNextPage}
            loadingMore={loadingMore === 'jobListings'}
            onLoadMore={() => loadMore('jobListings')}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  title={job.title}
                  company={job.organisation.name}
                  verified={job.organisation.isVerified}
                  location={job.region}
                  employmentType={`${titleCase(job.roleType)} · ${titleCase(job.workLocation)}`}
                  salaryRange={
                    job.salaryRange
                      ? `${formatPrice(job.salaryRange.min, job.salaryRange.currency)}–${formatPrice(job.salaryRange.max, job.salaryRange.currency)}`
                      : undefined
                  }
                  href={`/jobs/${job.id}`}
                />
              ))}
            </div>
          </ResultSection>
        )}

        {!error && (type === 'all' || type === 'marketplace') && (
          <ResultSection
            title="Marketplace"
            count={listings.length}
            hasMore={data?.marketplaceItems.hasNextPage}
            loadingMore={loadingMore === 'marketplaceItems'}
            onLoadMore={() => loadMore('marketplaceItems')}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <MarketplaceCard
                  key={listing.id}
                  title={listing.title}
                  description={listing.description}
                  price={listing.isDonation ? 'Free' : formatPrice(listing.price, listing.currency)}
                  location={listing.region}
                  badge={listing.isDonation ? 'COMMUNITY GIVE' : titleCase(listing.condition)}
                  imageSrc={listing.imageUrls[0]}
                  verified={listing.seller?.isVerified ?? false}
                  href={`/marketplace/${listing.id}`}
                />
              ))}
            </div>
          </ResultSection>
        )}

        {!error && (type === 'all' || type === 'organisations') && (
          <ResultSection
            title="Organisations"
            count={organisations.length}
            hasMore={data?.organisations.hasNextPage}
            loadingMore={loadingMore === 'organisations'}
            onLoadMore={() => loadMore('organisations')}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {organisations.map((organisation) => (
                <Link
                  key={organisation.id}
                  to={`/organisations/${organisation.id}`}
                  className="group flex min-h-48 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {organisation.logoUrl ? (
                      <img
                        src={organisation.logoUrl}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F0E5CE] font-serif text-xl font-bold text-[#6F542B]">
                        {organisation.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-serif text-xl font-bold text-[#1B1B1B] group-hover:underline">
                        {organisation.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {organisation.region || 'Global'}{' '}
                        {organisation.isVerified && (
                          <span className="ml-1 text-green-700">● Verified</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                    {organisation.description ||
                      'View this organisation’s community events, opportunities, and listings.'}
                  </p>
                  <span className="mt-auto pt-4 text-xs font-semibold text-[#1B1B1B]">
                    View organisation →
                  </span>
                </Link>
              ))}
            </div>
          </ResultSection>
        )}
      </div>
    </main>
  );
}
