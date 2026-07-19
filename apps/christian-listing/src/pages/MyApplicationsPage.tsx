import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';

const MY_APPLICATIONS = gql`
  query MyApplications {
    me {
      id
      jobApplications {
        id
        status
        createdAt
        updatedAt
        listing {
          id
          title
          organisation { id name isVerified }
        }
      }
    }
  }
`;

interface Application {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  listing: { id: string; title: string; organisation: { id: string; name: string; isVerified: boolean } };
}

const STATUS_STYLE: Record<string, string> = {
  SUBMITTED: 'bg-gray-100 text-gray-700',
  UNDER_REVIEW: 'bg-amber-50 text-amber-800',
  SHORTLISTED: 'bg-blue-50 text-blue-700',
  HIRED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

export default function MyApplicationsPage() {
  const { data, loading, error } = useQuery(MY_APPLICATIONS, { fetchPolicy: 'cache-and-network' });
  const applications: Application[] = data?.me?.jobApplications ?? [];

  return <main className="mx-auto max-w-5xl px-6 pb-12 pt-28 md:px-10">
    <div className="mb-8 flex items-end justify-between gap-4">
      <div><p className="text-sm text-gray-500"><Link to="/dashboard" className="hover:underline">Dashboard</Link> / Applications</p><h1 className="mt-2 font-serif text-3xl font-bold">My Applications</h1></div>
      <Link to="/jobs/all" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">Find jobs</Link>
    </div>
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {loading && !data && <p className="p-10 text-center text-sm text-gray-500">Loading applications...</p>}
      {error && <p className="p-10 text-center text-sm text-red-600">We couldn’t load your applications. Please try again.</p>}
      {!loading && !error && applications.length === 0 && <div className="p-12 text-center"><h2 className="font-semibold">No applications yet</h2><p className="mt-2 text-sm text-gray-500">Jobs you apply for will appear here with their live status.</p></div>}
      {applications.map((application) => <article key={application.id} className="flex flex-col gap-4 border-b border-gray-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
        <div><Link to={`/jobs/${application.listing.id}`} className="font-semibold text-gray-900 hover:underline">{application.listing.title}</Link><p className="mt-1 text-sm text-gray-500">{application.listing.organisation.name}{application.listing.organisation.isVerified ? ' · Verified organisation' : ''}</p><p className="mt-2 text-xs text-gray-400">Applied {new Date(application.createdAt).toLocaleDateString()}</p></div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLE[application.status] ?? STATUS_STYLE.SUBMITTED}`}>{application.status.replaceAll('_', ' ')}</span>
      </article>)}
    </section>
  </main>;
}
