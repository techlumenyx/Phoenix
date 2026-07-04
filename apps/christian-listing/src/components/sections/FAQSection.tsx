import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'How do I list my organization?',
    a: 'Sign up as an organization, complete your profile verification, and you can start listing your ministry, events, and opportunities immediately from your dashboard.',
  },
  {
    q: 'Is there a fee for listings?',
    a: 'Basic listings are completely free. Premium placement and featured spots are available on paid plans, giving your ministry more visibility across the platform.',
  },
  {
    q: 'How does the search filter work?',
    a: 'Our search uses region, category, and keyword filters to surface the most relevant results for you. You can refine by location, event type, job category, or listing type.',
  },
  {
    q: 'How can I expand a listing?',
    a: 'From your organization dashboard, navigate to the relevant section (Events, Jobs, or Listings) and click "Edit" on any item to expand or update its details.',
  },
  {
    q: 'Can I promote an event globally?',
    a: 'Yes. With a Premium plan you can promote events beyond your local region and reach the full diaspora audience on the platform, including featured placement on the homepage.',
  },
  {
    q: 'Can I promote an account globally?',
    a: 'Organization accounts on the Standard and Premium tiers gain global visibility in search results and can appear in the curated Spotlight section on the homepage.',
  },
] as const;

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-dark/10 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-dark">{q}</span>
        <span className="shrink-0 w-6 h-6 rounded-full border border-dark/20 flex items-center justify-center text-dark/60 text-lg leading-none transition-transform" style={{ transform: open ? 'rotate(45deg)' : '' }}>
          +
        </span>
      </button>
      {open && (
        <p className="pb-4 text-sm text-dark/60 leading-relaxed pr-10">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section className="w-full bg-[#FEF7E9] px-6 md:px-10 lg:px-16 py-20 border-t border-[#E8D9B5]/40">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-dark mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-dark/50">
            Have questions? Here's everything you need to know.
          </p>
        </div>

        {/* Accordion */}
        <div className="bg-white rounded-2xl px-6 shadow-sm border border-gray-100 mb-8">
          {FAQS.map(({ q, a }) => (
            <FAQItem key={q} q={q} a={a} />
          ))}
        </div>

        {/* Still have questions */}
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <p className="font-serif text-xl font-bold text-dark mb-1">Still have questions?</p>
          <p className="text-sm text-dark/50 mb-5">
            Can't find the answer you're looking for? Reach out to our team.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/contact"
              className="px-5 py-2 rounded-full bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors"
            >
              Contact Support
            </Link>
            <Link
              to="/contact"
              className="px-5 py-2 rounded-full border border-dark/20 text-dark text-sm font-medium hover:border-dark/40 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
