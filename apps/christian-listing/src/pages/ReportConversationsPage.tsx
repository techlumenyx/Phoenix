import { gql, useMutation, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

const MY_ORGANISATION = gql`query ReportCommunicationOrganisation { myOrganisations { id name } }`;
const MY_REPORTS = gql`
  query MyReportConversations { myReportConversations { id caseId audience subject targetId targetType targetTitle status unread lastMessageAt updatedAt } }
`;
const ORG_REPORTS = gql`
  query OrganisationReportConversations($organisationId: ID!) { organisationReportConversations(organisationId: $organisationId) { id caseId audience subject targetId targetType targetTitle status unread lastMessageAt updatedAt } }
`;
const REPORT_THREAD = gql`
  query ReportConversationThread($id: ID!) { reportConversation(id: $id) { id subject targetId targetType targetTitle status unread messages { id authorType body templateKey createdAt } appeals { id body status decisionReason decidedAt createdAt } } }
`;
const REPLY = gql`mutation ReplyToReportConversation($conversationId: ID!, $body: String!) { sendReportConversationMessage(conversationId: $conversationId, body: $body) { id } }`;
const READ = gql`mutation ReadReportConversation($conversationId: ID!) { markReportConversationRead(conversationId: $conversationId) }`;
const APPEAL = gql`mutation AppealReportDecision($conversationId: ID!, $body: String!) { submitReportAppeal(conversationId: $conversationId, body: $body) { id status } }`;

type Summary = { id: string; subject: string; targetId: string; targetType: string; targetTitle: string; status: string; unread: boolean; lastMessageAt?: string | null; updatedAt: string };
type Thread = { id: string; subject: string; targetId: string; targetType: string; targetTitle: string; status: string; unread: boolean; messages: Array<{ id: string; authorType: string; body: string; templateKey?: string | null; createdAt: string }>; appeals: Array<{ id: string; body: string; status: string; decisionReason?: string | null; decidedAt?: string | null; createdAt: string }> };

export default function ReportConversationsPage({ organisationMode = false }: { organisationMode?: boolean }) {
  const { data: orgData } = useQuery<{ myOrganisations: Array<{ id: string; name: string }> }>(MY_ORGANISATION, { skip: !organisationMode });
  const organisationId = orgData?.myOrganisations[0]?.id;
  const memberQuery = useQuery<{ myReportConversations: Summary[] }>(MY_REPORTS, { skip: organisationMode, fetchPolicy: 'cache-and-network' });
  const orgQuery = useQuery<{ organisationReportConversations: Summary[] }>(ORG_REPORTS, { variables: { organisationId: organisationId ?? '' }, skip: !organisationMode || !organisationId, fetchPolicy: 'cache-and-network' });
  const conversations = useMemo(() => organisationMode ? orgQuery.data?.organisationReportConversations ?? [] : memberQuery.data?.myReportConversations ?? [], [organisationMode, orgQuery.data, memberQuery.data]);
  const [selectedId, setSelectedId] = useState('');
  const [reply, setReply] = useState('');
  const [appealBody, setAppealBody] = useState('');
  const [showAppeal, setShowAppeal] = useState(false);
  const [failure, setFailure] = useState('');
  useEffect(() => { if (!selectedId && conversations[0]) setSelectedId(conversations[0].id); }, [conversations, selectedId]);
  const threadQuery = useQuery<{ reportConversation: Thread | null }>(REPORT_THREAD, { variables: { id: selectedId }, skip: !selectedId, fetchPolicy: 'cache-and-network' });
  const [sendReply, { loading: sending }] = useMutation(REPLY);
  const [markRead] = useMutation(READ);
  const [appeal, { loading: appealing }] = useMutation(APPEAL);
  const thread = threadQuery.data?.reportConversation;
  async function refetchList() { if (organisationMode) await orgQuery.refetch(); else await memberQuery.refetch(); }
  useEffect(() => { if (thread?.unread) void markRead({ variables: { conversationId: thread.id } }).then(() => refetchList()); }, [thread?.id, thread?.unread]);

  async function submitReply(event: FormEvent) { event.preventDefault(); if (!reply.trim() || !thread) return; try { setFailure(''); await sendReply({ variables: { conversationId: thread.id, body: reply.trim() } }); setReply(''); await Promise.all([threadQuery.refetch(), refetchList()]); } catch { setFailure('Your reply could not be sent. Please try again.'); } }
  async function submitAppeal(event: FormEvent) { event.preventDefault(); if (!appealBody.trim() || !thread) return; try { setFailure(''); await appeal({ variables: { conversationId: thread.id, body: appealBody.trim() } }); setAppealBody(''); setShowAppeal(false); await Promise.all([threadQuery.refetch(), refetchList()]); } catch { setFailure('Your appeal could not be submitted. Check whether an appeal is already pending.'); } }
  const loading = organisationMode ? orgQuery.loading || (!orgData && !organisationId) : memberQuery.loading;
  const error = organisationMode ? orgQuery.error : memberQuery.error;

  return <main className={organisationMode ? '' : 'mx-auto max-w-7xl px-6 pb-12 pt-28 md:px-10'}>
    <header className="mb-7"><h1 className="font-serif text-4xl font-bold">{organisationMode ? 'Report communications' : 'My Reports'}</h1><p className="mt-2 text-sm text-gray-500">{organisationMode ? 'Private conversations with the Christian Listings safety team about your organisation or content.' : 'Track reports, answer clarification requests, and appeal decisions. Your identity remains private from the affected party.'}</p></header>
    {loading ? <State text="Loading report conversations…" /> : error ? <State text="Report conversations could not be loaded." /> : !conversations.length ? <State text={organisationMode ? 'The safety team has not contacted your organisation about any reports.' : 'You have not submitted any reports.'} /> :
    <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-gray-200 bg-white lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="border-b border-gray-200 lg:border-b-0 lg:border-r"><div className="divide-y">{conversations.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full p-4 text-left ${selectedId === item.id ? 'bg-[#f4eef4]' : 'hover:bg-gray-50'}`}><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold">{item.targetTitle}</p>{item.unread && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#4a1746]" aria-label="Unread" />}</div><p className="mt-1 text-xs text-gray-500">{item.targetType.replaceAll('_', ' ')} · {label(item.status)}</p><p className="mt-2 text-[11px] text-gray-400">Updated {formatDate(item.updatedAt)}</p></button>)}</div></aside>
      <section className="flex min-w-0 flex-col">{!thread ? <State text={threadQuery.loading ? 'Loading conversation…' : 'Choose a report conversation.'} /> : <><header className="border-b p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-gray-400">{thread.targetType.replaceAll('_', ' ')}</p><h2 className="mt-1 text-xl font-bold">{thread.targetTitle}</h2></div><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">{label(thread.status)}</span></div><Link to={targetHref(thread.targetType, thread.targetId)} className="mt-2 inline-block text-xs underline">View content</Link></header>
        <div className="flex-1 space-y-4 overflow-y-auto bg-[#fafafa] p-5">{thread.messages.length ? thread.messages.map((message) => <article key={message.id} className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.authorType === 'PARTICIPANT' ? 'ml-auto bg-[#302D2E] text-white' : 'bg-white shadow-sm'}`}><p className="text-[10px] font-semibold uppercase tracking-wider opacity-60">{message.authorType === 'PARTICIPANT' ? 'You' : 'Christian Listings Safety'}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{message.body}</p><time className="mt-2 block text-[10px] opacity-60">{formatDate(message.createdAt)}</time></article>) : <p className="text-center text-sm text-gray-500">Your report is queued for review. The safety team will contact you here if clarification is needed.</p>}{thread.appeals.map((item) => <article key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-semibold">Appeal · {label(item.status)}</p><p className="mt-2 text-sm">{item.body}</p>{item.decisionReason && <p className="mt-2 border-t border-amber-200 pt-2 text-sm"><strong>Decision:</strong> {item.decisionReason}</p>}</article>)}</div>
        {failure && <p role="alert" className="px-5 pt-3 text-sm text-red-700">{failure}</p>}
        <footer className="border-t p-4"><form onSubmit={submitReply} className="flex gap-3"><textarea value={reply} onChange={(event) => setReply(event.target.value)} maxLength={2000} rows={2} placeholder="Reply to the safety team" className="min-w-0 flex-1 resize-none rounded-xl border p-3 text-sm"/><button disabled={sending || !reply.trim()} className="self-end rounded-xl bg-[#302D2E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Send</button></form>{thread.status === 'RESOLVED' && !thread.appeals.some((item) => item.status === 'PENDING') && <button onClick={() => setShowAppeal(true)} className="mt-3 text-xs font-semibold text-[#4a1746] underline">Appeal this decision</button>}</footer></>}
      </section>
    </div>}
    {showAppeal && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4"><form onSubmit={submitAppeal} className="w-full max-w-lg rounded-2xl bg-white p-6"><h2 className="font-serif text-3xl font-bold">Submit an appeal</h2><p className="mt-2 text-sm text-gray-500">Explain why the decision should be reconsidered. Appeals do not expire, and submitting one does not automatically restore content.</p><textarea autoFocus required value={appealBody} onChange={(event) => setAppealBody(event.target.value)} maxLength={2000} rows={6} className="mt-5 w-full rounded-xl border p-3"/><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setShowAppeal(false)} className="rounded-full border px-5 py-2 text-sm">Cancel</button><button disabled={appealing || !appealBody.trim()} className="rounded-full bg-[#302D2E] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Submit appeal</button></div></form></div>}
  </main>;
}

function State({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-sm text-gray-500">{text}</div>; }
function label(value: string) { return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
function targetHref(type: string, id: string) { return type === 'EVENT' ? `/events/${id}` : type === 'JOB' ? `/jobs/${id}` : type === 'MARKETPLACE_ITEM' ? `/marketplace/${id}` : type === 'ORGANISATION' ? `/organisations/${id}` : '/'; }
