import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MY_APPLICATIONS = gql`
  query MyApplications {
    me {
      id
      jobApplications {
        id status createdAt updatedAt fullName phoneNumber email gender dateOfBirth
        experience yearsOfExperience currentSalary expectedSalary portfolioUrl
        linkedInProfile cvUrl acknowledged
        education { highestQualification institutionName yearOfEnrollment yearOfCompletion marksGrades degreeType }
        listing { id title organisation { id name isVerified } }
      }
    }
  }
`;

interface EducationEntry {
  highestQualification?: string | null;
  institutionName?: string | null;
  yearOfEnrollment?: number | null;
  yearOfCompletion?: number | null;
  marksGrades?: string | null;
  degreeType?: string | null;
}

interface Application {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phoneNumber?: string | null;
  email: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  experience?: string | null;
  yearsOfExperience?: number | null;
  currentSalary?: string | null;
  expectedSalary?: string | null;
  portfolioUrl?: string | null;
  linkedInProfile?: string | null;
  cvUrl?: string | null;
  acknowledged: boolean;
  education: EducationEntry[];
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
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (!selectedApplication) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedApplication(null); };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedApplication]);

  return <main aria-labelledby="my-applications-title" className="mx-auto max-w-5xl px-6 pb-12 pt-28 md:px-10">
    <div className="mb-8 flex items-end justify-between gap-4">
      <div><p className="text-sm text-gray-500"><Link to="/dashboard" className="hover:underline">Dashboard</Link> / Applications</p><h1 id="my-applications-title" className="mt-2 font-serif text-3xl font-bold">My Applications</h1></div>
      <Link to="/jobs/all" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">Find jobs</Link>
    </div>
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {loading && !data && <p className="p-10 text-center text-sm text-gray-500">Loading applications...</p>}
      {error && <p className="p-10 text-center text-sm text-red-600">We couldn’t load your applications. Please try again.</p>}
      {!loading && !error && applications.length === 0 && <div className="p-12 text-center"><h2 className="font-semibold">No applications yet</h2><p className="mt-2 text-sm text-gray-500">Jobs you apply for will appear here with their live status.</p></div>}
      {applications.map((application) => <article key={application.id} className="flex flex-col gap-4 border-b border-gray-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
        <div><Link to={`/jobs/${application.listing.id}`} className="font-semibold text-gray-900 hover:underline">{application.listing.title}</Link><p className="mt-1 text-sm text-gray-500">{application.listing.organisation.name}{application.listing.organisation.isVerified ? ' · Verified organisation' : ''}</p><p className="mt-2 text-xs text-gray-400">Applied {new Date(application.createdAt).toLocaleDateString()}</p></div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end"><span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLE[application.status] ?? STATUS_STYLE.SUBMITTED}`}>{application.status.replaceAll('_', ' ')}</span><button type="button" onClick={() => setSelectedApplication(application)} className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-800 hover:border-gray-500 hover:bg-gray-50">View submitted response</button></div>
      </article>)}
    </section>
    {selectedApplication && <ApplicationResponseModal application={selectedApplication} onClose={() => setSelectedApplication(null)} />}
  </main>;
}

function ApplicationResponseModal({ application, onClose }: { application: Application; onClose: () => void }) {
  const education = application.education.filter((entry) => Object.values(entry).some((value) => value !== null && value !== undefined && value !== ''));
  return <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="application-response-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-5">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Submitted application</p><h2 id="application-response-title" className="mt-1 font-serif text-2xl font-bold">{application.listing.title}</h2><p className="mt-1 text-sm text-gray-500">{application.listing.organisation.name} · Submitted {new Date(application.createdAt).toLocaleString()}</p></div>
        <button type="button" onClick={onClose} aria-label="Close submitted response" className="rounded-full border border-gray-200 px-3 py-1.5 text-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900">×</button>
      </header>

      <div className="space-y-8 px-6 py-6">
        <ResponseSection title="Personal details"><div className="grid gap-4 sm:grid-cols-2"><ResponseField label="Full name" value={application.fullName} /><ResponseField label="Email" value={application.email} /><ResponseField label="Phone number" value={application.phoneNumber} /><ResponseField label="Gender" value={formatValue(application.gender)} /><ResponseField label="Date of birth" value={formatDate(application.dateOfBirth)} /><ResponseField label="Application status" value={application.status.replaceAll('_', ' ')} /></div></ResponseSection>

        <ResponseSection title="Experience and compensation"><div className="grid gap-4 sm:grid-cols-2"><ResponseField label="Years of experience" value={application.yearsOfExperience?.toString()} /><ResponseField label="Current salary" value={application.currentSalary} /><ResponseField label="Expected salary" value={application.expectedSalary} /></div><div className="mt-4"><ResponseField label="Experience description" value={application.experience} multiline /></div></ResponseSection>

        <ResponseSection title="Education">{education.length ? <div className="space-y-4">{education.map((entry, index) => <div key={`${application.id}-education-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Education {index + 1}</p><div className="grid gap-4 sm:grid-cols-2"><ResponseField label="Qualification" value={entry.highestQualification} /><ResponseField label="Degree type" value={entry.degreeType} /><ResponseField label="Institution" value={entry.institutionName} /><ResponseField label="Enrollment year" value={entry.yearOfEnrollment?.toString()} /><ResponseField label="Completion year" value={entry.yearOfCompletion?.toString()} /><ResponseField label="Marks / grades" value={entry.marksGrades} /></div></div>)}</div> : <p className="text-sm text-gray-500">No education details were submitted.</p>}</ResponseSection>

        <ResponseSection title="Links and confirmation"><div className="grid gap-4 sm:grid-cols-2"><ResponseLink label="Portfolio" value={application.portfolioUrl} /><ResponseLink label="LinkedIn profile" value={application.linkedInProfile} /><ResponseLink label="CV" value={application.cvUrl} /><ResponseField label="Application declaration" value={application.acknowledged ? 'Acknowledged' : 'Not acknowledged'} /></div></ResponseSection>
      </div>

      <footer className="sticky bottom-0 flex justify-end border-t border-gray-200 bg-white px-6 py-4"><button type="button" onClick={onClose} className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">Close</button></footer>
    </section>
  </div>;
}

function ResponseSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="mb-4 border-b border-gray-200 pb-2 font-serif text-lg font-bold">{title}</h3>{children}</section>;
}

function ResponseField({ label, value, multiline = false }: { label: string; value?: string | null; multiline?: boolean }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p><p className={`mt-1 text-sm text-gray-900 ${multiline ? 'whitespace-pre-wrap leading-6' : ''}`}>{value?.trim() || 'Not provided'}</p></div>;
}

function ResponseLink({ label, value }: { label: string; value?: string | null }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>{value ? <a href={normaliseUrl(value)} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm font-medium text-[#11167b] hover:underline">{value} ↗</a> : <p className="mt-1 text-sm text-gray-900">Not provided</p>}</div>;
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Not provided';
}

function formatValue(value?: string | null) {
  return value ? value.replaceAll('_', ' ') : 'Not provided';
}

function normaliseUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
