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
      conversations { id reportId audience subject status unread lastMessageAt messages { id authorType body templateKey createdAt } }
      appeals { id body status decisionReason decidedAt createdAt }
      unreadCommunicationCount
      auditTimeline { id adminFirebaseUid action reason beforeStatus afterStatus requestId createdAt }
      riskAnalyses { id status score level summary recommendedAction model reviewerVerdict createdAt signals { code confidence explanation evidenceExcerpt } }
    }
  }
`;
const ASSIGN_CASE = gql`mutation AssignAdminModerationCase($id: ID!, $assigneeFirebaseUid: String, $expectedVersion: Int!) { assignModerationCase(id: $id, assigneeFirebaseUid: $assigneeFirebaseUid, expectedVersion: $expectedVersion) { id assigneeFirebaseUid version updatedAt } }`;
const SET_PRIORITY = gql`mutation SetAdminModerationPriority($id: ID!, $priority: ModerationPriority!, $expectedVersion: Int!) { setModerationCasePriority(id: $id, priority: $priority, expectedVersion: $expectedVersion) { id priority version updatedAt } }`;
const ADD_NOTE = gql`mutation AddAdminModerationNote($caseId: ID!, $body: String!) { addModerationCaseNote(caseId: $caseId, body: $body) { id authorFirebaseUid body createdAt updatedAt } }`;
const RESOLVE_CASE = gql`mutation ResolveAdminModerationCase($id: ID!, $action: ModerationAction!, $reason: String!, $expectedVersion: Int!, $scope: EventActionScope) { resolveModerationCase(id: $id, action: $action, reason: $reason, expectedVersion: $expectedVersion, scope: $scope) { id status targetStatus resolutionAction resolutionReason resolvedByFirebaseUid resolvedAt version updatedAt } }`;
const SEND_REPORT_MESSAGE = gql`mutation SendAdminReportMessage($caseId: ID!, $audience: ReportConversationAudience!, $reportId: ID, $body: String!, $templateKey: String) { sendAdminReportMessage(caseId: $caseId, audience: $audience, reportId: $reportId, body: $body, templateKey: $templateKey) { id } }`;
const DECIDE_APPEAL = gql`mutation DecideAdminReportAppeal($appealId: ID!, $decision: ReportAppealDecision!, $reason: String!) { decideReportAppeal(appealId: $appealId, decision: $decision, reason: $reason) { id status decisionReason } }`;

type CaseData = { moderationCase: null | { id: string; targetId: string; targetType: string; title: string; ownerFirebaseUid: string; organisationId: string | null; status: string; priority: string; reportCount: number; reasonCodes: string[]; assigneeFirebaseUid: string | null; targetStatus: string; previousStatus: string | null; resolutionAction: string | null; resolutionReason: string | null; resolvedByFirebaseUid: string | null; resolvedAt: string | null; version: number; createdAt: string; updatedAt: string; reports: Array<{ id: string; reporterFirebaseUid: string; reasonCode: string; details: string | null; createdAt: string }>; notes: Array<{ id: string; authorFirebaseUid: string; body: string; createdAt: string; updatedAt: string }>; conversations: Array<{ id: string; reportId: string | null; audience: 'REPORTER' | 'OWNER'; subject: string; status: string; unread: boolean; lastMessageAt: string | null; messages: Array<{ id: string; authorType: string; body: string; templateKey: string | null; createdAt: string }> }>; appeals: Array<{ id: string; body: string; status: string; decisionReason: string | null; decidedAt: string | null; createdAt: string }>; unreadCommunicationCount: number; auditTimeline: Array<{ id: string; adminFirebaseUid: string; action: string; reason: string; beforeStatus: string | null; afterStatus: string | null; requestId: string | null; createdAt: string }>; riskAnalyses: Array<{ id: string; status: string; score: number | null; level: string | null; summary: string | null; recommendedAction: string | null; model: string; reviewerVerdict: string | null; createdAt: string; signals: Array<{ code: string; confidence: number; explanation: string; evidenceExcerpt: string | null }> }> } };

type ModerationDecision = 'DISMISS' | 'WARN' | 'REQUEST_CHANGES' | 'REMOVE' | 'RESTORE' | 'SUSPEND' | 'REACTIVATE' | 'ESCALATE' | 'RESOLVE' | 'REOPEN';
const REPORT_MESSAGE_TEMPLATES = [
  { key: 'CLARIFICATION', label: 'Request clarification', body: 'We are reviewing this report and need some additional information. Please share any relevant dates, messages, links, or other context.' },
  { key: 'CHANGES_REQUIRED', label: 'Changes required', body: 'Our review identified information that needs to be corrected before this content can be restored. Please reply with the changes you intend to make.' },
  { key: 'REVIEW_UPDATE', label: 'Review update', body: 'Your report remains under review. We will post the outcome in this conversation once the investigation is complete.' },
] as const;

export default function ModerationCasePage() {
  const { caseId = '' } = useParams();
  const admin = useAdminAuth((state) => state.admin);
  const [note, setNote] = useState('');
  const [decision, setDecision] = useState<ModerationDecision | null>(null);
  const [reason, setReason] = useState('');
  const [eventScope, setEventScope] = useState<'OCCURRENCE' | 'SERIES'>('OCCURRENCE');
  const [messageAudience, setMessageAudience] = useState<'REPORTER' | 'OWNER'>('REPORTER');
  const [messageReportId, setMessageReportId] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [actionError, setActionError] = useState('');
  const { data, loading, error, refetch } = useQuery<CaseData>(MODERATION_CASE, { variables: { id: caseId }, skip: !caseId });
  const [assign, { loading: assigning }] = useMutation(ASSIGN_CASE);
  const [setPriority, { loading: settingPriority }] = useMutation(SET_PRIORITY);
  const [addNote, { loading: savingNote }] = useMutation(ADD_NOTE);
  const [resolve, { loading: resolving }] = useMutation(RESOLVE_CASE);
  const [sendReportMessage, { loading: sendingMessage }] = useMutation(SEND_REPORT_MESSAGE);
  const [decideAppeal, { loading: decidingAppeal }] = useMutation(DECIDE_APPEAL);
  const item = data?.moderationCase;
  const canModerate = Boolean(admin?.roles.some((role) => role === 'SUPER_ADMIN' || role === 'TRUST_SAFETY' || role === 'CONTENT_MANAGER'));

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
    try { setActionError(''); await resolve({ variables: { id: item.id, action: decision, reason: reason.trim(), expectedVersion: item.version, scope: item.targetType === 'EVENT' ? eventScope : null } }); setDecision(null); setReason(''); await refetch(); } catch (mutationError) { setActionError(errorMessage(mutationError)); }
  }

  async function submitMessage(event: FormEvent) {
    event.preventDefault();
    if (!item || !messageBody.trim()) return;
    try { setActionError(''); await sendReportMessage({ variables: { caseId: item.id, audience: messageAudience, reportId: messageAudience === 'REPORTER' ? messageReportId || item.reports[0]?.id : null, body: messageBody.trim(), templateKey: messageTemplate || null } }); setMessageBody(''); setMessageTemplate(''); await refetch(); } catch (mutationError) { setActionError(errorMessage(mutationError)); }
  }

  async function reviewAppeal(appealId: string, decisionValue: 'UPHOLD' | 'OVERTURN' | 'NEEDS_INFORMATION') {
    const decisionReason = window.prompt(`Reason for ${label(decisionValue)}:`)?.trim();
    if (!decisionReason) return;
    try { setActionError(''); await decideAppeal({ variables: { appealId, decision: decisionValue, reason: decisionReason } }); await refetch(); } catch (mutationError) { setActionError(errorMessage(mutationError)); }
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="border-b border-[#DFE1E6] pb-5"><Link to="/moderation" className="text-xs font-semibold text-blue-700 hover:underline">← Moderation queue</Link><div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge value={item.status} /><PriorityBadge value={item.priority} /><span className="text-xs text-slate-500">Case {item.id}</span></div><h2 className="mt-2 text-2xl font-semibold tracking-tight">{item.title}</h2><p className="mt-1 text-sm text-slate-600">{label(item.targetType)} · {item.targetId}</p></div>{canModerate && <button type="button" disabled={assigning || item.status === 'RESOLVED'} onClick={() => void toggleAssignment()} className="h-9 w-fit rounded border border-[#B7BEC8] bg-white px-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">{item.assigneeFirebaseUid ? 'Unassign' : 'Assign to me'}</button>}</div></div>
      {actionError && <div role="alert" className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</div>}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title="Case context" /><dl className="grid gap-px bg-[#DFE1E6] sm:grid-cols-2 lg:grid-cols-4"><Fact label="Reports" value={String(item.reportCount)} /><Fact label="Listing state" value={label(item.targetStatus)} /><Fact label="Owner ID" value={item.ownerFirebaseUid} /><Fact label="Organisation" value={item.organisationId ?? 'Individual seller'} /></dl><div className="border-t border-[#DFE1E6] p-5"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reason categories</p><div className="mt-2 flex flex-wrap gap-2">{item.reasonCodes.map((code) => <span key={code} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{label(code)}</span>)}</div></div></section>

          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title={`Reports (${item.reports.length})`} />{item.reports.length === 0 ? <Empty text="No report evidence is attached." /> : <div className="divide-y divide-[#EBECF0]">{item.reports.map((report) => <article key={report.id} className="p-5"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold">{label(report.reasonCode)}</p><time className="text-xs text-slate-500">{formatDate(report.createdAt)}</time></div><p className="mt-1 text-xs text-slate-500">Reporter: {report.reporterFirebaseUid}</p>{report.details && <p className="mt-3 rounded bg-[#F7F8FA] px-3 py-2 text-sm leading-6 text-slate-700">{report.details}</p>}</article>)}</div>}</section>

          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title={`Communication (${item.unreadCommunicationCount} unread)`} />{canModerate && <form onSubmit={submitMessage} className="border-b border-[#EBECF0] p-5"><div className="grid gap-3 sm:grid-cols-3"><label className="text-xs font-semibold">Recipient<select value={messageAudience} onChange={(event) => setMessageAudience(event.target.value as 'REPORTER' | 'OWNER')} className="mt-2 w-full rounded border p-2 text-sm font-normal"><option value="REPORTER">Reporter (anonymous)</option><option value="OWNER">Affected owner</option></select></label>{messageAudience === 'REPORTER' && <label className="text-xs font-semibold">Report<select value={messageReportId || item.reports[0]?.id || ''} onChange={(event) => setMessageReportId(event.target.value)} className="mt-2 w-full rounded border p-2 text-sm font-normal">{item.reports.map((report, index) => <option key={report.id} value={report.id}>Reporter {index + 1} · {label(report.reasonCode)}</option>)}</select></label>}<label className="text-xs font-semibold">Template<select value={messageTemplate} onChange={(event) => { const key = event.target.value; setMessageTemplate(key); const template = REPORT_MESSAGE_TEMPLATES.find((item) => item.key === key); if (template) setMessageBody(template.body); }} className="mt-2 w-full rounded border p-2 text-sm font-normal"><option value="">Custom message</option>{REPORT_MESSAGE_TEMPLATES.map((template) => <option key={template.key} value={template.key}>{template.label}</option>)}</select></label></div><textarea value={messageBody} onChange={(event) => setMessageBody(event.target.value)} maxLength={2000} rows={4} className="mt-3 w-full rounded border p-3 text-sm" placeholder="Use a template or write a clarification request…"/><button disabled={sendingMessage || !messageBody.trim()} className="mt-3 rounded bg-[#0C66E4] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{sendingMessage ? 'Sending…' : 'Send message'}</button></form>}{item.conversations.length === 0 ? <Empty text="No participant communication yet." /> : <div className="divide-y">{item.conversations.map((conversation) => <article key={conversation.id} className="p-5"><div className="flex justify-between gap-3"><p className="text-sm font-semibold">{conversation.audience === 'REPORTER' ? 'Anonymous reporter channel' : 'Affected owner channel'} {conversation.unread && <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-[10px] text-red-700">Unread reply</span>}</p><span className="text-xs text-slate-500">{label(conversation.status)}</span></div><div className="mt-3 space-y-2">{conversation.messages.map((message) => <div key={message.id} className={`rounded p-3 text-sm ${message.authorType === 'PARTICIPANT' ? 'bg-amber-50' : 'bg-[#F7F8FA]'}`}><p className="text-[10px] font-semibold uppercase text-slate-500">{message.authorType}</p><p className="mt-1 whitespace-pre-wrap">{message.body}</p><time className="mt-1 block text-[10px] text-slate-400">{formatDate(message.createdAt)}</time></div>)}</div></article>)}</div>}</section>

          {item.appeals.length > 0 && <section className="rounded-lg border border-amber-200 bg-white"><Header title="Appeals" /><div className="divide-y">{item.appeals.map((appeal) => <article key={appeal.id} className="p-5"><div className="flex justify-between"><p className="text-sm font-semibold">{label(appeal.status)}</p><time className="text-xs text-slate-500">{formatDate(appeal.createdAt)}</time></div><p className="mt-3 text-sm leading-6">{appeal.body}</p>{appeal.decisionReason && <p className="mt-3 rounded bg-gray-50 p-3 text-sm"><strong>Decision:</strong> {appeal.decisionReason}</p>}{appeal.status === 'PENDING' && canModerate && <div className="mt-4 flex flex-wrap gap-2"><button disabled={decidingAppeal} onClick={() => void reviewAppeal(appeal.id, 'UPHOLD')} className="rounded border px-3 py-2 text-xs font-semibold">Uphold</button><button disabled={decidingAppeal} onClick={() => void reviewAppeal(appeal.id, 'OVERTURN')} className="rounded border px-3 py-2 text-xs font-semibold text-green-700">Overturn</button><button disabled={decidingAppeal} onClick={() => void reviewAppeal(appeal.id, 'NEEDS_INFORMATION')} className="rounded border px-3 py-2 text-xs font-semibold text-amber-700">Request information</button></div>}</article>)}</div></section>}

          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title={`AI risk analysis (${item.riskAnalyses.length})`} />{item.riskAnalyses.length === 0 ? <Empty text="No AI analysis is available for this listing. AI signals are advisory and do not affect visibility." /> : <div className="divide-y divide-[#EBECF0]">{item.riskAnalyses.map((analysis) => <article key={analysis.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><StatusBadge value={analysis.status} />{analysis.level && <PriorityBadge value={analysis.level} />}<span className="text-xs text-slate-500">Score {analysis.score ?? '—'}/100 · Shadow mode</span></div><time className="text-xs text-slate-500">{formatDate(analysis.createdAt)}</time></div>{analysis.summary && <p className="mt-3 text-sm leading-6 text-slate-700">{analysis.summary}</p>}{analysis.signals.length > 0 && <div className="mt-3 space-y-2">{analysis.signals.map((signal, index) => <div key={`${signal.code}-${index}`} className="rounded bg-purple-50/60 px-3 py-2"><p className="text-xs font-semibold text-purple-900">{label(signal.code)} · {Math.round(signal.confidence * 100)}%</p><p className="mt-1 text-xs leading-5 text-slate-700">{signal.explanation}</p>{signal.evidenceExcerpt && <p className="mt-1 text-xs italic text-slate-500">“{signal.evidenceExcerpt}”</p>}</div>)}</div>}<p className="mt-3 text-xs text-slate-500">Recommendation: {label(analysis.recommendedAction ?? 'NONE')} · Model: {analysis.model}{analysis.reviewerVerdict ? ` · Human review: ${label(analysis.reviewerVerdict)}` : ''}</p></article>)}</div>}</section>

          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title="Internal notes" />{canModerate && <form onSubmit={submitNote} className="border-b border-[#EBECF0] p-5"><label className="text-xs font-semibold text-slate-600">Add a staff-only note<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} rows={3} className="mt-2 w-full resize-y rounded border border-[#B7BEC8] p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="Record investigation context or handoff details…" /></label><button disabled={savingNote || !note.trim()} className="mt-3 h-9 rounded bg-[#0C66E4] px-4 text-sm font-semibold text-white disabled:opacity-50">{savingNote ? 'Saving…' : 'Add note'}</button></form>}{item.notes.length === 0 ? <Empty text="No internal notes yet." /> : <div className="divide-y divide-[#EBECF0]">{item.notes.map((entry) => <article key={entry.id} className="p-5"><div className="flex justify-between gap-3"><p className="text-xs font-semibold">{entry.authorFirebaseUid}</p><time className="text-xs text-slate-500">{formatDate(entry.createdAt)}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{entry.body}</p></article>)}</div>}</section>

          <section className="rounded-lg border border-[#DFE1E6] bg-white"><Header title="Audit timeline" />{item.auditTimeline.length === 0 ? <Empty text="No moderation decision has been recorded." /> : <div className="divide-y divide-[#EBECF0]">{item.auditTimeline.map((entry) => <article key={entry.id} className="p-5"><div className="flex justify-between gap-3"><p className="text-sm font-semibold">{label(entry.action)}</p><time className="text-xs text-slate-500">{formatDate(entry.createdAt)}</time></div><p className="mt-1 text-xs text-slate-500">{entry.adminFirebaseUid} · {entry.beforeStatus ?? 'unknown'} → {entry.afterStatus ?? 'unknown'}</p><p className="mt-2 text-sm text-slate-700">{entry.reason}</p></article>)}</div>}</section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <section className="rounded-lg border border-[#DFE1E6] bg-white p-5"><h3 className="text-sm font-semibold">Ownership</h3><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Assignee</p><p className="mt-1 break-all text-sm">{item.assigneeFirebaseUid ?? 'Unassigned'}</p>{canModerate && <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">Priority<select disabled={settingPriority} value={item.priority} onChange={async (event) => { try { await setPriority({ variables: { id: item.id, priority: event.target.value, expectedVersion: item.version } }); await refetch(); } catch (mutationError) { setActionError(errorMessage(mutationError)); } }} className="mt-1 w-full rounded border bg-white p-2 text-sm font-normal normal-case"><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>}<p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Opened</p><p className="mt-1 text-sm">{formatDate(item.createdAt)}</p><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Last updated</p><p className="mt-1 text-sm">{formatDate(item.updatedAt)}</p></section>
          {canModerate ? <section className="rounded-lg border border-[#DFE1E6] bg-white p-5"><h3 className="text-sm font-semibold">Moderation actions</h3><p className="mt-1 text-xs leading-5 text-slate-500">Actions update the source record where applicable and notify participants without exposing the reporter.</p><div className="mt-4 grid gap-2">{actionsFor(item.targetType, item.status).map((action) => <DecisionButton key={action} label={label(action)} detail={actionDetail(action)} danger={action === 'REMOVE' || action === 'SUSPEND'} onClick={() => setDecision(action)} />)}</div></section> : <section className="rounded-lg border border-[#DFE1E6] bg-white p-5"><h3 className="text-sm font-semibold">Read-only access</h3><p className="mt-2 text-xs leading-5 text-slate-500">Your role can review this case but cannot assign, communicate, or take action.</p></section>}
        </aside>
      </div>

      {decision && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !resolving) setDecision(null); }}><form onSubmit={submitDecision} role="dialog" aria-modal="true" aria-labelledby="decision-title" className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"><h3 id="decision-title" className="text-lg font-semibold">Confirm: {label(decision)}</h3><p className="mt-2 text-sm leading-6 text-slate-600">The action is audited. The affected party and reporters receive separate private updates.</p>{item.targetType === 'EVENT' && ['REMOVE', 'RESTORE', 'REQUEST_CHANGES'].includes(decision) && <label className="mt-5 block text-sm font-semibold">Event scope<select value={eventScope} onChange={(event) => setEventScope(event.target.value as 'OCCURRENCE' | 'SERIES')} className="mt-2 w-full rounded border border-[#B7BEC8] bg-white p-3 font-normal"><option value="OCCURRENCE">This occurrence only</option><option value="SERIES">Entire recurring series</option></select></label>}<label className="mt-5 block text-sm font-semibold">Decision reason<textarea autoFocus required minLength={5} maxLength={1000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full resize-y rounded border border-[#B7BEC8] p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label><div className="mt-5 flex justify-end gap-3"><button type="button" disabled={resolving} onClick={() => setDecision(null)} className="h-9 rounded border border-[#B7BEC8] px-4 text-sm font-semibold">Cancel</button><button disabled={resolving || reason.trim().length < 5} className={`h-9 rounded px-4 text-sm font-semibold text-white disabled:opacity-50 ${decision === 'REMOVE' || decision === 'SUSPEND' ? 'bg-red-700 hover:bg-red-800' : 'bg-[#0C66E4] hover:bg-blue-700'}`}>{resolving ? 'Applying…' : 'Confirm action'}</button></div></form></div>}
    </div>
  );
}

function Header({ title }: { title: string }) { return <div className="border-b border-[#DFE1E6] px-5 py-4"><h3 className="text-sm font-semibold">{title}</h3></div>; }
function Fact({ label: factLabel, value }: { label: string; value: string }) { return <div className="min-w-0 bg-white px-5 py-4"><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{factLabel}</dt><dd className="mt-1 break-all text-sm font-medium">{value}</dd></div>; }
function Empty({ text }: { text: string }) { return <p className="p-5 text-sm text-slate-500">{text}</p>; }
function DecisionButton({ label: buttonLabel, detail, danger, onClick }: { label: string; detail: string; danger?: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded border p-3 text-left transition ${danger ? 'border-red-200 hover:bg-red-50' : 'border-[#DFE1E6] hover:border-blue-300 hover:bg-blue-50/40'}`}><span className={`block text-sm font-semibold ${danger ? 'text-red-800' : 'text-[#172B4D]'}`}>{buttonLabel}</span><span className="mt-1 block text-xs text-slate-500">{detail}</span></button>; }
function CaseState({ title, detail, action }: { title: string; detail?: string; action?: () => void }) { return <div className="mx-auto max-w-2xl rounded-lg border border-[#DFE1E6] bg-white px-6 py-16 text-center"><h2 className="text-lg font-semibold">{title}</h2>{detail && <p className="mt-2 text-sm text-slate-500">{detail}</p>}{action && <button type="button" onClick={action} className="mt-4 text-sm font-semibold text-blue-700">Try again</button>}</div>; }
function errorMessage(value: unknown) { return value instanceof Error ? value.message : 'The action could not be completed.'; }
function actionsFor(targetType: string, status: string): ModerationDecision[] {
  if (status === 'RESOLVED') return ['REOPEN', 'RESTORE'];
  if (targetType === 'USER' || targetType === 'ORGANISATION') return ['DISMISS', 'WARN', 'SUSPEND', 'REACTIVATE', 'ESCALATE', 'RESOLVE'];
  return ['DISMISS', 'WARN', 'REQUEST_CHANGES', 'REMOVE', 'RESTORE', 'ESCALATE', 'RESOLVE'];
}
function actionDetail(action: ModerationDecision) {
  const details: Record<ModerationDecision, string> = {
    DISMISS: 'Close the report without enforcement.', WARN: 'Issue a formal warning.', REQUEST_CHANGES: 'Hide content until it is corrected.', REMOVE: 'Remove or cancel the reported content.', RESTORE: 'Restore the content after review.', SUSPEND: 'Disable the account and its public content.', REACTIVATE: 'Restore an account after review.', ESCALATE: 'Raise priority for senior safety review.', RESOLVE: 'Close the case without a domain change.', REOPEN: 'Reopen the case for investigation.',
  };
  return details[action];
}
