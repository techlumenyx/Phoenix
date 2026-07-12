import { gql, NetworkStatus, useQuery } from '@apollo/client';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../components/cards/JobCard';
import FAQSection from '../components/sections/FAQSection';
import OrgCTASection from '../components/sections/OrgCTASection';
import { formatPrice, usePreferredRegion } from '../lib/discovery';

const ALL_JOBS = gql`
  query AllJobsDirectory($region: String, $search: String, $roleType: RoleType, $workLocation: WorkLocation, $skillTags: [String!], $minSalary: Float, $maxSalary: Float, $sort: JobSort, $limit: Int, $after: String) {
    jobListings(region: $region, search: $search, roleType: $roleType, workLocation: $workLocation, skillTags: $skillTags, minSalary: $minSalary, maxSalary: $maxSalary, status: ACTIVE, sort: $sort, limit: $limit, after: $after) {
      edges { id title roleType workLocation region skillsRequired salaryRange { min max currency } applicationDeadline isPromoted organisation { id name isVerified } }
      hasNextPage endCursor
    }
  }
`;

interface Job { id: string; title: string; roleType: string; workLocation: string; region: string; skillsRequired: string[]; salaryRange?: { min: number; max: number; currency: string } | null; applicationDeadline: string; isPromoted: boolean; organisation: { id: string; name: string; isVerified: boolean } }
interface JobsData { jobListings: { edges: Job[]; hasNextPage: boolean; endCursor?: string | null } }
const SKILLS = ['Accounting', 'Marketing', 'Social Media', 'Project Management', 'Construction', 'Counselling', 'Administration', 'Event Planning'];
const SORTS = [['POPULAR', 'Trending'], ['NEWEST', 'Newly Added'], ['DEADLINE', 'Closing Soon'], ['SALARY_ASC', 'Salary Low–High'], ['SALARY_DESC', 'Salary High–Low']] as const;

export default function AllJobsPage() {
  const { region: preferredRegion } = usePreferredRegion();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [roleType, setRoleType] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [skill, setSkill] = useState(params.get('skill') || '');
  const [region, setRegion] = useState(preferredRegion);
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [sort, setSort] = useState('POPULAR');
  const variables = { region: region || null, search: search || null, roleType: roleType || null, workLocation: workLocation || null, skillTags: skill ? [skill] : null, minSalary: minSalary ? Number(minSalary) : null, maxSalary: maxSalary ? Number(maxSalary) : null, sort, limit: 12, after: null };
  const { data, loading, error, fetchMore, networkStatus } = useQuery<JobsData>(ALL_JOBS, { variables, notifyOnNetworkStatusChange: true, fetchPolicy: 'cache-and-network' });
  const clear = () => { setSearch(''); setRoleType(''); setWorkLocation(''); setSkill(''); setRegion(preferredRegion); setMinSalary(''); setMaxSalary(''); setSort('POPULAR'); };
  const loadMore = () => fetchMore({ variables: { ...variables, after: data?.jobListings.endCursor }, updateQuery: (previous, { fetchMoreResult }) => fetchMoreResult ? ({ jobListings: { ...fetchMoreResult.jobListings, edges: [...previous.jobListings.edges, ...fetchMoreResult.jobListings.edges.filter((next) => !previous.jobListings.edges.some((current) => current.id === next.id))] } }) : previous });

  return <><main className="bg-white px-5 py-9 md:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="font-serif text-sm text-gray-500">Jobs › <strong className="text-black">All Jobs</strong></p><h1 className="mt-2 font-serif text-4xl font-bold">All Jobs</h1></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search jobs, skills or organisations…" className="w-full rounded-full bg-[#eef0ff] px-5 py-3 text-sm outline-none sm:w-80" /></div>
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="space-y-6"><Filter title="Job Type">{[['PAID', 'Paid'], ['VOLUNTEER', 'Volunteering'], ['INTERNSHIP', 'Internship']].map(([value, label]) => <label key={value} className="flex gap-2 text-sm"><input type="radio" checked={roleType === value} onChange={() => setRoleType(value)} />{label}</label>)}</Filter><Filter title="Work Style">{['PHYSICAL', 'REMOTE', 'HYBRID'].map((value) => <label key={value} className="flex gap-2 text-sm"><input type="radio" checked={workLocation === value} onChange={() => setWorkLocation(value)} />{value}</label>)}</Filter><Filter title="Sector / Specialization">{SKILLS.map((value) => <label key={value} className="flex gap-2 text-sm"><input type="radio" checked={skill === value} onChange={() => setSkill(value)} />{value}</label>)}</Filter><Filter title="Location"><input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="City or country" className="w-full rounded-lg bg-[#eef0ff] px-3 py-2 text-sm" /></Filter><Filter title="Salary Range"><div className="grid grid-cols-2 gap-2"><input type="number" min="0" value={minSalary} onChange={(event) => setMinSalary(event.target.value)} placeholder="Min" className="w-full rounded-lg bg-[#eef0ff] px-3 py-2 text-sm" /><input type="number" min="0" value={maxSalary} onChange={(event) => setMaxSalary(event.target.value)} placeholder="Max" className="w-full rounded-lg bg-[#eef0ff] px-3 py-2 text-sm" /></div></Filter><button onClick={clear} className="w-full rounded-lg bg-gray-100 py-2 text-sm">Clear Filters</button></aside>
    <section><div className="mb-6 flex gap-2 overflow-x-auto">{SORTS.map(([value, label]) => <button key={value} onClick={() => setSort(value)} className={`shrink-0 rounded-full px-5 py-2 text-sm ${sort === value ? 'bg-[#11177d] text-white' : 'bg-[#dfe3ff]'}`}>{label}</button>)}</div>{error ? <p className="text-red-700">Jobs could not be loaded.</p> : loading && !data ? <p className="text-gray-500">Loading jobs…</p> : data?.jobListings.edges.length === 0 ? <p className="text-gray-500">No jobs match these filters.</p> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data?.jobListings.edges.map((job) => <JobCard key={job.id} badge={job.roleType.replaceAll('_', ' ')} badgeColor="blue" title={job.title} company={job.organisation.name || 'Christian Listings organisation'} salaryRange={job.salaryRange ? `${formatPrice(job.salaryRange.min, job.salaryRange.currency)} – ${formatPrice(job.salaryRange.max, job.salaryRange.currency)}` : undefined} employmentType={job.workLocation.replaceAll('_', ' ')} location={job.region} verified={job.organisation.isVerified} href={`/jobs/${job.id}`} />)}</div>}{data?.jobListings.hasNextPage && <div className="mt-8 text-center"><button disabled={networkStatus === NetworkStatus.fetchMore} onClick={loadMore} className="rounded-full border px-8 py-3 text-sm disabled:opacity-50">{networkStatus === NetworkStatus.fetchMore ? 'Loading…' : 'Load More'}</button></div>}</section></div></div></main><OrgCTASection /><FAQSection /></>;
}

function Filter({ title, children }: { title: string; children: React.ReactNode }) { return <fieldset><legend className="mb-3 w-full rounded-lg bg-[#dfe3ff] px-3 py-2 text-sm font-semibold">{title}</legend><div className="space-y-2 px-2 text-gray-600">{children}</div></fieldset>; }
