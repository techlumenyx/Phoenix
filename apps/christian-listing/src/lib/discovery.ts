import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { mergeUniqueById } from './homepage-selection';

export const DISCOVERY_QUERY = gql`
  query Discovery($region: String, $search: String, $limit: Int, $hasRegion: Boolean!) {
    regionalEvents: events(region: $region, search: $search, status: PUBLISHED, limit: $limit) @include(if: $hasRegion) {
      edges { id title description category date region rsvpCount imageUrls location { city country type } }
    }
    globalEvents: events(search: $search, status: PUBLISHED, limit: $limit) {
      edges { id title description category date region rsvpCount imageUrls location { city country type } }
    }
    regionalJobs: jobListings(region: $region, search: $search, status: ACTIVE, limit: $limit) @include(if: $hasRegion) {
      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } organisation { id name isVerified } }
    }
    globalJobs: jobListings(search: $search, status: ACTIVE, limit: $limit) {
      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } organisation { id name isVerified } }
    }
    regionalListings: marketplaceItems(region: $region, search: $search, status: AVAILABLE, limit: $limit) @include(if: $hasRegion) {
      edges { id title description price currency condition region area imageUrls isDonation }
    }
    globalListings: marketplaceItems(search: $search, status: AVAILABLE, limit: $limit) {
      edges { id title description price currency condition region area imageUrls isDonation }
    }
    regionalOrganisations: organisations(region: $region, search: $search, limit: $limit) @include(if: $hasRegion) {
      edges { id name description region logoUrl isVerified }
    }
    globalOrganisations: organisations(search: $search, limit: $limit) {
      edges { id name description region logoUrl isVerified }
    }
  }
`;

export const GLOBAL_SEARCH_QUERY = gql`
  query GlobalSearch(
    $region: String
    $search: String
    $limit: Int
    $eventAfter: String
    $eventCategory: EventCategory
    $eventDateFrom: DateTime
    $jobAfter: String
    $jobRoleType: RoleType
    $jobWorkLocation: WorkLocation
    $listingAfter: String
    $listingCategory: MarketplaceCategory
    $listingCondition: ItemCondition
    $organisationAfter: String
  ) {
    events(
      region: $region
      search: $search
      status: PUBLISHED
      category: $eventCategory
      dateFrom: $eventDateFrom
      sort: DATE_ASC
      limit: $limit
      after: $eventAfter
    ) {
      edges { id title description category date region rsvpCount imageUrls location { city country type } }
      hasNextPage
      endCursor
    }
    jobListings(
      region: $region
      search: $search
      status: ACTIVE
      roleType: $jobRoleType
      workLocation: $jobWorkLocation
      sort: NEWEST
      limit: $limit
      after: $jobAfter
    ) {
      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } organisation { id name isVerified } }
      hasNextPage
      endCursor
    }
    marketplaceItems(
      region: $region
      search: $search
      status: AVAILABLE
      category: $listingCategory
      condition: $listingCondition
      sort: NEWEST
      limit: $limit
      after: $listingAfter
    ) {
      edges { id title description price currency condition region area imageUrls isDonation seller { id isVerified } }
      hasNextPage
      endCursor
    }
    organisations(region: $region, search: $search, limit: $limit, after: $organisationAfter) {
      edges { id name description region logoUrl isVerified }
      hasNextPage
      endCursor
    }
  }
`;

export interface DiscoveryConnection<T> {
  edges: T[];
  hasNextPage?: boolean;
  endCursor?: string | null;
}

export interface DiscoveryData {
  events: DiscoveryConnection<{ id: string; title: string; description: string; category: string; date: string; region: string; rsvpCount: number; imageUrls: string[]; location: { city?: string | null; country?: string | null; type: string } }>;
  jobListings: DiscoveryConnection<{ id: string; title: string; roleType: string; workLocation: string; region: string; skillsRequired: string[]; salaryRange?: { min: number; max: number; currency: string } | null; organisation: { id: string; name: string; isVerified: boolean } }>;
  marketplaceItems: DiscoveryConnection<{ id: string; title: string; description: string; price: number; currency: string; condition: string; region: string; area?: string | null; imageUrls: string[]; isDonation: boolean; seller?: { id: string; isVerified: boolean } }>;
  organisations: DiscoveryConnection<{ id: string; name: string; description?: string | null; region?: string | null; logoUrl?: string | null; isVerified: boolean }>;
}

interface DiscoveryQueryData {
  regionalEvents?: DiscoveryData['events'];
  globalEvents: DiscoveryData['events'];
  regionalJobs?: DiscoveryData['jobListings'];
  globalJobs: DiscoveryData['jobListings'];
  regionalListings?: DiscoveryData['marketplaceItems'];
  globalListings: DiscoveryData['marketplaceItems'];
  regionalOrganisations?: DiscoveryData['organisations'];
  globalOrganisations: DiscoveryData['organisations'];
}

const REGION_KEY = 'cl-preferred-region';
export const REGION_EVENT = 'cl-region-changed';

export function usePreferredRegion() {
  const profileRegion = useAuthStore((state) => state.dbUser?.region);
  const [guestRegion, setGuestRegion] = useState(() => localStorage.getItem(REGION_KEY) ?? '');

  useEffect(() => {
    const update = () => setGuestRegion(localStorage.getItem(REGION_KEY) ?? '');
    window.addEventListener(REGION_EVENT, update);
    return () => window.removeEventListener(REGION_EVENT, update);
  }, []);

  const region = profileRegion || guestRegion;
  const setRegion = (value: string) => {
    localStorage.setItem(REGION_KEY, value);
    setGuestRegion(value);
    window.dispatchEvent(new Event(REGION_EVENT));
  };

  return { region, setRegion, isProfileRegion: Boolean(profileRegion) };
}

export function useDiscovery(search = '', limit = 4, skip = false) {
  const { region } = usePreferredRegion();
  const trimmedSearch = search.trim();
  const hasRegion = Boolean(region);
  const query = useQuery<DiscoveryQueryData>(DISCOVERY_QUERY, {
    variables: { region: region || null, search: trimmedSearch || null, limit, hasRegion },
    skip,
    fetchPolicy: 'cache-and-network',
  });
  const data = useMemo<DiscoveryData | undefined>(() => {
    if (!query.data) return undefined;
    const select = <T extends { id: string }>(regional: DiscoveryConnection<T> | undefined, global: DiscoveryConnection<T>): DiscoveryConnection<T> => ({
      edges: (trimmedSearch && hasRegion ? (regional?.edges ?? []) : mergeUniqueById(regional?.edges ?? [], global.edges)).slice(0, limit),
    });
    return {
      events: select(query.data.regionalEvents, query.data.globalEvents),
      jobListings: select(query.data.regionalJobs, query.data.globalJobs),
      marketplaceItems: select(query.data.regionalListings, query.data.globalListings),
      organisations: select(query.data.regionalOrganisations, query.data.globalOrganisations),
    };
  }, [hasRegion, limit, query.data, trimmedSearch]);

  return { ...query, data };
}

export function formatPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
}
