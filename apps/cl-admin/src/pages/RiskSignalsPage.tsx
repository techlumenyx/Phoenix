import { gql, useMutation, useQuery } from '@apollo/client';
import { useState, type FormEvent } from 'react';

const RISK_SIGNALS = gql`
  query AdminContentRiskSignals($status: RiskAnalysisStatus, $level: RiskLevel, $reviewerVerdict: RiskReviewVerdict, $limit: Int, $after: String) {
    contentRiskAnalysisConfiguration { enabled provider model mode }
    contentRiskAnalyses(status: $status, level: $level, reviewerVerdict: $reviewerVerdict, limit: $limit, after: $after) {
      edges {
        id targetId targetType title mode status provider model score level summary recommendedAction
        signals { code confidence explanation evidenceExcerpt }
        error attemptCount reviewerVerdict reviewerNote reviewedByFirebaseUid reviewedAt completedAt createdAt updatedAt
      }
      hasNextPage endCursor
    }
  }
`;
const REVIEW_SIGNAL = gql`
  mutation ReviewAdminContentRiskSignal($id: ID!, $verdict: RiskReviewVerdict!, $note: String) {
    reviewContentRiskAnalysis(id: $id, verdict: $verdict, note: $note) { id reviewerVerdict reviewerNote reviewedByFirebaseUid reviewedAt }
  }
`;
const RETRY_SIGNAL = gql`
  mutation RetryAdminContentRiskSignal($id: ID!) {
    retryContentRiskAnalysis(id: $id) { id status error attemptCount updatedAt }
  }
`;

type Analysis = {
  id: string; targetId: string; targetType: string; title: string; mode: string; status: string; provider: string; model: string;
  score: number | null; level: string | null; summary: string | null; recommendedAction: string | null;
  signals: Array<{ code: string; confidence: number; explanation: string; evidenceExcerpt: string | null }>;
  error: string | null; attemptCount: number; reviewerVerdict: string | null; reviewerNote: string | null;
  reviewedByFirebaseUid: string | null; reviewedAt: string | null; completedAt: string | null; createdAt: string; updatedAt: string;
};
type Data = {
  contentRiskAnalysisConfiguration: { enabled: boolean; provider: string; model: string; mode: string };
  contentRiskAnalyses: { edges: Analysis[]; hasNextPage: boolean; endCursor: string | null };
};

export default function RiskSignalsPage() {
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');
  const [reviewerVerdict, setReviewerVerdict] = useState('');
  const [reviewing, setReviewing] = useState<Analysis | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState('');
  const variables = { status: status || null, level: level || null, reviewerVerdict: reviewerVerdict || null, limit: 25, after: null };
  const { data, loading, error, refetch, fetchMore } = useQuery<Data>(RISK_SIGNALS, { variables, fetchPolicy: 'cache-and-network' });
  const [retry] = useMutation(RETRY_SIGNAL);
  const config = data?.contentRiskAnalysisConfiguration;
  const analyses = data?.contentRiskAnalyses.edges ?? [];

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-4 border-b border-[#DFE1E6] pb-5 lg:flex-row lg:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Trust and safety</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">AI risk signals</h2><p className="mt-1 max-w-3xl text-sm text-slate-600">Advisory marketplace text analysis. Signals never change listing visibility or make moderation decisions.</p></div>
        {config && <span className={`w-fit rounded px-3 py-1.5 text-xs font-semibold ${config.enabled ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>{config.enabled ? 'Analysis enabled' : 'Analysis disabled'} · {config.provider} · {config.model} · {config.mode}</span>}
      </div>

      <div className="mt-5 grid gap-3 rounded-lg border border-[#DFE1E6] bg-white p-4 sm:grid-cols-3">
        <Filter label="Status" value={status} onChange={setStatus} options={['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED']} />
        <Filter label="Risk level" value={level} onChange={setLevel} options={['LOW', 'MEDIUM', 'HIGH']} />
        <Filter label="Human review" value={reviewerVerdict} onChange={setReviewerVerdict} options={['ACCURATE', 'FALSE_POSITIVE', 'NEEDS_MORE_INFO']} />
      </div>

      {error && <div role="alert" className="mt-5 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">Risk signals could not be loaded. <button type="button" onClick={() => void refetch()} className="font-semibold underline">Try again</button></div>}
      {retryError && <div role="alert" className="mt-5 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">{retryError}</div>}
      {loading && analyses.length === 0 && <div className="mt-5 rounded border border-[#DFE1E6] bg-white p-10 text-center text-sm text-slate-500">Loading risk analyses…</div>}
      {!loading && !error && analyses.length === 0 && <div className="mt-5 rounded border border-dashed border-[#B7BEC8] bg-white p-12 text-center"><h3 className="font-semibold">No matching risk analyses</h3><p className="mt-2 text-sm text-slate-500">New or edited marketplace listings will appear here when analysis is enabled.</p></div>}

      <div className="mt-5 space-y-4">
        {analyses.map((analysis) => <RiskCard key={analysis.id} analysis={analysis} retrying={retryingId === analysis.id} onReview={() => setReviewing(analysis)} onRetry={async () => {
          try {
            setRetryError(''); setRetryingId(analysis.id);
            await retry({ variables: { id: analysis.id } }); await refetch();
          } catch (value) {
            setRetryError(value instanceof Error ? value.message : 'The analysis could not be retried.');
          } finally { setRetryingId(null); }
        }} />)}
      </div>
      {data?.contentRiskAnalyses.hasNextPage && <button type="button" className="mt-5 h-9 rounded border border-[#B7BEC8] bg-white px-4 text-sm font-semibold hover:bg-slate-50" onClick={() => void fetchMore({ variables: { ...variables, after: data.contentRiskAnalyses.endCursor }, updateQuery: (previous, { fetchMoreResult }) => fetchMoreResult ? ({ ...fetchMoreResult, contentRiskAnalyses: { ...fetchMoreResult.contentRiskAnalyses, edges: [...previous.contentRiskAnalyses.edges, ...fetchMoreResult.contentRiskAnalyses.edges] } }) : previous })}>Load more</button>}
      {reviewing && <ReviewDialog analysis={reviewing} onClose={() => setReviewing(null)} onSaved={async () => { setReviewing(null); await refetch(); }} />}
    </div>
  );
}

function RiskCard({ analysis, retrying, onReview, onRetry }: { analysis: Analysis; retrying: boolean; onReview: () => void; onRetry: () => Promise<void> }) {
  return <article className="rounded-lg border border-[#DFE1E6] bg-white">
    <div className="flex flex-col justify-between gap-4 border-b border-[#EBECF0] p-5 sm:flex-row sm:items-start">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge value={analysis.status} /><Badge value={analysis.level ?? 'UNSCORED'} /><span className="text-xs text-slate-500">Score {analysis.score ?? '—'}/100</span><span className="rounded bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">SHADOW</span></div><h3 className="mt-3 text-base font-semibold">{analysis.title}</h3><p className="mt-1 break-all text-xs text-slate-500">Marketplace item {analysis.targetId} · {formatDate(analysis.createdAt)}</p></div>
      <div className="flex shrink-0 gap-2">
        {['FAILED', 'SKIPPED'].includes(analysis.status) && <button type="button" disabled={retrying} onClick={() => void onRetry()} className="h-9 rounded border border-[#B7BEC8] bg-white px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">{retrying ? 'Retryingâ€¦' : 'Retry analysis'}</button>}
        {analysis.status === 'COMPLETED' && <button type="button" onClick={onReview} className="h-9 rounded bg-[#0C66E4] px-4 text-sm font-semibold text-white hover:bg-blue-700">{analysis.reviewerVerdict ? 'Update review' : 'Review signal'}</button>}
      </div>
    </div>
    <div className="p-5">
      {analysis.summary && <p className="text-sm leading-6 text-slate-700">{analysis.summary}</p>}
      {analysis.error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{analysis.error}</p>}
      {analysis.signals.length > 0 && <div className="mt-4 grid gap-3 lg:grid-cols-2">{analysis.signals.map((signal, index) => <div key={`${signal.code}-${index}`} className="rounded border border-[#DFE1E6] p-3"><div className="flex justify-between gap-3"><p className="text-xs font-semibold">{label(signal.code)}</p><span className="text-xs text-slate-500">{Math.round(signal.confidence * 100)}%</span></div><p className="mt-2 text-sm text-slate-700">{signal.explanation}</p>{signal.evidenceExcerpt && <blockquote className="mt-2 border-l-2 border-purple-300 pl-3 text-xs italic text-slate-500">“{signal.evidenceExcerpt}”</blockquote>}</div>)}</div>}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#EBECF0] pt-4 text-xs text-slate-500"><span>Recommendation: <strong className="text-slate-700">{label(analysis.recommendedAction ?? 'NONE')}</strong></span><span>Attempts: {analysis.attemptCount}</span><span>Model: {analysis.model}</span>{analysis.reviewerVerdict && <span>Human verdict: <strong className="text-slate-700">{label(analysis.reviewerVerdict)}</strong></span>}</div>
    </div>
  </article>;
}

function ReviewDialog({ analysis, onClose, onSaved }: { analysis: Analysis; onClose: () => void; onSaved: () => Promise<void> }) {
  const [verdict, setVerdict] = useState(analysis.reviewerVerdict ?? 'ACCURATE');
  const [note, setNote] = useState(analysis.reviewerNote ?? '');
  const [message, setMessage] = useState('');
  const [review, { loading }] = useMutation(REVIEW_SIGNAL);
  async function submit(event: FormEvent) {
    event.preventDefault();
    try { setMessage(''); await review({ variables: { id: analysis.id, verdict, note: note.trim() || null } }); await onSaved(); }
    catch (value) { setMessage(value instanceof Error ? value.message : 'The review could not be saved.'); }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}><form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="risk-review-title" className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"><h3 id="risk-review-title" className="text-lg font-semibold">Review AI risk signal</h3><p className="mt-2 text-sm text-slate-600">Your verdict measures model quality. It does not change the marketplace listing.</p>{message && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{message}</p>}<label className="mt-5 block text-sm font-semibold">Verdict<select value={verdict} onChange={(event) => setVerdict(event.target.value)} className="mt-2 h-10 w-full rounded border border-[#B7BEC8] bg-white px-3 text-sm"><option value="ACCURATE">Accurate</option><option value="FALSE_POSITIVE">False positive</option><option value="NEEDS_MORE_INFO">Needs more information</option></select></label><label className="mt-4 block text-sm font-semibold">Reviewer note<textarea rows={4} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 w-full resize-y rounded border border-[#B7BEC8] p-3 text-sm" placeholder="Optional evidence or correction…" /></label><div className="mt-5 flex justify-end gap-3"><button type="button" disabled={loading} onClick={onClose} className="h-9 rounded border border-[#B7BEC8] px-4 text-sm font-semibold">Cancel</button><button disabled={loading} className="h-9 rounded bg-[#0C66E4] px-4 text-sm font-semibold text-white disabled:opacity-50">{loading ? 'Saving…' : 'Save review'}</button></div></form></div>;
}

function Filter({ label: text, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="text-xs font-semibold text-slate-600">{text}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-9 w-full rounded border border-[#B7BEC8] bg-white px-3 text-sm font-normal"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{label(option)}</option>)}</select></label>; }
function Badge({ value }: { value: string }) { const colour = value === 'HIGH' || value === 'FAILED' ? 'bg-red-100 text-red-800' : value === 'MEDIUM' || value === 'PROCESSING' || value === 'PENDING' ? 'bg-amber-100 text-amber-800' : value === 'COMPLETED' || value === 'LOW' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'; return <span className={`rounded px-2 py-1 text-[11px] font-semibold ${colour}`}>{label(value)}</span>; }
function label(value: string) { return value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
