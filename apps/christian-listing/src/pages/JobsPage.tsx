import { gql, useQuery } from '@apollo/client';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/cards/JobCard';
import { ArrowRightIcon, SearchIcon } from '../components/layout/icons';
import { formatPrice, usePreferredRegion } from '../lib/discovery';
import { useAuthStore } from '../store/authStore';

const JOBS_HOME = gql`
  query JobsHome($region: String, $search: String) {
    trending: jobListings(region: $region, search: $search, status: ACTIVE, sort: POPULAR, limit: 8) { edges { ...HomeJob } }
    newest: jobListings(region: $region, search: $search, status: ACTIVE, sort: NEWEST, limit: 20) { edges { ...HomeJob } }
    volunteering: jobListings(region: $region, search: $search, status: ACTIVE, roleType: VOLUNTEER, sort: NEWEST, limit: 8) { edges { ...HomeJob } }
  }
  fragment HomeJob on JobListing { id title roleType workLocation region skillsRequired salaryRange { min max currency } isPromoted organisation { id name isVerified } }
`;

interface HomeJob { id: string; title: string; roleType: string; workLocation: string; region: string; skillsRequired: string[]; salaryRange?: { min: number; max: number; currency: string } | null; isPromoted: boolean; organisation: { id: string; name: string; isVerified: boolean } }
interface HomeData { trending: { edges: HomeJob[] }; newest: { edges: HomeJob[] }; volunteering: { edges: HomeJob[] } }
const SECTORS = [['Social Media', 'Technology', '▣'], ['Project Management', 'Operations', '⌘'], ['Teaching', 'Education', '☆'], ['Counselling', 'Health & Care', '♡']] as const;
const EMPTY_PREFERENCES: string[] = [];

export default function JobsPage() {
  const { region } = usePreferredRegion();
  const preferences = useAuthStore((state) => state.dbUser?.preferences ?? EMPTY_PREFERENCES);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, error } = useQuery<HomeData>(JOBS_HOME, { variables: { region: region || null, search: search || null }, fetchPolicy: 'cache-and-network' });
  const newest = data?.newest.edges ?? [];
  const submit = (event: FormEvent) => { event.preventDefault(); setSearch(input.trim()); };
  const interests = useMemo(() => preferences.includes('Career & Volunteering') ? newest : newest.filter((job) => job.roleType === 'VOLUNTEER'), [newest, preferences]);

  return <>
    <section className="relative flex min-h-[440px] items-center justify-center overflow-hidden bg-[#2d302d] px-6 text-center"><img src="/assets/org-cta.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /><div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20" /><div className="relative w-full max-w-2xl"><h1 className="font-serif text-4xl font-bold text-white md:text-5xl">Find Opportunities<br />that grow your Career</h1><form onSubmit={submit} className="mx-auto mt-7 flex max-w-xl items-center overflow-hidden rounded-full bg-white shadow-lg"><SearchIcon className="ml-4 h-5 w-5 text-gray-400" /><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search jobs, skills or organisations…" className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" /><button className="m-1 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white">Explore</button></form>{region && <p className="mt-3 text-xs text-white/70">Showing opportunities near {region}</p>}</div></section>
    {error && <p className="py-10 text-center text-red-700">Jobs are temporarily unavailable.</p>}
    <section className="px-6 py-12 md:px-10 lg:px-16"><h2 className="mb-6 font-serif text-3xl font-bold">Search by Sector</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{SECTORS.map(([skill, label, icon]) => <Link key={skill} to={`/jobs/all?skill=${encodeURIComponent(skill)}`} className="relative flex h-44 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-[#292f35] to-[#8d7c79] p-5 text-white"><span className="absolute right-4 top-4 text-3xl">{icon}</span><strong className="font-serif text-xl">{label}</strong></Link>)}</div><div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">{['Accounting', 'Delivery Driver', 'Community Outreach', 'Social Media', 'Counselling', 'Project Management', 'Administration', 'Event Planning'].map((skill) => <Link key={skill} to={`/jobs/all?skill=${encodeURIComponent(skill)}`} className="rounded-lg bg-[#b9b8ff] px-4 py-2 text-xs">{skill} Jobs →</Link>)}</div></section>
    <JobSection title="Based on your Interests" jobs={(interests.length ? interests : newest).slice(0, 4)} loading={loading} />
    <JobSection title="Volunteer Opportunities" jobs={data?.volunteering.edges ?? []} loading={loading} />
    <JobSection title="Trending Opportunities" jobs={data?.trending.edges ?? []} loading={loading} />
    <section className="relative overflow-hidden bg-[#26221e] px-6 py-14 text-center text-white"><img src="/assets/org-cta.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /><div className="relative"><p className="font-serif text-xl italic">“Use your gifts to serve one another as faithful stewards.”</p><Link to="/jobs/all" className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-xs font-semibold text-black">Browse all jobs</Link></div></section>
    <JobSection title="All Available Jobs" jobs={newest.slice(0, 12)} loading={loading} viewAll />
  </>;
}

function JobSection({ title, jobs, loading, viewAll = false }: { title: string; jobs: HomeJob[]; loading: boolean; viewAll?: boolean }) { return <section className="px-6 py-12 md:px-10 lg:px-16"><div className="mb-6 flex items-end justify-between"><h2 className="font-serif text-3xl font-bold">{title}</h2><Link to="/jobs/all" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500">View all jobs <ArrowRightIcon className="h-3.5 w-3.5 -rotate-45" /></Link></div>{loading && jobs.length === 0 ? <p className="text-gray-500">Loading jobs…</p> : jobs.length === 0 ? <p className="text-gray-500">No opportunities are available in this section.</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{jobs.map((job) => <JobCard key={job.id} badge={job.roleType.replaceAll('_', ' ')} badgeColor="blue" title={job.title} company={job.organisation.name || 'Christian Listings organisation'} salaryRange={job.salaryRange ? `${formatPrice(job.salaryRange.min, job.salaryRange.currency)} – ${formatPrice(job.salaryRange.max, job.salaryRange.currency)}` : undefined} employmentType={job.workLocation.replaceAll('_', ' ')} location={job.region} verified={job.organisation.isVerified} href={`/jobs/${job.id}`} />)}</div>}{viewAll && jobs.length > 0 && <div className="mt-8 text-center"><Link to="/jobs/all" className="rounded-full border px-8 py-3 text-sm">Browse all jobs</Link></div>}</section>; }
