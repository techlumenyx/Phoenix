import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ArrowRightIcon } from '../components/layout/icons';
import EventCard from '../components/cards/EventCard';

// ─── shared ──────────────────────────────────────────────────────────────────

const FILTER_TABS = ['Trending', 'Newly Added', 'Music', 'Worship', 'Movies / Films'] as const;

function FilterTabs({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTER_TABS.map((t) => (
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

// ─── Hero ─────────────────────────────────────────────────────────────────────

function EventsHero() {
  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: '380px', background: '#1C1A14' }}
    >
      <img
        src="/assets/org-cta.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto gap-6 py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
          Find <em className="italic not-italic">Events</em> that<br />
          you're looking for
        </h1>
        <div className="w-full flex items-center bg-white rounded-full shadow-lg overflow-hidden">
          <SearchIcon className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
          <input
            type="text"
            placeholder="Search events, ministries or locations..."
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

// ─── Trending Events (featured 2-col layout) ──────────────────────────────────

function TrendingEvents() {
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-dark/40 tracking-wider uppercase mb-1">
            This week's picks
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">Trending Events</h2>
        </div>
        <Link to="/events" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>

      {/* Featured 2-col layout: 1 large left, 2 stacked right */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-auto md:h-[520px]">
        {/* Large left card */}
        <div className="md:col-span-3">
          <EventCard {...SAMPLE_EVENT} ctaLabel="RSVP Now" className="h-[320px] md:h-full" />
        </div>
        {/* Two stacked right */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <EventCard
            {...SAMPLE_EVENT}
            date={undefined}
            description={undefined}
            location={undefined}
            time={undefined}
            className="flex-1"
          />
          <EventCard
            {...SAMPLE_EVENT}
            badge="MUSIC"
            date={undefined}
            description={undefined}
            location={undefined}
            time={undefined}
            className="flex-1"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Based on your Interests cards ───────────────────────────────────────────

function InterestsCards() {
  const [tab, setTab] = useState('Trending');
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-10 border-t border-gray-50">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">Based on your Interests</h2>
        <Link to="/events" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <div className="mb-5">
        <FilterTabs active={tab} onChange={setTab} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <EventCard key={i} {...SAMPLE_EVENT} className="h-[280px]" />
        ))}
      </div>
    </section>
  );
}

// ─── Category filter tiles ────────────────────────────────────────────────────

const EVENT_CATEGORIES = [
  { label: 'Study / Worship', gradient: 'from-purple-900 to-purple-700',    emoji: '🙏' },
  { label: 'Music',           gradient: 'from-amber-800 to-amber-600',       emoji: '🎵' },
  { label: 'Outdoor',         gradient: 'from-green-800 to-green-600',       emoji: '🌿' },
  { label: 'Music / Films',   gradient: 'from-blue-900 to-blue-700',         emoji: '🎬' },
  { label: 'Theatre',         gradient: 'from-red-900 to-red-700',           emoji: '🎭' },
  { label: 'Workshops',       gradient: 'from-teal-800 to-teal-600',         emoji: '🛠️' },
  { label: 'Family & Kids',   gradient: 'from-pink-800 to-pink-600',         emoji: '👨‍👩‍👧' },
  { label: 'Upskill & Training', gradient: 'from-indigo-900 to-indigo-700', emoji: '📈' },
] as const;

function CategoryTiles() {
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-10 border-t border-gray-50">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark mb-6">
        Browse by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {EVENT_CATEGORIES.map(({ label, gradient, emoji }) => (
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

// ─── Generic category section ─────────────────────────────────────────────────

function EventSection({ title = 'Religion & Theology', cols = 3 }: { title?: string; cols?: number }) {
  const [tab, setTab] = useState('Trending');
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-10 border-t border-gray-50">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">{title}</h2>
        <Link to="/events" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <div className="mb-5">
        <FilterTabs active={tab} onChange={setTab} />
      </div>
      <div className={`grid gap-4 ${cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {Array.from({ length: cols }).map((_, i) => (
          <EventCard key={i} {...SAMPLE_EVENT} className="h-[280px]" />
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
          "One who is gracious to a poor man lends to the Lord,
          <br className="hidden md:block" />
          And He will repay him for his good deed."
        </p>
        <span className="text-white/40 text-xs tracking-wider">Proverbs 19:17</span>
      </div>
    </section>
  );
}

// ─── All Events ───────────────────────────────────────────────────────────────

function AllEvents() {
  const [tab, setTab] = useState('Trending');
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-12 border-t border-gray-50">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">All Events</h2>
        <Link to="/events" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <div className="mb-5">
        <FilterTabs active={tab} onChange={setTab} />
      </div>
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((row) => (
          <div key={row} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <EventCard key={i} {...SAMPLE_EVENT} className="h-[280px]" />
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

export default function EventsPage() {
  return (
    <>
      <EventsHero />
      <TrendingEvents />
      <InterestsCards />
      <CategoryTiles />
      <EventSection title="Religion & Theology" cols={3} />
      <EventSection title="Religion & Theology" cols={3} />
      <ScriptureBanner />
      <EventSection title="Religion & Theology" cols={3} />
      <EventSection title="Religion & Theology" cols={3} />
      <EventSection title="Religion & Theology" cols={3} />
      <AllEvents />
    </>
  );
}
