import { gql, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { usePreferredRegion } from './discovery';
import { HomepageQueryData, selectHomepageContent } from './homepage-selection';

const HOMEPAGE_CONTENT = gql`
  query HomepageContent($region: String, $hasRegion: Boolean!, $now: DateTime!, $weekEnd: DateTime!, $monthEnd: DateTime!) {
    regionalFeaturedEvents: featuredEvents(region: $region) @include(if: $hasRegion) { ...HomepageEvent }
    globalFeaturedEvents: featuredEvents { ...HomepageEvent }
    regionalWeeklyEvents: events(region: $region, status: PUBLISHED, dateFrom: $now, dateTo: $weekEnd, sort: POPULAR, limit: 10, collapseSeries: true) @include(if: $hasRegion) { edges { ...HomepageEvent } }
    globalWeeklyEvents: events(status: PUBLISHED, dateFrom: $now, dateTo: $weekEnd, sort: POPULAR, limit: 10, collapseSeries: true) { edges { ...HomepageEvent } }
    regionalUpcomingEvents: events(region: $region, status: PUBLISHED, dateFrom: $now, dateTo: $monthEnd, sort: DATE_ASC, limit: 12, collapseSeries: true) @include(if: $hasRegion) { edges { ...HomepageEvent } }
    globalUpcomingEvents: events(status: PUBLISHED, dateFrom: $now, dateTo: $monthEnd, sort: DATE_ASC, limit: 12, collapseSeries: true) { edges { ...HomepageEvent } }
    regionalJobs: jobListings(region: $region, status: ACTIVE, sort: POPULAR, limit: 6) @include(if: $hasRegion) { edges { ...HomepageJob } }
    globalJobs: jobListings(status: ACTIVE, sort: POPULAR, limit: 6) { edges { ...HomepageJob } }
    regionalListings: marketplaceItems(region: $region, status: AVAILABLE, sort: POPULAR, limit: 6) @include(if: $hasRegion) { edges { ...HomepageListing } }
    globalListings: marketplaceItems(status: AVAILABLE, sort: POPULAR, limit: 6) { edges { ...HomepageListing } }
  }

  fragment HomepageEvent on Event {
    id title description category date endDate region rsvpCount imageUrls isPromoted
    location { type city country }
    hosts { id name isVerified }
  }
  fragment HomepageJob on JobListing {
    id title roleType workLocation region isPromoted
    salaryRange { min max currency }
    organisation { id name isVerified }
  }
  fragment HomepageListing on MarketplaceItem {
    id title description price currency condition region area imageUrls isDonation isPromoted
  }
`;

function createDateWindow() {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const monthEnd = new Date(now);
  monthEnd.setDate(monthEnd.getDate() + 30);
  return { now, weekEnd, monthEnd };
}

export function useHomepageContent() {
  const { region } = usePreferredRegion();
  const dateWindow = useMemo(createDateWindow, []);
  const query = useQuery<HomepageQueryData>(HOMEPAGE_CONTENT, {
    variables: {
      region: region || null,
      hasRegion: Boolean(region),
      now: dateWindow.now.toISOString(),
      weekEnd: dateWindow.weekEnd.toISOString(),
      monthEnd: dateWindow.monthEnd.toISOString(),
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const content = useMemo(
    () => query.data ? selectHomepageContent(query.data, dateWindow.now) : null,
    [dateWindow.now, query.data],
  );

  return { ...query, content, region };
}
