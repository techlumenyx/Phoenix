import { gql, useMutation, useQuery } from '@apollo/client';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../auth/authStore';
import { formatDate, label, PriorityBadge, StatusBadge } from './ModerationQueuePage';

const MODERATION_CASE = gql`
  query AdminModerationCase($id: ID!) {
    moderationCase(id: $id) {
      id targetId targetType title ownerFirebaseUid organisationId status priority reportCount reasonCodes
      assigneeFirebaseUid targetStatus previousStatus resolutionAction resolutionReason resolvedByFirebaseUid
      resolvedAt version createdAt updatedAt
      reports { id reporterFirebaseUid reasonCode details createdAt }
      notes { id authorFirebaseUid body createdAt updatedAt }
      auditTimeline { id adminFirebaseUid action reason beforeStatus afterStatus requestId createdAt }
    }
  }
`;
const ASSIGN_CASE = gql`mutation AssignAdminModerationCase($id: ID!, $assigneeFirebaseUid: String, $expectedVersion: Int!) { assignModerationCase(id: $id, assigneeFirebaseUid: $assigneeFirebaseUid, expectedVersion: $expectedVersion) { id assigneeFirebaseUid version updatedAt } }`;
const ADD_NOTE = gql`mutation AddAdminModerationNote($caseId: ID!, $body: String!) { addModerationCaseNote(caseId: $caseId, body: $body) { id authorFirebaseUid body createdAt updatedAt } }`;
const RESOLVE_CASE = gql`mutation ResolveAdminModerationCase($id: ID!, $action: ModerationAction!, $reason: String!, $expectedVersion: Int!) { resolveModerationCase(id: $id, action: $action, reason: $reason, expectedVersion: $expectedVersion) { id status targetStatus resolutionAction resolutionReason resolvedByFirebaseUid resolvedAt version updatedAt } }`;

type CaseData = { moderationCase: null | { id: string; targetId: string; targetType: string; title: string; ownerFirebaseUid: string; organisationId: string | null; status: string; priority: string; reportCount: number; reasonCodes: string[]; assigneeFirebaseUid: string | null; targetStatus: string; previousStatus: string | null; resolutionAction: string | null; resolutionReason: string | null; resolvedByFirebaseUid: string | null; resolvedAt: string | null; version: number; createdAt: string; updatedAt: string; reports: Array<{ id: string; reporterFirebaseUid: string; reasonCode: string; details: string | null; createdAt: string }>; notes: Array<{ id: string; authorFirebaseUid: string; body: string; createdAt: string; updatedAt: string }>; auditTimeline: Array<{ id: string; adminFirebaseUid: string; action: string; reason: string; beforeStatus: string | null; afterStatus: string | null; requestId: string | null; createdAt: string }> } };

export default function ModerationCasePage() {
  const { caseId = '' } = useParams();
  const admin = useAdminAuth((state) => state.admin);
  const [note, setNote] = useState('');
  const [decision, setDecision] = useState<'DISMISS' | 'WARN' | 'REMOVE' | null>(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');
  const { data, loading, error, refetch } = useQuery<CaseData>(MODERATION_CASE, { variables: { id: caseId }, skip: !caseId });
  const [assign, { loading: assigning }] = useMutation(ASSIGN_CASE);
  const [addNote, { loading: savingNote }] = useMutation(ADD_NOTE);
  const [resolve, { loading: resolving }] = useMutation(RESOLVE_CASE);
  const item = data?.moderationCase;
  const canModerate = Boolean(admin?.roles.some((role) => role === 'SUPER_ADMIN' || role === 'TRUST_SAFETY'));

  if (loading) return <CaseState title="Loading case…" />;
  if (error) return <CaseState title="Case could not be loaded" detail={error.message} action={() => void refetch()} />;
  if (!item) return <CaseState title="Moderation case not found" detail="It may have been removed or the link is invalid." />;

  async function toggleAssignment() {
    if (!item || !admin) return;
    try {
      setActionError('');
      await assign({ variables: { id: item.id, assigneeFirebaseUid: item.assigneeFirebaseUid ? null : admin.firebaseUid, expectedVersion: item.version } });
      await refetch();
    } catch (mutationError) { setActionError(errorMessage(mutationError)); }
  }

  async function submitNote(event: FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;
    try { setActionError(''); await addNote({ variables: { caseId: item?.id, body: note.trim() } }); setNote(''); await refetch(); } catch (mutationError) { setActionError(errorMessage(mutationError)); }
  }

  async function submitDecision(event: FormEvent) {
    event.preventDefault();
    if (!decision || !item) return;
    try { setActionError(''); await resolve({ variables: { id: item.id, action: decision, reason: reason.trim(), expectedVersion: item.version } }); setDecision(null); setReason(''); await refetch(); } catch (mutationError) { setActionError(errorMessage(mutationError)); }
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="border-b border-[#DFE1E6] pb-5"><Link to="/moderation" className="text-xs font-semibold text-blue-700 hover:underline">← Moderation queue</Link><div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge value={item.status} /><PriorityBadge value={item.priority} /><span className="text-xs text-slate-500">Case {item.id}</span></div><h2 className="mt-2 text-2xl font-semibold tracking-tight">{item.title}</h2><p className="mt-1 text-sm text-slate-600">{label(item.targetType)} · {item.targetId}</p></div>{canModerate && <button type="button" disabled={assigning || item.status === 'RESOLVED'} onClick={() => void toggleAssignment()} className="h-9 w-fit rounded border border-[#B7BEC8] bg-white px-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">{item.assigneeFirebaseUid ? 'Unassign' : 'Assign to me'}</button>}</div></div>
      {actionError && <div role="alert" className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</div>}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title="Case context" /><dl className="grid gap-px bg-[#DFE1E6] sm:grid-cols-2 lg:grid-cols-4"><Fact label="Reports" value={String(item.reportCount)} /><Fact label="Listing state" value={label(item.targetStatus)} /><Fact label="Owner ID" value={item.ownerFirebaseUid} /><Fact label="Organisation" value={item.organisationId ?? 'Individual seller'} /></dl><div className="border-t border-[#DFE1E6] p-5"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reason categories</p><div className="mt-2 flex flex-wrap gap-2">{item.reasonCodes.map((code) => <span key={code} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{label(code)}</span>)}</div></div></section>

          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title={`Reports (${item.reports.length})`} />{item.reports.length === 0 ? <Empty text="No report evidence is attached." /> : <div className="divide-y divide-[#EBECF0]">{item.reports.map((report) => <article key={report.id} className="p-5"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold">{label(report.reasonCode)}</p><time className="text-xs text-slate-500">{formatDate(report.createdAt)}</time></div><p className="mt-1 text-xs text-slate-500">Reporter: {report.reporterFirebaseUid}</p>{report.details && <p className="mt-3 rounded bg-[#F7F8FA] px-3 py-2 text-sm leading-6 text-slate-700">{report.details}</p>}</article>)}</div>}</section>

          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title="Internal notes" />{canModerate && <form onSubmit={submitNote} className="border-b border-[#EBECF0] p-5"><label className="text-xs font-semibold text-slate-600">Add a staff-only note<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} rows={3} className="mt-2 w-full resize-y rounded border border-[#B7BEC8] p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="Record investigation context or handoff details…" /></label><button disabled={savingNote || !note.trim()} className="mt-3 h-9 rounded bg-[#0C66E4] px-4 text-sm font-semibold text-white disabled:opacity-50">{savingNote ? 'Saving…' : 'Add note'}</button></form>}{item.notes.length === 0 ? <Empty text="No internal notes yet." /> : <div className="divide-y divide-[#EBECF0]">{item.notes.map((entry) => <article key={entry.id} className="p-5"><div className="flex justify-between gap-3"><p className="text-xs font-semibold">{entry.authorFirebaseUid}</p><time className="text-xs text-slate-500">{formatDate(entry.createdAt)}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{entry.body}</p></article>)}</div>}</section>

          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title="Audit timeline" />{item.auditTimeline.length === 0 ? <Empty text="No moderation decision has been recorded." /> : <div className="divide-y divide-[#EBECF0]">{item.auditTimeline.map((entry) => <article key={entry.id} className="p-5"><div className="flex justify-between gap-3"><p className="text-sm font-semibold">{label(entry.action)}</p><time className="text-xs text-slate-500">{formatDate(entry.createdAt)}</time></div><p className="mt-1 text-xs text-slate-500">{entry.adminFirebaseUid} · {entry.beforeStatus ?? 'unknown'} → {entry.afterStatus ?? 'unknown'}</p><p className="mt-2 text-sm text-slate-700">{entry.reason}</p></article>)}</div>}</section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <section className="rounded-lg border border-[#DFE1E6] bg-white p-5"><h3 className="text-sm font-semibold">Ownership</h3><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Assignee</p><p className="mt-1 break-all text-sm">{item.assigneeFirebaseUid ?? 'Unassigned'}</p><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Opened</p><p className="mt-1 text-sm">{formatDate(item.createdAt)}</p><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Last updated</p><p className="mt-1 text-sm">{formatDate(item.updatedAt)}</p></section>
          {item.status === 'RESOLVED' ? <section className="rounded-lg border border-green-200 bg-green-50 p-5"><h3 className="text-sm font-semibold text-green-900">Case resolved</h3><p className="mt-2 text-sm text-green-800">{item.resolutionAction ? label(item.resolutionAction) : 'Resolved'} by {item.resolvedByFirebaseUid}</p><p className="mt-2 text-sm leading-6 text-green-900">{item.resolutionReason}</p></section> : canModerate ? <section className="rounded-lg border border-[#DFE1E6] bg-white p-5"><h3 className="text-sm font-semibold">Moderation decision</h3><p className="mt-1 text-xs leading-5 text-slate-500">A reason is required and the action will be written to the immutable audit timeline.</p><div className="mt-4 grid gap-2"><DecisionButton label="Dismiss and restore" detail="Reports are not upheld." onClick={() => setDecision('DISMISS')} /><DecisionButton label="Warn and restore" detail="Send a formal warning." onClick={() => setDecision('WARN')} /><DecisionButton label="Remove listing" detail="Keep the listing unavailable." danger onClick={() => setDecision('REMOVE')} /></div></section> : <section className="rounded-lg border border-[#DFE1E6] bg-white p-5"><h3 className="text-sm font-semibold">Read-only access</h3><p className="mt-2 text-xs leading-5 text-slate-500">Your role can review this case but cannot assign, add notes, or make a moderation decision.</p></section>}
        </aside>
      </div>

      {decision && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !resolving) setDecision(null); }}><form onSubmit={submitDecision} role="dialog" aria-modal="true" aria-labelledby="decision-title" className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"><h3 id="decision-title" className="text-lg font-semibold">Confirm: {label(decision)}</h3><p className="mt-2 text-sm leading-6 text-slate-600">This updates the listing and closes the case. The organisation will receive the reason below.</p><label className="mt-5 block text-sm font-semibold">Decision reason<textarea autoFocus required minLength={5} maxLength={1000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full resize-y rounded border border-[#B7BEC8] p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label><div className="mt-5 flex justify-end gap-3"><button type="button" disabled={resolving} onClick={() => setDecision(null)} className="h-9 rounded border border-[#B7BEC8] px-4 text-sm font-semibold">Cancel</button><button disabled={resolving || reason.trim().length < 5} className={`h-9 rounded px-4 text-sm font-semibold text-white disabled:opacity-50 ${decision === 'REMOVE' ? 'bg-red-700 hover:bg-red-800' : 'bg-[#0C66E4] hover:bg-blue-700'}`}>{resolving ? 'Applying…' : 'Confirm decision'}</button></div></form></div>}
    </div>
  );
}

function Header({ title }: { title: string }) { return <div className="border-b border-[#DFE1E6] px-5 py-4"><h3 className="text-sm font-semibold">{title}</h3></div>; }
function Fact({ label: factLabel, value }: { label: string; value: string }) { return <div className="min-w-0 bg-white px-5 py-4"><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{factLabel}</dt><dd className="mt-1 break-all text-sm font-medium">{value}</dd></div>; }
function Empty({ text }: { text: string }) { return <p className="p-5 text-sm text-slate-500">{text}</p>; }
function DecisionButton({ label: buttonLabel, detail, danger, onClick }: { label: string; detail: string; danger?: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded border p-3 text-left transition ${danger ? 'border-red-200 hover:bg-red-50' : 'border-[#DFE1E6] hover:border-blue-300 hover:bg-blue-50/40'}`}><span className={`block text-sm font-semibold ${danger ? 'text-red-800' : 'text-[#172B4D]'}`}>{buttonLabel}</span><span className="mt-1 block text-xs text-slate-500">{detail}</span></button>; }
function CaseState({ title, detail, action }: { title: string; detail?: string; action?: () => void }) { return <div className="mx-auto max-w-2xl rounded-lg border border-[#DFE1E6] bg-white px-6 py-16 text-center"><h2 className="text-lg font-semibold">{title}</h2>{detail && <p className="mt-2 text-sm text-slate-500">{detail}</p>}{action && <button type="button" onClick={action} className="mt-4 text-sm font-semibold text-blue-700">Try again</button>}</div>; }
function errorMessage(value: unknown) { return value instanceof Error ? value.message : 'The action could not be completed.'; }
