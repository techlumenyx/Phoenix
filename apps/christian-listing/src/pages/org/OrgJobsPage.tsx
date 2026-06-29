import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { MY_ORG_JOB_LISTINGS } from '../../graphql/mutations';

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

  const { data, loading, error } = useQuery(MY_ORG_JOB_LISTINGS);
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

        {/* Applications placeholder */}
        {activeTab === 'Applications' && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF6ED] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#C9A96E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">Applications inbox coming soon</p>
            <p className="text-xs text-gray-400 text-center max-w-xs">
              Candidate applications will appear here once inbound apply is enabled for your listings.
            </p>
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
            {error   && <div className="flex items-center justify-center py-16 text-sm text-red-500">{error.message}</div>}
            {!loading && !error && sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-sm font-semibold text-gray-600">No listings here</p>
                <p className="text-xs text-gray-400">Post a job from the Overview page.</p>
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
    </div>
  );
}
