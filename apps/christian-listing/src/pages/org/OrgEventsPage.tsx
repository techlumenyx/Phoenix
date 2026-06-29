import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { MY_ORG_EVENTS } from '../../graphql/mutations';

interface EventLocation { type: string; city?: string | null; country?: string | null; }
interface OrgEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  location: EventLocation;
  rsvpCount: number;
  capacityLimit: number | null;
  status: string;
  isRecurring: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  WORSHIP: 'Worship', WELFARE: 'Welfare', CHARITY: 'Charity',
  COMMUNITY: 'Community', CONFERENCE: 'Conference', CULTURAL: 'Cultural',
  YOUTH: 'Youth', BIBLE_STUDY: 'Bible Study', MUSIC: 'Music', OTHER: 'Other',
};
const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
function formatLocation(loc: EventLocation) {
  const place = loc.city ?? loc.country ?? '';
  const type = loc.type === 'PHYSICAL' ? 'In-Person' : loc.type === 'VIRTUAL' ? 'Online' : 'Hybrid';
  return place ? `${place} (${type})` : type;
}
function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

type SortKey = 'title' | 'category' | 'date' | 'capacityLimit' | 'rsvpCount';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span className={`ml-1 inline-flex flex-col leading-none ${active ? 'text-[#1B1B1B]' : 'text-gray-300'}`}>
      <span className={`text-[8px] leading-none ${active && dir === 'asc' ? 'text-[#C9A96E]' : ''}`}>▲</span>
      <span className={`text-[8px] leading-none ${active && dir === 'desc' ? 'text-[#C9A96E]' : ''}`}>▼</span>
    </span>
  );
}

export default function OrgEventsPage() {
  const [activeTab, setActiveTab] = useState('Active Events');
  const tabs = ['Active Events', 'Draft Events', 'Recurring Events'];
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);

  const { data, loading, error } = useQuery(MY_ORG_EVENTS);

  const allEvents: OrgEvent[] = (data?.myOrganisations ?? []).flatMap(
    (org: { events: { edges: OrgEvent[] } }) => org.events?.edges ?? [],
  );

  const filtered = allEvents.filter((e) => {
    if (activeTab === 'Active Events')    return e.status === 'PUBLISHED';
    if (activeTab === 'Draft Events')     return e.status === 'DRAFT';
    if (activeTab === 'Recurring Events') return e.isRecurring;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'title')         cmp = a.title.localeCompare(b.title);
    else if (sortKey === 'category') cmp = a.category.localeCompare(b.category);
    else if (sortKey === 'date')     cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    else if (sortKey === 'capacityLimit') cmp = (a.capacityLimit ?? 0) - (b.capacityLimit ?? 0);
    else if (sortKey === 'rsvpCount')     cmp = a.rsvpCount - b.rsvpCount;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setPage(0);
  }

  const startRow = sorted.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const endRow = Math.min((page + 1) * PAGE_SIZE, sorted.length);

  function ColHeader({ label, sortable, sk }: { label: string; sortable?: SortKey; sk?: SortKey }) {
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
    <div className="font-sans w-full max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-serif font-bold text-[#1B1B1B] mb-6">Events Manager</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="px-6 pt-4 flex items-center gap-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-[#1B1B1B]' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#1B1B1B]" />}
            </button>
          ))}
        </div>

        {/* Table Header */}
        <div className="bg-[#FAF6ED] px-6 py-4 border-b border-gray-200 grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center">
          <ColHeader label="Listing Details" sortable="title" />
          <ColHeader label="Category"        sortable="category" />
          <ColHeader label="Frequency" />
          <ColHeader label="Date"            sortable="date" />
          <ColHeader label="Capacity"        sortable="capacityLimit" />
          <ColHeader label="RSVPs"           sortable="rsvpCount" />
          <div className="w-6" />
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading events...</div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 text-sm text-red-500">{error.message}</div>
        )}
        {!loading && !error && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm font-semibold text-gray-600">No events here</p>
            <p className="text-xs text-gray-400">Create your first event from the Overview page.</p>
          </div>
        )}

        {/* Rows */}
        {!loading && !error && paginated.length > 0 && (
          <div className="flex flex-col">
            {paginated.map((item, index) => (
              <div
                key={item.id}
                className={`px-6 py-4 grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center ${
                  index !== paginated.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-[#EAEAF5] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#1B1B1B]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1B1B1B] text-[14px] leading-snug">{item.title}</h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">{formatLocation(item.location)}</p>
                  </div>
                </div>
                <div className="text-[13px] text-gray-500">{CATEGORY_LABEL[item.category] ?? item.category}</div>
                <div className="text-[13px] text-gray-500">{item.isRecurring ? 'Recurring' : 'One-time'}</div>
                <div className="text-[13px] text-gray-500">{formatDate(item.date)}</div>
                <div className="text-[13px] text-gray-500">{item.capacityLimit ? `${item.capacityLimit} PAX` : '—'}</div>
                <div className="text-[13px] text-gray-500">
                  <strong className="text-[#1B1B1B] font-bold">{formatCount(item.rsvpCount)}</strong> RSVPs
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
              Showing <span className="font-semibold text-gray-600">{startRow}–{endRow}</span> of <span className="font-semibold text-gray-600">{sorted.length}</span> events
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
      </div>
    </div>
  );
}
