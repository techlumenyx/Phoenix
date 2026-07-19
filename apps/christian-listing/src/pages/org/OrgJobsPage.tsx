import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { MY_ORG_JOB_LISTINGS } from '../../graphql/mutations';
import { CreateJobsForm } from './OrgOverviewPage';

interface JobListing {
  id: string;
  title: string;
  roleType: string;
  workLocation: string;
  region: string;
  applicationDeadline: string;
  status: string;
  isPromoted: boolean;
  faithAlignmentTag: string | null;
  createdAt: string;
}

const ROLE_LABEL: Record<string, string> = { PAID: 'Paid', VOLUNTEER: 'Volunteer', INTERNSHIP: 'Internship' };
const LOCATION_LABEL: Record<string, string> = { PHYSICAL: 'In-Person', REMOTE: 'Remote', HYBRID: 'Hybrid' };
const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'bg-green-50 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
  CLOSED:   'bg-red-50 text-red-600',
};
const PAGE_SIZE = 10;

const ORG_APPLICATIONS = gql`
  query OrganisationApplicationsInbox($organisationId: ID!) {
    organisationJobApplications(organisationId: $organisationId) {
      id status fullName email phoneNumber gender dateOfBirth experience yearsOfExperience
      currentSalary expectedSalary portfolioUrl linkedInProfile createdAt
      education { highestQualification institutionName yearOfEnrollment yearOfCompletion marksGrades degreeType }
      listing { id title }
    }
  }
`;

const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateOrganisationApplicationStatus($id: ID!, $status: ApplicationStatus!) {
    updateJobApplicationStatus(id: $id, status: $status) { id status }
  }
`;

interface JobApplication {
  id: string; status: string; fullName: string; email: string; phoneNumber?: string | null; gender?: string | null; dateOfBirth?: string | null;
  experience?: string | null; yearsOfExperience?: number | null; currentSalary?: string | null; expectedSalary?: string | null;
  portfolioUrl?: string | null; linkedInProfile?: string | null; createdAt: string; listing: { id: string; title: string };
  education: Array<{ highestQualification?: string | null; institutionName?: string | null; yearOfEnrollment?: number | null; yearOfCompletion?: number | null; marksGrades?: string | null; degreeType?: string | null }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

type SortKey = 'title' | 'roleType' | 'workLocation' | 'region' | 'applicationDeadline' | 'status';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span className={`ml-1 inline-flex flex-col leading-none ${active ? 'text-[#1B1B1B]' : 'text-gray-300'}`}>
      <span className={`text-[8px] leading-none ${active && dir === 'asc' ? 'text-[#C9A96E]' : ''}`}>▲</span>
      <span className={`text-[8px] leading-none ${active && dir === 'desc' ? 'text-[#C9A96E]' : ''}`}>▼</span>
    </span>
  );
}

export default function OrgJobsPage() {
  const [activeTab, setActiveTab] = useState('Active Listings');
  const tabs = ['Active Listings', 'Archived', 'Applications'];
  const [sortKey, setSortKey] = useState<SortKey>('applicationDeadline');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  const { data, loading, error, refetch } = useQuery(MY_ORG_JOB_LISTINGS);
  const organisationId = data?.myOrganisations?.[0]?.id as string | undefined;
  const { data: applicationsData, loading: applicationsLoading, error: applicationsError, refetch: refetchApplications } = useQuery<{ organisationJobApplications: JobApplication[] }>(ORG_APPLICATIONS, { variables: { organisationId }, skip: !organisationId });
  const [updateApplicationStatus, { loading: updatingStatus }] = useMutation(UPDATE_APPLICATION_STATUS);
  const applications = applicationsData?.organisationJobApplications ?? [];
  const allJobs: JobListing[] = (data?.myOrganisations ?? []).flatMap(
    (org: { jobListings: JobListing[] }) => org.jobListings ?? [],
  );

  const filtered = allJobs.filter((j) => {
    if (activeTab === 'Active Listings') return j.status === 'ACTIVE';
    if (activeTab === 'Archived')        return j.status === 'ARCHIVED' || j.status === 'CLOSED';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'title')               cmp = a.title.localeCompare(b.title);
    else if (sortKey === 'roleType')       cmp = a.roleType.localeCompare(b.roleType);
    else if (sortKey === 'workLocation')   cmp = a.workLocation.localeCompare(b.workLocation);
    else if (sortKey === 'region')         cmp = a.region.localeCompare(b.region);
    else if (sortKey === 'applicationDeadline') cmp = new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
    else if (sortKey === 'status')         cmp = a.status.localeCompare(b.status);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  }
  function handleTabChange(tab: string) { setActiveTab(tab); setPage(0); }

  async function changeApplicationStatus(application: JobApplication, status: string) {
    await updateApplicationStatus({ variables: { id: application.id, status } });
    setSelectedApplication((current) => current?.id === application.id ? { ...current, status } : current);
    await refetchApplications();
  }

  function downloadApplicationsCsv() {
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = applications.map((application) => [
      application.fullName, application.email, application.phoneNumber, application.listing.title,
      application.status, application.yearsOfExperience, application.currentSalary,
      application.expectedSalary, application.portfolioUrl, application.linkedInProfile,
      new Date(application.createdAt).toISOString(),
    ]);
    const csv = [['Candidate', 'Email', 'Phone', 'Job', 'Status', 'Years experience', 'Current salary', 'Expected salary', 'Portfolio', 'LinkedIn', 'Applied at'], ...rows]
      .map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const startRow = sorted.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const endRow = Math.min((page + 1) * PAGE_SIZE, sorted.length);

  function ColHeader({ label, sortable }: { label: string; sortable?: SortKey }) {
    if (!sortable) return <div className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">{label}</div>;
    return (
      <button
        onClick={() => handleSort(sortable)}
        className="flex items-center text-[11px] font-bold text-gray-500 tracking-wider uppercase hover:text-gray-800 transition-colors"
      >
        {label}<SortIcon active={sortKey === sortable} dir={sortDir} />
      </button>
    );
  }

  return (
    <div className="font-sans w-full max-w-[1200px] mx-auto p-6">
      <h1 className="text-3xl font-serif font-bold text-[#1B1B1B] mb-6">Hiring & Jobs</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="px-6 pt-4 flex items-center gap-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-4 text-[14px] font-medium transition-colors relative ${
                activeTab === tab ? 'text-[#1B1B1B]' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#1B1B1B]" />}
            </button>
          ))}
        </div>

        {activeTab === 'Applications' && (
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3"><p className="text-sm text-gray-500">{applications.length} application{applications.length === 1 ? '' : 's'}</p><button type="button" disabled={applications.length === 0} onClick={downloadApplicationsCsv} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40">Download CSV</button></div>
            <div className="grid grid-cols-[1.2fr_1.4fr_1.4fr_1fr_1fr_auto] gap-4 border-b border-gray-200 bg-[#FAF6ED] px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500"><span>Candidate</span><span>Job</span><span>Email</span><span>Applied</span><span>Status</span><span>Details</span></div>
            {applicationsLoading && <div className="py-16 text-center text-sm text-gray-400">Loading applications…</div>}
            {applicationsError && <div className="py-16 text-center text-sm text-red-500">We couldn’t load job applications. Please try again.</div>}
            {!applicationsLoading && !applicationsError && applications.length === 0 && <div className="py-16 text-center"><p className="text-sm font-semibold text-gray-600">No applications yet</p><p className="mt-1 text-xs text-gray-400">New candidate applications will appear here.</p></div>}
            {applications.map((application) => <div key={application.id} className="grid grid-cols-[1.2fr_1.4fr_1.4fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-100 px-6 py-4 text-[13px]"><strong>{application.fullName}</strong><span className="truncate text-gray-600">{application.listing.title}</span><a href={`mailto:${application.email}`} className="truncate text-gray-500 hover:underline">{application.email}</a><span className="text-gray-500">{formatDate(application.createdAt)}</span><span className="rounded-full bg-blue-50 px-2 py-1 text-center text-[11px] font-semibold text-blue-700">{application.status.replaceAll('_', ' ')}</span><button onClick={() => setSelectedApplication(application)} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50">View</button></div>)}
          </div>
        )}

        {/* Listings */}
        {activeTab !== 'Applications' && (
          <>
            {/* Table Header */}
            <div className="bg-[#FAF6ED] px-6 py-4 border-b border-gray-200 grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center">
              <ColHeader label="Job Title"   sortable="title" />
              <ColHeader label="Role Type"   sortable="roleType" />
              <ColHeader label="Location"    sortable="workLocation" />
              <ColHeader label="Region"      sortable="region" />
              <ColHeader label="Deadline"    sortable="applicationDeadline" />
              <ColHeader label="Status"      sortable="status" />
              <div className="w-6" />
            </div>

            {loading && <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading jobs...</div>}
            {error   && <div className="flex items-center justify-center py-16 text-sm text-red-500">We couldn’t load your jobs. Please try again.</div>}
            {!loading && !error && sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-sm font-semibold text-gray-600">No listings here</p>
                <p className="text-xs text-gray-400">Use the form below to post a job.</p>
              </div>
            )}

            {!loading && !error && paginated.length > 0 && (
              <div className="flex flex-col">
                {paginated.map((item, index) => (
                  <div
                    key={item.id}
                    className={`px-6 py-4 grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center ${
                      index !== paginated.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-[#EAEAF5] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-[#1B1B1B]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1B1B1B] text-[14px] leading-snug">{item.title}</h4>
                        {item.isPromoted && <span className="text-[11px] text-[#C9A96E] font-medium">Promoted</span>}
                      </div>
                    </div>
                    <div className="text-[13px] text-gray-500">{ROLE_LABEL[item.roleType] ?? item.roleType}</div>
                    <div className="text-[13px] text-gray-500">{LOCATION_LABEL[item.workLocation] ?? item.workLocation}</div>
                    <div className="text-[13px] text-gray-500">{item.region}</div>
                    <div className="text-[13px] text-gray-500">{formatDate(item.applicationDeadline)}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLE[item.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {item.status}
                      </span>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && sorted.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{startRow}–{endRow}</span> of <span className="font-semibold text-gray-600">{sorted.length}</span> jobs
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                        page === i ? 'bg-[#1B1B1B] text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <section id="create-job" className="mt-8 scroll-mt-24 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-5"><h2 className="font-serif text-2xl font-bold text-[#1B1B1B]">Create a Job Listing</h2><p className="mt-1 text-sm text-gray-500">Post a paid role, volunteer opportunity, or internship.</p></div>
        <div className="px-6 py-6"><CreateJobsForm orgId={organisationId} onCreated={() => { void refetch(); }} /></div>
      </section>
      {selectedApplication && <ApplicationDrawer application={selectedApplication} updating={updatingStatus} onClose={() => setSelectedApplication(null)} onStatusChange={(status) => changeApplicationStatus(selectedApplication, status)} />}
    </div>
  );
}

function ApplicationDrawer({
  application,
  updating,
  onClose,
  onStatusChange,
}: {
  application: JobApplication;
  updating: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}) {
  const actions = [
    { status: 'UNDER_REVIEW', label: 'Review', style: 'border-amber-300 text-amber-800 hover:bg-amber-50' },
    { status: 'SHORTLISTED', label: 'Shortlist', style: 'border-blue-300 text-blue-700 hover:bg-blue-50' },
    { status: 'HIRED', label: 'Mark hired', style: 'border-green-300 text-green-700 hover:bg-green-50' },
    { status: 'REJECTED', label: 'Reject', style: 'border-red-300 text-red-700 hover:bg-red-50' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/35" role="dialog" aria-modal="true" aria-labelledby="application-title" onMouseDown={onClose}>
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Application for {application.listing.title}</p>
            <h2 id="application-title" className="mt-1 text-2xl font-serif font-bold text-[#1B1B1B]">{application.fullName}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close application" className="rounded-full p-2 text-xl text-gray-500 hover:bg-gray-100">&times;</button>
        </div>

        <div className="space-y-7 px-6 py-6 text-sm">
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Email"><a className="hover:underline" href={`mailto:${application.email}`}>{application.email}</a></Detail>
              <Detail label="Phone">{application.phoneNumber || 'Not provided'}</Detail>
              <Detail label="Date of birth">{application.dateOfBirth ? formatDate(application.dateOfBirth) : 'Not provided'}</Detail>
              <Detail label="Gender">{application.gender || 'Not provided'}</Detail>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Experience</h3>
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Years">{application.yearsOfExperience ?? 'Not provided'}</Detail>
              <Detail label="Current / expected salary">{[application.currentSalary, application.expectedSalary].filter(Boolean).join(' / ') || 'Not provided'}</Detail>
            </div>
            <p className="mt-4 whitespace-pre-wrap leading-6 text-gray-700">{application.experience || 'No experience summary provided.'}</p>
          </section>

          {application.education.length > 0 && <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Education</h3>
            <div className="space-y-3">{application.education.map((item, index) => <div key={index} className="rounded-lg border border-gray-200 p-4"><strong>{item.highestQualification || item.degreeType || 'Qualification'}</strong><p className="mt-1 text-gray-600">{item.institutionName || 'Institution not provided'}</p><p className="mt-1 text-xs text-gray-400">{[item.yearOfEnrollment, item.yearOfCompletion].filter(Boolean).join(' - ')}{item.marksGrades ? ` · ${item.marksGrades}` : ''}</p></div>)}</div>
          </section>}

          {(application.portfolioUrl || application.linkedInProfile) && <section className="flex flex-wrap gap-3">
            {application.portfolioUrl && <ExternalLink href={application.portfolioUrl}>Portfolio</ExternalLink>}
            {application.linkedInProfile && <ExternalLink href={application.linkedInProfile}>LinkedIn</ExternalLink>}
          </section>}
        </div>

        <div className="sticky bottom-0 border-t bg-white px-6 py-4">
          <p className="mb-3 text-xs text-gray-500">Current status: <strong>{application.status.replaceAll('_', ' ')}</strong></p>
          <div className="flex flex-wrap gap-2">{actions.map((action) => <button key={action.status} type="button" disabled={updating || application.status === action.status} onClick={() => onStatusChange(action.status)} className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${action.style}`}>{action.label}</button>)}</div>
        </div>
      </aside>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs text-gray-400">{label}</p><div className="mt-1 break-words font-medium text-gray-800">{children}</div></div>;
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const safeHref = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return <a href={safeHref} target="_blank" rel="noreferrer" className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">{children} &rarr;</a>;
}
