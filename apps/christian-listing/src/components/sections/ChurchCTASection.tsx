import { Link } from 'react-router-dom';

const CHECKS = [
  'Publish ministry activities & events.',
  'Stream or Archive & Broadcast.',
  'Welcome America & Angels.',
  'All Services at Affordable prices.',
] as const;

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="8" fill="#C9A96E" opacity="0.15" />
      <path d="M4.5 8l2.5 2.5 4-4" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
        {/* Top stat row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Active Members</p>
            <p className="text-3xl font-bold text-dark">12.4k</p>
          </div>
          <div className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1l4 4H1l4-4z" fill="currentColor" />
            </svg>
            8%
          </div>
        </div>

        {/* Mini chart */}
        <div className="mb-4">
          <svg viewBox="0 0 240 60" className="w-full h-12" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 55 C20 50 40 45 60 35 C80 25 100 40 120 30 C140 20 160 28 180 18 C200 8 220 15 240 10"
              fill="none"
              stroke="#C9A96E"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M0 55 C20 50 40 45 60 35 C80 25 100 40 120 30 C140 20 160 28 180 18 C200 8 220 15 240 10 L240 60 L0 60Z"
              fill="url(#chartGrad)"
            />
          </svg>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          {[
            { label: 'Events', value: '320+' },
            { label: 'Listings', value: '1.2k' },
            { label: 'Jobs', value: '85' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-sm font-bold text-dark">{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-3 -right-3 bg-[#C9A96E] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
        Live Dashboard
      </div>
    </div>
  );
}

export default function ChurchCTASection() {
  return (
    <section className="w-full bg-[#FEF7E9] px-6 md:px-10 lg:px-16 py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left — text content */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-[#C9A96E] mb-2">
              For Organizations
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-dark leading-tight">
              Run a Church or Charity?
            </h2>
            <p className="mt-3 text-sm text-dark/60 max-w-md leading-relaxed">
              Get all the tools that manage your community and constantly grow from one intuitive dashboard. Share trust with your congregation and maintain a stream of aligned audiences.
            </p>
          </div>

          {/* Checklist */}
          <ul className="flex flex-col gap-3">
            {CHECKS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-dark/70">
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Link
              to="/org/signup"
              className="px-6 py-2.5 rounded-full bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/org/signup"
              className="px-6 py-2.5 rounded-full border border-dark/20 text-dark text-sm font-medium hover:border-dark/40 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right — dashboard mockup */}
        <div className="flex items-center justify-center">
          <DashboardMockup />
        </div>

      </div>
    </section>
  );
}
