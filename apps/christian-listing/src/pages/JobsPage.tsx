import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ArrowRightIcon } from '../components/layout/icons';
import JobCard from '../components/cards/JobCard';
import EventCard from '../components/cards/EventCard';
import MarketplaceCard from '../components/cards/MarketplaceCard';

// ─── shared ──────────────────────────────────────────────────────────────────

const JOB_TABS = ['All Jobs', 'Ministry', 'Church Admin', 'Worship', 'Education', 'Tech & Media'] as const;

function FilterTabs({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {JOB_TABS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            active === t ? 'bg-dark text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-800'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

const SAMPLE_JOB = {
  badge: 'JOB LISTING' as const,
  badgeColor: 'green' as const,
  title: 'Project Coordinator',
  company: 'Grace Town Ministries',
  salaryRange: '65k – 85k NGN',
  location: 'Lagos City, Nigeria',
  employmentType: 'Full Time Employment',
  verified: true,
};

const SAMPLE_EVENT = {
  badge: 'STUDY/WORSHIP' as const,
  date: '24 OCT 2026',
  title: 'Theology of Work: A Masterclass for Professionals',
  description: 'An evening of peace and calm aimed to help youngsters learn the word of God.',
  location: 'Lagos City Centre',
  time: '09:30 AM To 06:00 PM',
  invites: '3500 Invites',
  likes: '15K Likes',
  verified: true,
  imageSrc: '/assets/event-theology.png',
};

const SAMPLE_LISTING = {
  badge: 'FOR SALE' as const,
  title: 'Ford Sierra 2012 Petrol',
  description: 'Used 2012 Model for Sale in Lagos',
  price: '₦ 40,000 NGN',
  location: 'Lagos City, Nigeria',
  imageSrc: '/assets/car-ford.png',
  verified: true,
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function JobsHero() {
  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: '380px', background: '#16191A' }}
    >
      <img
        src="/assets/spotlight-ad.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.8) 100%)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto gap-6 py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
          Search for <em className="italic not-italic">Events</em>,{' '}
          <em className="italic not-italic">Jobs</em>
          <br className="hidden md:block" />
          or <em className="italic not-italic">Listings</em>
        </h1>
        <div className="w-full flex items-center bg-white rounded-full shadow-lg overflow-hidden">
          <SearchIcon className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
          <input
            type="text"
            placeholder="Search for jobs, ministries or companies..."
            className="flex-1 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          <button className="m-1 px-6 py-2.5 rounded-full bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors shrink-0">
            Search
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Jobs (large 2-col layout) ──────────────────────────────────────

function FeaturedJobs() {
  return (
    <section className="w-full bg-[#F9F9F9] px-6 md:px-10 lg:px-16 py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-dark/40 tracking-wider uppercase mb-1">
            Handpicked for you
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">Featured Jobs</h2>
        </div>
        <Link to="/jobs" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>

      {/* 2-col: 1 tall left + 2 stacked right */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-3">
          <JobCard
            {...SAMPLE_JOB}
            title="Senior Worship Pastor"
            company="New Life Church International"
            salaryRange="120k – 180k NGN / month"
            employmentType="Full Time Employment"
            className="h-[320px] md:h-full"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <JobCard {...SAMPLE_JOB} className="flex-1" />
          <JobCard
            {...SAMPLE_JOB}
            badge="VOLUNTEER"
            badgeColor="blue"
            title="Sunday School Teacher"
            company="Grace Community Church"
            salaryRange="Voluntary Role"
            className="flex-1"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Job Category Tiles ───────────────────────────────────────────────────────

const JOB_CATEGORIES = [
  { label: 'Ministry & Pastoral', gradient: 'from-purple-900 to-purple-700', emoji: '⛪' },
  { label: 'Church Admin',        gradient: 'from-slate-800 to-slate-600',    emoji: '📋' },
  { label: 'Worship & Music',     gradient: 'from-amber-800 to-amber-600',    emoji: '🎼' },
  { label: 'Education',           gradient: 'from-teal-800 to-teal-600',      emoji: '📚' },
  { label: 'Tech & Media',        gradient: 'from-blue-900 to-blue-700',      emoji: '💻' },
  { label: 'Outreach',            gradient: 'from-green-800 to-green-600',    emoji: '🌍' },
  { label: 'Finance',             gradient: 'from-indigo-900 to-indigo-700',  emoji: '💼' },
  { label: 'Volunteering',        gradient: 'from-rose-800 to-rose-600',      emoji: '🤝' },
] as const;

function JobCategoryTiles() {
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-10 border-t border-gray-100">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark mb-6">Browse by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {JOB_CATEGORIES.map(({ label, gradient, emoji }) => (
          <button
            key={label}
            className={`relative rounded-2xl overflow-hidden h-24 flex flex-col items-start justify-end p-4 bg-gradient-to-br ${gradient} hover:scale-[1.02] transition-transform`}
          >
            <span className="absolute top-3 right-3 text-2xl">{emoji}</span>
            <p className="text-white font-semibold text-sm text-left leading-snug">{label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Generic job section ──────────────────────────────────────────────────────

function JobSection({ title }: { title: string }) {
  const [tab, setTab] = useState('All Jobs');
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-10 border-t border-gray-100">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">{title}</h2>
        <Link to="/jobs" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <div className="mb-5">
        <FilterTabs active={tab} onChange={setTab} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <JobCard key={i} {...SAMPLE_JOB} />
        ))}
      </div>
    </section>
  );
}

// ─── Mixed content section (events + listings cross-promo) ───────────────────

function MixedResultsSection() {
  return (
    <section className="w-full bg-[#F9F9F9] px-6 md:px-10 lg:px-16 py-10 border-t border-gray-100">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-dark/40 tracking-wider uppercase mb-1">
            Also on Christian Listings
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">Events &amp; Listings Near You</h2>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-dark/40 mb-3">Events</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <EventCard key={i} {...SAMPLE_EVENT} className="h-[240px]" />
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-dark/40 mb-3">Marketplace Listings</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <MarketplaceCard key={i} {...SAMPLE_LISTING} />
        ))}
      </div>
    </section>
  );
}

// ─── Scripture banner ─────────────────────────────────────────────────────────

function ScriptureBanner() {
  return (
    <section className="relative w-full overflow-hidden">
      <img src="/assets/org-cta.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-10 py-16 text-center flex flex-col gap-3 items-center">
        <p className="font-serif text-white text-xl md:text-2xl leading-relaxed italic">
          "Whatever you do, work at it with all your heart,
          <br className="hidden md:block" />
          as working for the Lord, not for human masters."
        </p>
        <span className="text-white/40 text-xs tracking-wider">Colossians 3:23</span>
      </div>
    </section>
  );
}

// ─── All Jobs grid ────────────────────────────────────────────────────────────

function AllJobs() {
  const [tab, setTab] = useState('All Jobs');
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-12 border-t border-gray-100">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">All Jobs</h2>
        <Link to="/jobs" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <div className="mb-5">
        <FilterTabs active={tab} onChange={setTab} />
      </div>
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((row) => (
          <div key={row} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <JobCard key={i} {...SAMPLE_JOB} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <button className="px-8 py-2.5 rounded-full border border-dark/20 text-dark text-sm font-medium hover:border-dark/40 transition-colors">
          Load More
        </button>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  return (
    <>
      <JobsHero />
      <FeaturedJobs />
      <JobCategoryTiles />
      <JobSection title="Ministry & Pastoral Roles" />
      <JobSection title="Church Admin & Operations" />
      <MixedResultsSection />
      <ScriptureBanner />
      <JobSection title="Worship & Creative Arts" />
      <JobSection title="Tech, Media & Communications" />
      <AllJobs />
    </>
  );
}
