import { gql, useMutation } from '@apollo/client';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const SUBMIT_REPORT = gql`
  mutation SubmitContentReport($targetType: ContentType!, $targetId: ID!, $reason: String!, $details: String) {
    submitContentReport(targetType: $targetType, targetId: $targetId, reason: $reason, details: $details) { id }
  }
`;

const REASONS = ['Spam or misleading', 'Fraud or scam', 'Prohibited or unsafe', 'Inappropriate content', 'Duplicate', 'Other'];

export default function ReportContentButton({ targetType, targetId, label, className = '' }: { targetType: 'EVENT' | 'JOB' | 'MARKETPLACE_ITEM' | 'ORGANISATION' | 'USER'; targetId: string; label: string; className?: string }) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState('');
  const [submit, { loading }] = useMutation(SUBMIT_REPORT);

  function begin() {
    if (!user) { navigate('/signin', { state: { from: location.pathname } }); return; }
    setOpen(true); setSent(false); setFailure('');
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    try {
      setFailure('');
      await submit({ variables: { targetType, targetId, reason, details: details.trim() || null } });
      setSent(true);
    } catch { setFailure('We could not submit this report. Please try again.'); }
  }

  return <>
    <button type="button" onClick={begin} className={className || 'text-xs text-gray-600 underline hover:text-gray-900'}>{label}</button>
    {open && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="report-content-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {sent ? <div className="py-5 text-center"><h2 id="report-content-title" className="font-serif text-3xl font-bold">Report received</h2><p className="mt-3 text-sm leading-6 text-gray-600">Our safety team will review it. You can follow updates and reply from My Reports.</p><div className="mt-6 flex justify-center gap-3"><button onClick={() => setOpen(false)} className="rounded-full border px-5 py-2 text-sm font-semibold">Close</button><button onClick={() => navigate('/dashboard/reports')} className="rounded-full bg-[#302D2E] px-5 py-2 text-sm font-semibold text-white">View My Reports</button></div></div> :
        <form onSubmit={send}><h2 id="report-content-title" className="font-serif text-3xl font-bold">Report {label.replace(/^Report\s+/i, '')}</h2><p className="mt-2 text-sm text-gray-500">Tell us what is wrong. Your identity will never be shown to the affected user or organisation.</p><label className="mt-5 block text-sm font-semibold">Reason<select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal">{REASONS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="mt-4 block text-sm font-semibold">Details <span className="font-normal text-gray-400">(optional)</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1000} rows={4} className="mt-2 w-full resize-y rounded-xl border border-gray-300 p-3 font-normal" placeholder="Add context that will help our review" /></label>{failure && <p role="alert" className="mt-3 text-sm text-red-700">{failure}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" disabled={loading} onClick={() => setOpen(false)} className="rounded-full border px-5 py-2 text-sm font-semibold">Cancel</button><button disabled={loading} className="rounded-full bg-[#302D2E] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? 'Submitting…' : 'Submit report'}</button></div></form>}
      </div>
    </div>}
  </>;
}
