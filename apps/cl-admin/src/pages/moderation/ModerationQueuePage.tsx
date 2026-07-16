import { gql, useQuery } from '@apollo/client';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

const MODERATION_CASES = gql`
  query AdminModerationCases(
    $status: ModerationCaseStatus
    $priority: ModerationPriority
    $search: String
    $limit: Int
    $after: String
  ) {
    moderationCases(status: $status, priority: $priority, search: $search, limit: $limit, after: $after) {
      edges {
        id
        targetId
        targetType
        title
        status
        priority
        reportCount
        reasonCodes
        assigneeFirebaseUid
        targetStatus
        updatedAt
        createdAt
      }
      hasNextPage
      endCursor
    }
  }
`;

type CaseRow = {
  id: string;
  targetId: string;
  targetType: string;
  title: string;
  status: string;
  priority: string;
  reportCount: number;
  reasonCodes: string[];
  assigneeFirebaseUid: string | null;
  targetStatus: string;
  updatedAt: string;
  createdAt: string;
};

type CasesData = { moderationCases: { edges: CaseRow[]; hasNextPage: boolean; endCursor: string | null } };

export default function ModerationQueuePage() {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, error, fetchMore, refetch } = useQuery<CasesData>(MODERATION_CASES, {
    variables: { status: status || null, priority: priority || null, search: search || null, limit: 25, after: null },
    notifyOnNetworkStatusChange: true,
  });

  const cases = data?.moderationCases.edges ?? [];

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 border-b border-[#DFE1E6] pb-5 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Trust and safety</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Moderation queue</h2><p className="mt-1 text-sm text-slate-600">Review community reports, investigate context, and record consistent decisions.</p></div>
        <button type="button" onClick={() => void refetch()} className="h-9 w-fit rounded border border-[#B7BEC8] bg-white px-3 text-sm font-semibold hover:bg-slate-50">Refresh</button>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-t-lg border border-[#DFE1E6] bg-white p-3 lg:flex-row lg:items-center">
        <form onSubmit={submitSearch} className="flex min-w-0 flex-1 gap-2">
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search title, target ID, or owner ID" aria-label="Search moderation cases" className="h-9 min-w-0 flex-1 rounded border border-[#B7BEC8] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
          <button className="h-9 rounded bg-[#0C66E4] px-4 text-sm font-semibold text-white hover:bg-blue-700">Search</button>
        </form>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded border border-[#B7BEC8] bg-white px-2 text-sm text-[#172B4D]"><option value="">All</option><option value="OPEN">Open</option><option value="PENDING_REVIEW">Pending review</option><option value="RESOLVED">Resolved</option></select>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">Priority
          <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-9 rounded border border-[#B7BEC8] bg-white px-2 text-sm text-[#172B4D]"><option value="">All</option><option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="NORMAL">Normal</option></select>
        </label>
      </div>

      <div className="overflow-hidden rounded-b-lg border-x border-b border-[#DFE1E6] bg-white">
        {loading && cases.length === 0 ? <QueueState title="Loading moderation work…" /> : error ? <QueueState title="Moderation cases could not be loaded" detail={error.message} action={() => void refetch()} /> : cases.length === 0 ? <QueueState title="No cases match this view" detail="New marketplace reports will appear here." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <caption className="sr-only">Marketplace moderation cases</caption>
              <thead className="bg-[#F7F8FA] text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Case</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Priority</th><th className="px-4 py-3 font-semibold">Reports</th><th className="px-4 py-3 font-semibold">Reasons</th><th className="px-4 py-3 font-semibold">Assignee</th><th className="px-4 py-3 font-semibold">Updated</th></tr></thead>
              <tbody className="divide-y divide-[#EBECF0]">{cases.map((item) => <tr key={item.id} className="hover:bg-[#F7F8FA]"><td className="px-4 py-3"><Link to={`/moderation/${item.id}`} className="font-semibold text-blue-700 hover:underline">{item.title}</Link><p className="mt-0.5 text-xs text-slate-500">{item.targetType.replaceAll('_', ' ')} · {item.targetId}</p></td><td className="px-4 py-3"><StatusBadge value={item.status} /></td><td className="px-4 py-3"><PriorityBadge value={item.priority} /></td><td className="px-4 py-3 font-semibold">{item.reportCount}</td><td className="max-w-56 px-4 py-3 text-xs text-slate-600">{item.reasonCodes.map(label).join(', ')}</td><td className="px-4 py-3 text-xs text-slate-600">{item.assigneeFirebaseUid ?? 'Unassigned'}</td><td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatDate(item.updatedAt)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        {data?.moderationCases.hasNextPage && <div className="border-t border-[#DFE1E6] p-3 text-center"><button type="button" disabled={loading} onClick={() => void fetchMore({ variables: { after: data.moderationCases.endCursor }, updateQuery: (previous, { fetchMoreResult }) => fetchMoreResult ? { moderationCases: { ...fetchMoreResult.moderationCases, edges: [...previous.moderationCases.edges, ...fetchMoreResult.moderationCases.edges] } } : previous })} className="h-9 rounded border border-[#B7BEC8] px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60">{loading ? 'Loading…' : 'Load more'}</button></div>}
      </div>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const style = value === 'RESOLVED' ? 'bg-green-50 text-green-800 border-green-200' : value === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200';
  return <span className={`inline-flex rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${style}`}>{label(value)}</span>;
}

export function PriorityBadge({ value }: { value: string }) {
  const style = value === 'CRITICAL' ? 'text-red-700' : value === 'HIGH' ? 'text-amber-700' : 'text-slate-600';
  return <span className={`text-xs font-semibold ${style}`}>{label(value)}</span>;
}

function QueueState({ title, detail, action }: { title: string; detail?: string; action?: () => void }) {
  return <div className="px-6 py-16 text-center"><p className="text-sm font-semibold">{title}</p>{detail && <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{detail}</p>}{action && <button type="button" onClick={action} className="mt-4 text-sm font-semibold text-blue-700 hover:underline">Try again</button>}</div>;
}

export function label(value: string) { return value.replaceAll('_', ' ').toLowerCase().replace(/^./, (char) => char.toUpperCase()); }
export function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
