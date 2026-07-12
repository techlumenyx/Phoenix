import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export const DISCOVERY_QUERY = gql`
  query Discovery($region: String, $search: String, $limit: Int) {
    events(region: $region, search: $search, status: PUBLISHED, limit: $limit) {
      edges { id title description category date region rsvpCount imageUrls location { city country type } }
    }
    jobListings(region: $region, search: $search, status: ACTIVE, limit: $limit) {
      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } organisation { id name isVerified } }
    }
    marketplaceItems(region: $region, search: $search, status: AVAILABLE, limit: $limit) {
      edges { id title description price currency condition region area imageUrls isDonation seller { id isVerified } }
    }
    organisations(region: $region, search: $search, limit: $limit) {
      edges { id name description region logoUrl isVerified }
    }
  }
`;

export interface DiscoveryData {
  events: { edges: Array<{ id: string; title: string; description: string; category: string; date: string; region: string; rsvpCount: number; imageUrls: string[]; location: { city?: string | null; country?: string | null; type: string } }> };
  jobListings: { edges: Array<{ id: string; title: string; roleType: string; workLocation: string; region: string; skillsRequired: string[]; salaryRange?: { min: number; max: number; currency: string } | null; organisation: { id: string; name: string; isVerified: boolean } }> };
  marketplaceItems: { edges: Array<{ id: string; title: string; description: string; price: number; currency: string; condition: string; region: string; area?: string | null; imageUrls: string[]; isDonation: boolean; seller: { id: string; isVerified: boolean } }> };
  organisations: { edges: Array<{ id: string; name: string; description?: string | null; region?: string | null; logoUrl?: string | null; isVerified: boolean }> };
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
  return useQuery<DiscoveryData>(DISCOVERY_QUERY, {
    variables: { region: region || null, search: search.trim() || null, limit },
    skip,
    fetchPolicy: 'cache-and-network',
  });
}

export function formatPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
}
