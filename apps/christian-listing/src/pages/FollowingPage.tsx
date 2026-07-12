import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import EventCard from '../components/cards/EventCard';
import JobCard from '../components/cards/JobCard';
import MarketplaceCard from '../components/cards/MarketplaceCard';
import { formatPrice } from '../lib/discovery';
import type { ReactNode } from 'react';

const FOLLOWING = gql`
  query MyFollowingHub {
    myFollowingOrganisations {
      id name description logoUrl region isVerified followerCount
      events(limit: 4) { edges { id title description category date region rsvpCount imageUrls status } }
      jobListings { id title roleType workLocation region salaryRange { min max currency } status }
      marketplaceListings { id title description price currency region imageUrls status isDonation }
    }
  }
`;

interface FollowedOrg { id: string; name: string; description?: string | null; logoUrl?: string | null; region?: string | null; isVerified: boolean; followerCount: number;
  events: { edges: Array<{ id: string; title: string; description: string; category: string; date: string; region: string; rsvpCount: number; imageUrls: string[]; status: string }> };
  jobListings: Array<{ id: string; title: string; roleType: string; workLocation: string; region: string; salaryRange?: { min: number; max: number; currency: string } | null; status: string }>;
  marketplaceListings: Array<{ id: string; title: string; description: string; price: number; currency: string; region: string; imageUrls: string[]; status: string; isDonation: boolean }>;
}

export default function FollowingPage() {
  const { data, loading, error } = useQuery<{ myFollowingOrganisations: FollowedOrg[] }>(FOLLOWING, { fetchPolicy: 'cache-and-network' });
  const organisations = data?.myFollowingOrganisations ?? [];
  const events = organisations.flatMap((org) => org.events.edges.filter((item) => item.status === 'PUBLISHED').map((item) => ({ ...item, org })));
  const jobs = organisations.flatMap((org) => org.jobListings.filter((item) => item.status === 'ACTIVE').map((item) => ({ ...item, org })));
  const listings = organisations.flatMap((org) => org.marketplaceListings.filter((item) => item.status === 'AVAILABLE').map((item) => ({ ...item, org })));

  return <main className="mx-auto max-w-7xl px-5 py-12 md:px-10"><p className="text-sm text-gray-500"><Link to="/dashboard">Dashboard</Link> / Following</p><h1 className="mt-2 font-serif text-4xl font-bold">Following</h1><p className="mt-2 text-sm text-gray-500">Latest activity from organisations you care about.</p>
    {loading && !data && <p className="py-20 text-center text-sm text-gray-500">Loading your community...</p>}{error && <p className="py-20 text-center text-sm text-red-600">{error.message}</p>}
    {!loading && !error && organisations.length === 0 && <div className="my-10 rounded-3xl border border-dashed border-gray-300 py-20 text-center"><h2 className="font-serif text-2xl font-bold">You are not following any organisations yet</h2><p className="mt-2 text-sm text-gray-500">Open an organisation profile and choose Follow Organisation.</p><Link to="/events/all" className="mt-6 inline-block rounded-full bg-black px-5 py-2.5 text-sm text-white">Discover organisations</Link></div>}
    {organisations.length > 0 && <section className="mt-10"><h2 className="font-serif text-2xl font-bold">Your organisations</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{organisations.map((org) => <Link to={`/organisations/${org.id}`} key={org.id} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md"><div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eee8dc] font-serif text-xl font-bold">{org.logoUrl ? <img src={org.logoUrl} alt="" className="h-full w-full object-cover"/> : org.name.charAt(0)}</div><div><h3 className="font-semibold">{org.name} {org.isVerified && <span className="text-green-600">✓</span>}</h3><p className="mt-1 text-xs text-gray-500">{org.region || 'Global community'} · {org.followerCount} followers</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">{org.description}</p></div></Link>)}</div></section>}
    <Feed title="Recent events">{events.slice(0, 8).map((event) => <EventCard key={event.id} title={event.title} description={event.description} badge={event.category} date={new Date(event.date).toLocaleDateString()} location={event.region} invites={`${event.rsvpCount} attending`} verified={event.org.isVerified} imageSrc={event.imageUrls[0] || '/assets/event-theology.png'} href={`/events/${event.id}`}/>)}</Feed>
    <Feed title="Job opportunities">{jobs.slice(0, 8).map((job) => <JobCard key={job.id} title={job.title} company={job.org.name} badge={job.roleType} employmentType={`${job.roleType} · ${job.workLocation}`} location={job.region} salaryRange={job.salaryRange ? `${formatPrice(job.salaryRange.min, job.salaryRange.currency)} – ${formatPrice(job.salaryRange.max, job.salaryRange.currency)}` : undefined} verified={job.org.isVerified} href={`/jobs/${job.id}`}/>)}</Feed>
    <Feed title="Marketplace activity">{listings.slice(0, 8).map((item) => <MarketplaceCard key={item.id} title={item.title} description={item.description} badge={item.isDonation ? 'COMMUNITY GIFT' : 'FOR SALE'} price={item.isDonation ? 'Free' : formatPrice(item.price, item.currency)} location={item.region} imageSrc={item.imageUrls[0] || '/assets/car-ford.png'} verified={item.org.isVerified} href={`/marketplace/${item.id}`}/>)}</Feed>
  </main>;
}
function Feed({ title, children }: { title: string; children: ReactNode }) { const count = Array.isArray(children) ? children.length : children ? 1 : 0; if (!count) return null; return <section className="mt-12"><h2 className="mb-5 font-serif text-2xl font-bold">{title}</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{children}</div></section>; }
