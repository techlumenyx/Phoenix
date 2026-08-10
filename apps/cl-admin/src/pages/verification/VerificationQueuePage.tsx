import { gql, useQuery } from '@apollo/client';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AdminPagination, SortableHeader, useAdminTableState, useClampAdminPage } from '../../components/AdminTableControls';
import { formatDate, label, StatusBadge } from '../moderation/ModerationQueuePage';

const VERIFICATIONS = gql`query AdminVerifications($status: VerificationReviewStatus, $search: String, $limit: Int, $offset: Int, $sortBy: String, $sortDirection: AdminSortDirection) { verificationSubmissions(status: $status, search: $search, limit: $limit, offset: $offset, sortBy: $sortBy, sortDirection: $sortDirection) { edges { id organisationId organisationName version status requestedTier assigneeFirebaseUid dueAt createdAt } totalCount hasNextPage endCursor } }`;
type Row = { id: string; organisationId: string; organisationName: string; version: number; status: string; requestedTier: string; assigneeFirebaseUid: string | null; dueAt: string; createdAt: string };
type Data = { verificationSubmissions: { edges: Row[]; totalCount: number; hasNextPage: boolean; endCursor: string | null } };

export default function VerificationQueuePage() {
  const table = useAdminTableState('dueAt', 'ASC');
  const status = table.get('status');
  const [input, setInput] = useState(table.search);
  useEffect(() => setInput(table.search), [table.search]);
  const { data, loading, error, refetch } = useQuery<Data>(VERIFICATIONS, { variables: { status: status || null, search: table.search || null, limit: table.pageSize, offset: table.offset, sortBy: table.sortBy, sortDirection: table.sortDirection }, notifyOnNetworkStatusChange: true });
  const rows = data?.verificationSubmissions.edges ?? [];
  useClampAdminPage(data?.verificationSubmissions.totalCount, table.page, table.pageSize, table.setPage);
  function submit(event: FormEvent) { event.preventDefault(); table.setSearch(input.trim()); }

  return <div className="mx-auto max-w-[1440px]">
    <div className="flex flex-col justify-between gap-4 border-b border-[#DFE1E6] pb-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-500">Identity assurance</p><h2 className="mt-1 text-2xl font-semibold">Organisation verification</h2><p className="mt-1 text-sm text-slate-600">Review versioned submissions against a three-day operational SLA.</p></div><button onClick={() => void refetch()} className="h-9 rounded border border-[#B7BEC8] bg-white px-3 text-sm font-semibold">Refresh</button></div>
    <div className="mt-5 flex flex-col gap-3 rounded-t-lg border border-[#DFE1E6] bg-white p-3 md:flex-row"><form onSubmit={submit} className="flex flex-1 gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} className="h-9 flex-1 rounded border border-[#B7BEC8] px-3 text-sm" placeholder="Search organisation or registration number" /><button className="rounded bg-[#0C66E4] px-4 text-sm font-semibold text-white">Search</button></form><select value={status} onChange={(event) => table.update({ status: event.target.value })} className="h-9 rounded border border-[#B7BEC8] px-2 text-sm"><option value="">All statuses</option><option value="PENDING_REVIEW">Pending review</option><option value="NEEDS_INFORMATION">Needs information</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></div>
    <div className="overflow-hidden rounded-b-lg border-x border-b border-[#DFE1E6] bg-white">
      {loading && !rows.length ? <State text="Loading verification work…" /> : error ? <State text="Verification submissions could not be loaded." /> : !rows.length ? <State text="No submissions match this view." /> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#F7F8FA] text-[11px] uppercase text-slate-500"><tr><SortableHeader field="organisationName" label="Organisation" activeField={table.sortBy} direction={table.sortDirection} onSort={table.setSort} /><SortableHeader field="status" label="Status" activeField={table.sortBy} direction={table.sortDirection} onSort={table.setSort} /><th className="px-4 py-3">Tier</th><th className="px-4 py-3">Version</th><th className="px-4 py-3">Assignee</th><SortableHeader field="dueAt" label="SLA due" activeField={table.sortBy} direction={table.sortDirection} onSort={table.setSort} /></tr></thead><tbody className="divide-y divide-[#EBECF0]">{rows.map((row) => <tr key={row.id} className="hover:bg-[#F7F8FA]"><td className="px-4 py-3"><Link to={`/verifications/${row.id}`} className="font-semibold text-blue-700 hover:underline">{row.organisationName}</Link><p className="text-xs text-slate-500">{row.organisationId}</p></td><td className="px-4 py-3"><StatusBadge value={row.status} /></td><td className="px-4 py-3 text-xs font-semibold">{label(row.requestedTier)}</td><td className="px-4 py-3">v{row.version}</td><td className="px-4 py-3 text-xs">{row.assigneeFirebaseUid ?? 'Unassigned'}</td><td className={`px-4 py-3 text-xs ${row.status === 'PENDING_REVIEW' && new Date(row.dueAt) < new Date() ? 'font-semibold text-red-700' : ''}`}>{formatDate(row.dueAt)}</td></tr>)}</tbody></table></div>}
      {data?.verificationSubmissions && <AdminPagination totalCount={data.verificationSubmissions.totalCount} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />}
    </div>
  </div>;
}
function State({ text }: { text: string }) { return <p className="px-6 py-16 text-center text-sm text-slate-500">{text}</p>; }
