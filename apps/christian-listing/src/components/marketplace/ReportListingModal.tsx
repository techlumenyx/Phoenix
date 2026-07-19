import { FormEvent, useEffect, useState } from 'react';

const REASONS = ['Spam or misleading', 'Suspected fraud or scam', 'Prohibited or unsafe item', 'Inappropriate content', 'Duplicate listing', 'Other'];

interface ReportListingModalProps {
  listingTitle: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export default function ReportListingModal({ listingTitle, submitting, onClose, onSubmit }: ReportListingModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => { if (keyboardEvent.key === 'Escape' && !submitting) onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = previousOverflow; };
  }, [onClose, submitting]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!reason) { setError('Select a reason for your report.'); return; }
    setError('');
    const reportText = details.trim() ? `${reason}: ${details.trim()}` : reason;
    try {
      await onSubmit(reportText);
    } catch {
      setError('The report could not be submitted. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm" role="presentation" onMouseDown={(mouseEvent) => { if (mouseEvent.target === mouseEvent.currentTarget && !submitting) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="report-listing-title" className="relative w-full max-w-xl rounded-[30px] bg-white px-6 py-10 shadow-2xl sm:px-10 sm:py-14">
        <button onClick={onClose} disabled={submitting} aria-label="Close report dialog" className="absolute right-5 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-500 hover:bg-gray-100 disabled:opacity-50">×</button>
        <h2 id="report-listing-title" className="text-center font-serif text-4xl font-semibold">Report This Listing</h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-gray-500">Help us maintain a safe sanctuary by reporting “{listingTitle}” if it violates our community guidelines.</p>

        <form onSubmit={submit} className="mt-9">
          <label className="block text-lg font-medium">Reason for report
            <select autoFocus value={reason} onChange={(event) => setReason(event.target.value)} className="mt-3 w-full appearance-none rounded-2xl border-0 bg-[#eee6ef] px-5 py-4 text-base text-gray-700 outline-none ring-[#4a1746]/30 focus:ring-2">
              <option value="">Select a reason…</option>{REASONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>

          <label className="mt-7 block text-lg font-medium">Additional Details
            <textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={4} maxLength={1000} placeholder="Provide any details that can help our moderation team…" className="mt-3 w-full resize-y rounded-2xl border-0 bg-[#eee6ef] px-5 py-4 text-base text-gray-700 outline-none ring-[#4a1746]/30 focus:ring-2" />
          </label>

          <div className="mt-6 rounded-xl bg-[#fff0de] px-4 py-4 text-sm leading-6 text-[#5a421a]"><span className="mr-2 font-bold">ⓘ</span>Your report is confidential. Our moderation team reviews flagged content to keep the community respectful and honest.</div>
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button type="button" disabled={submitting} onClick={onClose} className="rounded-xl border border-[#392f39] px-4 py-3 text-base hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-[#352f35] px-4 py-3 text-base text-white hover:bg-[#4a1746] disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Report'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
