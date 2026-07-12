import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../layout/icons';
import JobCard from '../cards/JobCard';
import { formatPrice, useDiscovery, usePreferredRegion } from '../../lib/discovery';

export default function FeaturedJobsSection() {
  const { region } = usePreferredRegion();
  const { data, loading, error } = useDiscovery('', 4);
  const jobs = data?.jobListings.edges ?? [];

  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-16 border-t border-gray-50">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark">Featured Jobs</h2>
          {region && <p className="mt-1 text-xs text-gray-400">Personalised for {region}</p>}
        </div>
        <Link to="/jobs" className="font-display text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 mb-1">
          VIEW ALL JOBS <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4">
        {loading && !data && <p className="text-sm text-gray-500">Loading jobs…</p>}
        {error && <p className="text-sm text-red-600">Jobs are temporarily unavailable.</p>}
        {!loading && !error && jobs.length === 0 && <p className="text-sm text-gray-500">No jobs found{region ? ` in ${region}` : ''}.</p>}
        {jobs.map((job) => (
          <div key={job.id} className="shrink-0 w-[75vw] sm:w-[48vw] md:w-auto">
            <JobCard
              badge={job.roleType.replaceAll('_', ' ')} badgeColor="blue" title={job.title}
              company={job.organisation.name || 'Christian Listings organisation'}
              salaryRange={job.salaryRange ? `${formatPrice(job.salaryRange.min, job.salaryRange.currency)} – ${formatPrice(job.salaryRange.max, job.salaryRange.currency)}` : undefined}
              employmentType={job.workLocation.replaceAll('_', ' ')} location={job.region}
              verified={job.organisation.isVerified}
              href={`/jobs/${job.id}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
