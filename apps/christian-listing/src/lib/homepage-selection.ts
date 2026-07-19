export interface HomepageEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  endDate?: string | null;
  region: string;
  rsvpCount: number;
  imageUrls: string[];
  isPromoted: boolean;
  location: { type: string; city?: string | null; country?: string | null };
  hosts: Array<{ id: string; name: string; isVerified: boolean }>;
}

export interface HomepageJob {
  id: string;
  title: string;
  roleType: string;
  workLocation: string;
  region: string;
  salaryRange?: { min: number; max: number; currency: string } | null;
  isPromoted: boolean;
  organisation: { id: string; name: string; isVerified: boolean };
}

export interface HomepageListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  region: string;
  area?: string | null;
  imageUrls: string[];
  isDonation: boolean;
  isPromoted: boolean;
}

interface Connection<T> { edges: T[] }

export interface HomepageQueryData {
  regionalFeaturedEvents?: HomepageEvent[];
  globalFeaturedEvents?: HomepageEvent[];
  regionalWeeklyEvents?: Connection<HomepageEvent>;
  globalWeeklyEvents?: Connection<HomepageEvent>;
  regionalUpcomingEvents?: Connection<HomepageEvent>;
  globalUpcomingEvents?: Connection<HomepageEvent>;
  regionalJobs?: Connection<HomepageJob>;
  globalJobs?: Connection<HomepageJob>;
  regionalListings?: Connection<HomepageListing>;
  globalListings?: Connection<HomepageListing>;
}

export interface SpotlightSet {
  events: HomepageEvent[];
  jobs: HomepageJob[];
  listings: HomepageListing[];
}

export interface HomepageContent {
  spotlight: { trending: SpotlightSet; featured: SpotlightSet };
  glanceEvents: HomepageEvent[];
}

export function mergeUniqueById<T extends { id: string }>(...groups: Array<ReadonlyArray<T> | undefined>): T[] {
  const seen = new Set<string>();
  return groups.flatMap((group) => group ?? []).filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function preferImages<T extends { imageUrls: string[] }>(items: T[]): T[] {
  return [...items.filter((item) => item.imageUrls.length > 0), ...items.filter((item) => item.imageUrls.length === 0)];
}

export function selectHomepageContent(data: HomepageQueryData, now = new Date()): HomepageContent {
  const isUpcoming = (event: HomepageEvent) => new Date(event.date).getTime() >= now.getTime();
  const weeklyEvents = preferImages(mergeUniqueById(data.regionalWeeklyEvents?.edges, data.globalWeeklyEvents?.edges).filter(isUpcoming));
  const upcomingEvents = preferImages(mergeUniqueById(data.regionalUpcomingEvents?.edges, data.globalUpcomingEvents?.edges).filter(isUpcoming));
  const trendingEvents = mergeUniqueById(weeklyEvents, upcomingEvents);
  const promotedEvents = preferImages(mergeUniqueById(data.regionalFeaturedEvents, data.globalFeaturedEvents).filter(isUpcoming));
  const featuredEvents = mergeUniqueById(promotedEvents, trendingEvents);

  const jobs = mergeUniqueById(data.regionalJobs?.edges, data.globalJobs?.edges);
  const listings = preferImages(mergeUniqueById(data.regionalListings?.edges, data.globalListings?.edges));
  const promotedJobs = jobs.filter((job) => job.isPromoted);
  const promotedListings = listings.filter((listing) => listing.isPromoted);

  const trending: SpotlightSet = {
    events: trendingEvents.slice(0, 2),
    jobs: jobs.slice(0, 2),
    listings: listings.slice(0, 2),
  };
  const featured: SpotlightSet = {
    events: mergeUniqueById(promotedEvents, featuredEvents).slice(0, 2),
    jobs: mergeUniqueById(promotedJobs, jobs).slice(0, 2),
    listings: mergeUniqueById(promotedListings, listings).slice(0, 2),
  };

  const reservedEventIds = new Set([...trending.events, ...featured.events].map((event) => event.id));
  const glanceEvents = mergeUniqueById(weeklyEvents, upcomingEvents)
    .filter((event) => !reservedEventIds.has(event.id))
    .slice(0, 2);

  return { spotlight: { trending, featured }, glanceEvents };
}
