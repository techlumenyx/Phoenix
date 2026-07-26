import { gql, useMutation, useQuery } from '@apollo/client';
import { FormEvent, useState } from 'react';
import { formatDate, StatusBadge } from './moderation/ModerationQueuePage';

const QUERY = gql`
  query EmailDeliveries($status: EmailDeliveryStatus, $search: String, $after: String) {
    emailDeliveryConfiguration { enabled provider webhookConfigured }
    emailDeliveries(status: $status, search: $search, after: $after, limit: 25) {
      edges { id templateKey to subject status provider providerMessageId error attemptCount sourceService sourceEntityType sourceEntityId queuedAt sentAt createdAt events { event occurredAt response } }
      hasNextPage
      endCursor
    }
  }
`;
const RETRY = gql`mutation RetryEmailDelivery($id: ID!) { retryEmailDelivery(id: $id) { id status attemptCount queuedAt error } }`;
const SEND_TEST = gql`mutation SendTestEmail($to: String!) { sendTestEmail(to: $to) { id status to subject createdAt } }`;

type Delivery = {
  id: string; templateKey: string; to: string; subject: string; status: string; provider: string;
  providerMessageId: string | null; error: string | null; attemptCount: number; sourceService: string | null;
  sourceEntityType: string | null; sourceEntityId: string | null; queuedAt: string | null; sentAt: string | null;
  createdAt: string; events: Array<{ event: string; occurredAt: string; response: string | null }>;
};
type QueryData = {
  emailDeliveryConfiguration: { enabled: boolean; provider: string; webhookConfigured: boolean };
  emailDeliveries: { edges: Delivery[]; hasNextPage: boolean; endCursor: string | null };
};

export default function EmailDeliveriesPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const { data, loading, error, refetch, fetchMore } = useQuery<QueryData>(QUERY, {
    variables: { status: status || null, search: search.trim() || null }, fetchPolicy: 'network-only',
  });
  const [retry, { loading: retrying }] = useMutation(RETRY, { onCompleted: () => void refetch() });
  const [sendTest, { loading: sendingTest }] = useMutation(SEND_TEST, {
    onCompleted: ({ sendTestEmail }) => {
      setMessage({ tone: 'success', text: `Test queued for ${sendTestEmail.to}. Track it below until it reaches Sent.` });
      setTestOpen(false); setTestEmail(''); void refetch();
    },
    onError: (mutationError) => setMessage({ tone: 'error', text: mutationError.message || 'The test email could not be queued.' }),
  });
  const connection = data?.emailDeliveries;
  const configuration = data?.emailDeliveryConfiguration;

  function submitTest(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    void sendTest({ variables: { to: testEmail.trim() } });
  }

  return <div className="mx-auto max-w-[1400px]">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
      <div><p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-500">Messaging operations</p><h2 className="mt-1 text-2xl font-semibold">Email delivery</h2><p className="mt-1 text-sm text-slate-600">Transactional messages, provider outcomes, and controlled retries.</p></div>
      <div className="flex gap-2"><button type="button" disabled={!configuration?.enabled} onClick={() => { setMessage(null); setTestOpen(true); }} title={!configuration?.enabled ? 'Enable email delivery before sending a test' : undefined} className="h-9 rounded bg-[#0C66E4] px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Send test email</button><button type="button" onClick={() => void refetch()} className="h-9 rounded border bg-white px-3 text-sm font-semibold">Refresh</button></div>
    </div>
    {configuration && <ConfigurationBanner configuration={configuration} />}
    {message && <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${message.tone === 'success' ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-800'}`}>{message.text}</div>}
    <div className="mt-5 flex flex-wrap gap-3 rounded-lg border bg-white p-4"><input aria-label="Search email deliveries" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void refetch()} placeholder="Recipient, subject, or message ID" className="h-9 min-w-[280px] flex-1 rounded border px-3 text-sm" /><select aria-label="Delivery status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded border bg-white px-3 text-sm"><option value="">All statuses</option>{['QUEUED', 'ACCEPTED', 'SENT', 'FAILED', 'SUPPRESSED'].map((value) => <option key={value}>{value}</option>)}</select></div>
    {loading && !connection ? <State text="Loading email deliveries…" /> : error ? <State text="Email delivery history could not be loaded." /> : !connection?.edges.length ? <State text="No email deliveries match these filters." /> : <DeliveryTable connection={connection} retrying={retrying} onInspect={setSelected} onRetry={(id) => void retry({ variables: { id } })} onLoadMore={() => void fetchMore({ variables: { after: connection.endCursor }, updateQuery: (previous, { fetchMoreResult }) => ({ emailDeliveryConfiguration: fetchMoreResult.emailDeliveryConfiguration ?? previous.emailDeliveryConfiguration, emailDeliveries: { ...fetchMoreResult.emailDeliveries, edges: [...previous.emailDeliveries.edges, ...fetchMoreResult.emailDeliveries.edges] } }) })} />}
    {testOpen && <TestEmailDialog email={testEmail} busy={sendingTest} onEmail={setTestEmail} onClose={() => setTestOpen(false)} onSubmit={submitTest} />}
    {selected && <DeliveryDialog delivery={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function ConfigurationBanner({ configuration }: { configuration: QueryData['emailDeliveryConfiguration'] }) {
  const ready = configuration.enabled && configuration.webhookConfigured;
  const styles = ready ? 'border-green-200 bg-green-50 text-green-900' : configuration.enabled ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-700';
  const detail = configuration.enabled ? configuration.webhookConfigured ? 'Worker delivery and signed outcome tracking can now be tested.' : 'Configure the signed SendGrid event webhook before production traffic.' : 'Email intents are safely suppressed. Configure SendGrid before enabling delivery.';
  return <div className={`mt-5 rounded-lg border p-4 text-sm ${styles}`}><strong>{configuration.enabled ? `${label(configuration.provider)} delivery enabled` : 'Email delivery disabled'}</strong><span className="ml-2">{detail}</span></div>;
}

function DeliveryTable({ connection, retrying, onInspect, onRetry, onLoadMore }: { connection: QueryData['emailDeliveries']; retrying: boolean; onInspect: (item: Delivery) => void; onRetry: (id: string) => void; onLoadMore: () => void }) {
  return <section className="mt-5 overflow-x-auto rounded-lg border bg-white"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#F7F8FA] text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Created</th><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Template</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y">{connection.edges.map((item) => <tr key={item.id}><td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDate(item.createdAt)}</td><td className="px-4 py-3"><p className="font-semibold">{item.to}</p><p className="mt-1 max-w-[360px] truncate text-xs text-slate-500">{item.subject}</p></td><td className="px-4 py-3 font-mono text-xs">{label(item.templateKey)}</td><td className="px-4 py-3"><StatusBadge value={item.status} /></td><td className="px-4 py-3">{item.attemptCount}</td><td className="px-4 py-3"><button type="button" onClick={() => onInspect(item)} className="mr-3 text-sm font-semibold text-blue-700">Inspect</button>{item.status === 'FAILED' && <button type="button" disabled={retrying} onClick={() => onRetry(item.id)} className="text-sm font-semibold text-blue-700 disabled:opacity-50">Retry</button>}</td></tr>)}</tbody></table>{connection.hasNextPage && <div className="border-t p-4 text-center"><button type="button" onClick={onLoadMore} className="rounded border px-4 py-2 text-sm font-semibold">Load more</button></div>}</section>;
}

function TestEmailDialog({ email, busy, onEmail, onClose, onSubmit }: { email: string; busy: boolean; onEmail: (value: string) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <div role="dialog" aria-modal="true" aria-label="Send test email" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}><form onSubmit={onSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"><h3 className="text-lg font-semibold">Send controlled test</h3><p className="mt-2 text-sm leading-6 text-slate-600">Use an inbox you control. The result should progress from Queued to Accepted and then Sent after SendGrid posts its signed webhook event.</p><label className="mt-5 block text-sm font-semibold text-slate-700">Recipient email<input required type="email" autoFocus value={email} onChange={(event) => onEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-10 w-full rounded border px-3 font-normal outline-none focus:border-blue-500" /></label><div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="h-9 rounded border px-4 text-sm font-semibold">Cancel</button><button type="submit" disabled={busy || !email.trim()} className="h-9 rounded bg-[#0C66E4] px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Queuing…' : 'Send test'}</button></div></form></div>;
}

function DeliveryDialog({ delivery, onClose }: { delivery: Delivery; onClose: () => void }) {
  return <div role="dialog" aria-modal="true" aria-label="Email delivery details" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"><div className="flex items-start justify-between border-b p-5"><div><h3 className="text-lg font-semibold">{delivery.subject}</h3><p className="mt-1 text-sm text-slate-500">{delivery.to}</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded p-2 text-slate-500">×</button></div><dl className="grid gap-px bg-slate-200 sm:grid-cols-2">{[['Template', label(delivery.templateKey)], ['Status', delivery.status], ['Provider message ID', delivery.providerMessageId ?? '—'], ['Source', [delivery.sourceService, delivery.sourceEntityType, delivery.sourceEntityId].filter(Boolean).join(' / ') || '—']].map(([name, value]) => <div key={name} className="bg-white p-4"><dt className="text-[11px] font-semibold uppercase text-slate-500">{name}</dt><dd className="mt-1 break-all text-sm">{value}</dd></div>)}</dl>{delivery.error && <div className="m-5 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">{delivery.error}</div>}<div className="p-5"><h4 className="text-sm font-semibold">Provider events</h4>{delivery.events.length ? <div className="mt-3 divide-y rounded border">{delivery.events.map((item, index) => <div key={`${item.event}-${index}`} className="p-3"><div className="flex justify-between gap-3"><span className="font-semibold">{label(item.event)}</span><span className="text-xs text-slate-500">{formatDate(item.occurredAt)}</span></div>{item.response && <p className="mt-1 text-xs text-slate-600">{item.response}</p>}</div>)}</div> : <p className="mt-2 text-sm text-slate-500">No provider webhook events recorded yet.</p>}</div></div></div>;
}

function State({ text }: { text: string }) { return <p className="mt-5 rounded-lg border bg-white p-14 text-center text-sm text-slate-500">{text}</p>; }
function label(value: string) { return value.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (char) => char.toUpperCase()); }
