import { gql, useMutation, useQuery } from '@apollo/client';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import EventCard from '../components/cards/EventCard';
import JobCard from '../components/cards/JobCard';
import MarketplaceCard from '../components/cards/MarketplaceCard';
import { useAuthStore } from '../store/authStore';

const ORGANISATION_PROFILE = gql`
  query PublicOrganisationProfile($id: ID!) {
    organisation(id: $id) {
      id name description logoUrl region isVerified verificationTier followerCount websiteUrl contactEmail phoneNumber createdAt
      socialLinks { whatsapp instagram facebook twitter website }
      events(limit: 8) { edges { id title description category date region rsvpCount imageUrls status } }
      jobListings { id title roleType workLocation region salaryRange { min max currency } status isPromoted }
      marketplaceListings { id title description price currency region imageUrls status isDonation isPromoted }
    }
    isFollowingOrganisation(organisationId: $id)
  }
`;
const FOLLOW_ORG = gql`mutation FollowPublicOrganisation($id: ID!) { followOrganisation(organisationId: $id) { id followerCount } }`;
const UNFOLLOW_ORG = gql`mutation UnfollowPublicOrganisation($id: ID!) { unfollowOrganisation(organisationId: $id) { id followerCount } }`;

interface OrganisationProfile {
  id: string; name: string; description?: string | null; logoUrl?: string | null; region?: string | null; isVerified: boolean;
  verificationTier: string; followerCount: number; websiteUrl?: string | null; contactEmail?: string | null; phoneNumber?: string | null; createdAt: string;
  socialLinks?: Record<string, string | null> | null;
  events: { edges: Array<{ id: string; title: string; description: string; category: string; date: string; region: string; rsvpCount: number; imageUrls: string[]; status: string }> };
  jobListings: Array<{ id: string; title: string; roleType: string; workLocation: string; region: string; salaryRange?: { min: number; max: number; currency: string } | null; status: string; isPromoted: boolean }>;
  marketplaceListings: Array<{ id: string; title: string; description: string; price: number; currency: string; region: string; imageUrls: string[]; status: string; isDonation: boolean; isPromoted: boolean }>;
}

export default function OrganisationProfilePage() {
  const { id = '' } = useParams();
  const user = useAuthStore((state) => state.user); const navigate = useNavigate(); const location = useLocation();
  const { data, loading, error } = useQuery<{ organisation: OrganisationProfile | null }>(ORGANISATION_PROFILE, { variables: { id }, skip: !id });
  const [follow, { loading: following }] = useMutation(FOLLOW_ORG); const [unfollow] = useMutation(UNFOLLOW_ORG);
  const org = data?.organisation;
  const isFollowing = Boolean((data as { isFollowingOrganisation?: boolean } | undefined)?.isFollowingOrganisation);
  async function toggleFollow() { if (!user) { navigate('/signin', { state: { from: location.pathname } }); return; } await (isFollowing ? unfollow : follow)({ variables: { id }, refetchQueries: [{ query: ORGANISATION_PROFILE, variables: { id } }] }); }

  if (loading) return <div className="min-h-[60vh] px-6 py-24 text-center text-sm text-gray-500">Loading organisation...</div>;
  if (error) return <div className="min-h-[60vh] px-6 py-24 text-center"><h1 className="font-serif text-3xl font-bold">We couldn’t load this organisation</h1><p className="mt-3 text-sm text-gray-500">Please try again in a moment.</p><Link to="/" className="mt-6 inline-block rounded-full bg-black px-5 py-2.5 text-sm text-white">Return home</Link></div>;
  if (!org) return <div className="min-h-[60vh] px-6 py-24 text-center"><h1 className="font-serif text-3xl font-bold">Organisation not found</h1><p className="mt-3 text-sm text-gray-500">This profile is no longer available.</p><Link to="/" className="mt-6 inline-block rounded-full bg-black px-5 py-2.5 text-sm text-white">Return home</Link></div>;

  const events = org.events.edges.filter((event) => event.status === 'PUBLISHED');
  const jobs = org.jobListings.filter((job) => job.status === 'ACTIVE');
  const listings = org.marketplaceListings.filter((listing) => listing.status === 'AVAILABLE');
  const website = org.websiteUrl || org.socialLinks?.website;
  const socialLinks = (['whatsapp', 'instagram', 'facebook', 'twitter', 'website'] as const).flatMap((network) => {
    const value = org.socialLinks?.[network];
    return value ? [[network, value] as const] : [];
  });
  const activeCount = events.length + jobs.length + listings.length;

  return <main className="bg-white text-[#171717]">
    <header className="relative h-72 overflow-hidden bg-[#312d28] md:h-96"><img src="/assets/org-cta.png" alt="" className="h-full w-full object-cover opacity-70"/><div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-white" /></header>

    <div className="relative mx-auto -mt-28 max-w-7xl px-5 pb-20 md:px-10">
      <section className="rounded-3xl bg-[#fffdf9]/95 p-6 shadow-sm backdrop-blur md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#eee8dc] font-serif text-4xl font-bold shadow-lg md:h-40 md:w-40">{org.logoUrl ? <img src={org.logoUrl} alt={`${org.name} logo`} className="h-full w-full object-cover"/> : org.name.charAt(0)}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><h1 className="font-serif text-3xl font-bold md:text-5xl">{org.name}</h1>{org.isVerified && <span title="Verified organisation" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#74b938] text-sm font-bold text-white">✓</span>}</div><p className="mt-2 border-l-4 border-gray-200 pl-4 text-sm italic text-gray-500 md:text-base">{org.verificationTier === 'CHARITY' ? 'Registered Charity' : 'Faith Community Organisation'}{org.region ? ` · ${org.region}` : ''}</p></div><button type="button" disabled={following} onClick={toggleFollow} className={`rounded-full px-5 py-2.5 text-xs font-semibold disabled:opacity-50 ${isFollowing ? 'border border-gray-400 bg-white text-gray-800' : 'bg-[#282828] text-white'}`}>{isFollowing ? '✓ Following' : '+ Follow Organisation'}</button></div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600"><span><strong className="text-black">{org.followerCount.toLocaleString()}</strong> followers</span><span><strong className="text-black">{activeCount}</strong> active listings</span>{website && <a href={normaliseUrl(website)} target="_blank" rel="noreferrer" className="font-medium text-black hover:underline">Visit website ↗</a>}<span>Active since {new Date(org.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span></div>
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-5"><p className="text-xs uppercase tracking-widest text-gray-400">Our mission</p><p className="mt-2 max-w-4xl text-sm leading-7 text-gray-700 md:text-base">{org.description || `${org.name} serves its local faith community through events, opportunities and practical support.`}</p></div>
          </div>
        </div>
      </section>

      <section className="py-14"><h2 className="font-serif text-2xl font-bold">About Us</h2><p className="mt-5 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-gray-600 md:text-base">{org.description || `Discover the community work, gatherings and opportunities shared by ${org.name}.`}</p>{(org.contactEmail || org.phoneNumber || socialLinks.length > 0) && <div className="mt-8 rounded-2xl border border-gray-200 bg-[#fffdf9] p-6"><h3 className="font-serif text-xl font-bold">Contact and social links</h3><div className="mt-4 flex flex-wrap gap-3">{org.contactEmail && <a href={`mailto:${org.contactEmail}`} className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm hover:border-gray-500">{org.contactEmail}</a>}{org.phoneNumber && <a href={`tel:${org.phoneNumber.replace(/\s/g, '')}`} className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm hover:border-gray-500">{org.phoneNumber}</a>}{socialLinks.map(([network, value]) => <a key={network} href={network === 'whatsapp' ? `https://wa.me/${String(value).replace(/\D/g, '')}` : normaliseUrl(String(value))} target="_blank" rel="noreferrer" className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm capitalize hover:border-gray-500">{network === 'twitter' ? 'X / Twitter' : network} ↗</a>)}</div></div>}<div className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr_1fr] md:grid-rows-2"><img src="/assets/spotlight-ad.jpg" alt="Community spotlight" className="h-72 w-full rounded-2xl object-cover md:row-span-2 md:h-full"/><img src="/assets/event-theology.png" alt="Community event" className="h-44 w-full rounded-2xl object-cover"/><img src="/assets/org-cta.png" alt="Community gathering" className="h-44 w-full rounded-2xl object-cover"/><img src="/assets/background/background.png" alt="Community work" className="h-44 w-full rounded-2xl object-cover md:col-span-2"/></div></section>

      <ProfileSection title="Active Events" subtitle="Moments that define our journey" empty="No upcoming events have been published.">{events.map((event) => <EventCard key={event.id} title={event.title} description={event.description} badge={event.category.replaceAll('_', ' / ')} date={new Date(event.date).toLocaleDateString()} location={event.region} invites={`${event.rsvpCount} attending`} verified={org.isVerified} imageSrc={event.imageUrls[0] || '/assets/event-theology.png'} href={`/events/${event.id}`} />)}</ProfileSection>
      <ProfileSection title="Marketplace Listings" subtitle="Items shared with the community" empty="No marketplace listings are currently available.">{listings.map((listing) => <MarketplaceCard key={listing.id} title={listing.title} description={listing.description} badge={listing.isDonation ? 'COMMUNITY GIFT' : 'FOR SALE'} price={listing.isDonation ? 'Free' : formatMoney(listing.price, listing.currency)} location={listing.region} imageSrc={listing.imageUrls[0] || '/assets/car-ford.png'} verified={org.isVerified} href={`/marketplace/${listing.id}`} />)}</ProfileSection>
      <ProfileSection title="Available Jobs" subtitle="Purposeful opportunities hosted by us" empty="There are no active jobs right now.">{jobs.map((job) => <JobCard key={job.id} title={job.title} company={org.name} badge={job.isPromoted ? 'PROMOTED' : job.roleType} salaryRange={job.salaryRange ? `${formatMoney(job.salaryRange.min, job.salaryRange.currency)} – ${formatMoney(job.salaryRange.max, job.salaryRange.currency)}` : undefined} employmentType={`${job.roleType.replaceAll('_', ' ')} · ${job.workLocation.replaceAll('_', ' ')}`} location={job.region} verified={org.isVerified} href={`/jobs/${job.id}`} />)}</ProfileSection>
    </div>
  </main>;
}

function ProfileSection({ title, subtitle, empty, children }: { title: string; subtitle: string; empty: string; children: React.ReactNode }) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  return <section className="mb-14"><div className="mb-6"><h2 className="font-serif text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-gray-500">{subtitle}</p></div>{count ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{children}</div> : <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-sm text-gray-500">{empty}</div>}</section>;
}

function formatMoney(value: number, currency: string) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value); } catch { return `${currency} ${value.toLocaleString()}`; }
}

function normaliseUrl(value: string) { return /^https?:\/\//i.test(value) ? value : `https://${value}`; }
