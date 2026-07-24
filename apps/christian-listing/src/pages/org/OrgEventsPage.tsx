import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CANCEL_EVENT, MY_ORG_EVENTS } from '../../graphql/mutations';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { useToast } from '../../components/ui/ToastProvider';
import { CreateEventForm, type ManagedEventFormItem, type ManagedFormMode } from './OrgOverviewPage';

interface EventLocation { type: string; address?: string | null; city?: string | null; country?: string | null; virtualLink?: string | null; }
interface OrgEvent extends ManagedEventFormItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: EventLocation;
  rsvpCount: number;
  capacityLimit: number | null;
  status: string;
  isRecurring: boolean;
  seriesId?: string | null;
  occurrenceNumber?: number | null;
  isSeriesException: boolean;
  series?: ManagedEventFormItem['series'];
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
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Active Events');
  const tabs = ['Active Events', 'Draft Events', 'Recurring Events'];
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);

  const { data, loading, error, refetch } = useQuery(MY_ORG_EVENTS);
  const organisationId = data?.myOrganisations?.[0]?.id as string | undefined;
  const [cancelEvent, { loading: cancelling }] = useMutation(CANCEL_EVENT);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ event: OrgEvent; scope: 'THIS_OCCURRENCE' | 'THIS_AND_FUTURE' | 'ENTIRE_SERIES' } | null>(null);
  const [formState, setFormState] = useState<{ event: OrgEvent; mode: Exclude<ManagedFormMode, 'create'>; scope: 'THIS_OCCURRENCE' | 'THIS_AND_FUTURE' | 'ENTIRE_SERIES' } | null>(null);

  function openForm(event: OrgEvent, mode: 'view' | 'edit') {
    setFormState({ event, mode, scope: 'THIS_OCCURRENCE' });
    setMenuId(null);
    window.requestAnimationFrame(() => document.getElementById('create-event')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    try {
      await cancelEvent({ variables: { id: cancelTarget.event.id, scope: cancelTarget.scope } });
      await refetch();
      showToast('Event schedule updated.', 'success');
      setCancelTarget(null);
    } catch {
      showToast('Event could not be cancelled. Please try again.', 'error');
    }
  }

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
          <div className="flex items-center justify-center py-16 text-sm text-red-500">We couldn’t load your events. Please try again.</div>
        )}
        {!loading && !error && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm font-semibold text-gray-600">No events here</p>
            <p className="text-xs text-gray-400">Use the form below to create your first event.</p>
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
                <div className="text-[13px] text-gray-500">{item.isRecurring ? `${item.series?.recurrence.frequency === 'MONTHLY' ? 'Monthly' : 'Weekly'}${item.series?.recurrence.interval && item.series.recurrence.interval > 1 ? ` / ${item.series.recurrence.interval}` : ''}` : 'One-time'}</div>
                <div className="text-[13px] text-gray-500">{formatDate(item.date)}</div>
                <div className="text-[13px] text-gray-500">{item.capacityLimit ? `${item.capacityLimit} PAX` : '—'}</div>
                <div className="text-[13px] text-gray-500">
                  <strong className="text-[#1B1B1B] font-bold">{formatCount(item.rsvpCount)}</strong> RSVPs
                </div>
                <div className="relative"><button onClick={() => setMenuId((current) => current === item.id ? null : item.id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>{menuId === item.id && <div className="absolute right-0 top-9 z-20 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"><button onClick={() => openForm(item, 'view')} className="block w-full px-4 py-2.5 text-left text-xs hover:bg-gray-50">View event</button><button onClick={() => openForm(item, 'edit')} className="block w-full px-4 py-2.5 text-left text-xs hover:bg-gray-50">Edit event or series</button><button onClick={() => { setCancelTarget({ event: item, scope: 'THIS_OCCURRENCE' }); setMenuId(null); }} className="block w-full px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50">Cancel this occurrence</button>{item.isRecurring && <><button onClick={() => { setCancelTarget({ event: item, scope: 'THIS_AND_FUTURE' }); setMenuId(null); }} className="block w-full px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50">Cancel this and future</button><button onClick={() => { setCancelTarget({ event: item, scope: 'ENTIRE_SERIES' }); setMenuId(null); }} className="block w-full px-4 py-2.5 text-left text-xs text-red-700 hover:bg-red-50">Cancel entire series</button></>}</div>}</div>
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
      <section id="create-event" className="mt-8 scroll-mt-24 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5"><div><h2 className="font-serif text-2xl font-bold text-[#1B1B1B]">{formState?.mode === 'view' ? 'View Event' : formState?.mode === 'edit' ? 'Edit Event' : 'Create an Event'}</h2><p className="mt-1 text-sm text-gray-500">{formState ? 'Review the complete event record using the same publishing form.' : 'Publish a one-time event or manage a recurring series.'}</p></div>{formState && <div className="flex gap-2">{formState.mode === 'view' && <button type="button" onClick={() => setFormState((current) => current ? { ...current, mode: 'edit' } : current)} className="rounded-lg bg-[#1B1B1B] px-4 py-2 text-sm font-semibold text-white">Edit</button>}<button type="button" onClick={() => setFormState(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold">Close</button></div>}</div>
        {formState?.mode === 'edit' && formState.event.isRecurring && <div className="border-b border-gray-100 bg-[#FAF6ED] px-6 py-4"><label className="text-sm font-semibold text-gray-700">Apply changes to <select value={formState.scope} onChange={(event) => setFormState((current) => current ? { ...current, scope: event.target.value as typeof current.scope } : current)} className="ml-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"><option value="THIS_OCCURRENCE">This occurrence</option><option value="THIS_AND_FUTURE">This and future occurrences</option><option value="ENTIRE_SERIES">Entire series</option></select></label></div>}
        <div className="px-6 py-6"><CreateEventForm key={`${formState?.mode ?? 'create'}:${formState?.event.id ?? 'new'}`} orgId={organisationId} mode={formState?.mode ?? 'create'} item={formState?.event} updateScope={formState?.scope} onCreated={() => { void refetch(); }} onSaved={() => { void refetch(); showToast('Event details updated.', 'success'); setFormState(null); }} /></div>
      </section>
      <ConfirmationDialog open={Boolean(cancelTarget)} title={cancelTarget?.scope === 'THIS_OCCURRENCE' ? 'Cancel this occurrence?' : cancelTarget?.scope === 'THIS_AND_FUTURE' ? 'Cancel this and future occurrences?' : 'Cancel the entire series?'} description="Cancelled occurrences remain in the event history and existing RSVP records are retained." confirmLabel="Cancel event" tone="danger" busy={cancelling} onClose={() => setCancelTarget(null)} onConfirm={confirmCancel} />
    </div>
  );
}
