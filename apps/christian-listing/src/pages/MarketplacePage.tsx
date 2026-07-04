import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ArrowRightIcon, LocationMarkerIcon } from '../components/layout/icons';
import MarketplaceCard from '../components/cards/MarketplaceCard';

// ─── shared ──────────────────────────────────────────────────────────────────

const FILTER_TABS = ['Trending', 'Theology', 'Music', 'Worship', 'Movies / Films'] as const;

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

const SAMPLE_CARD = {
  badge: 'FOR SALE' as const,
  title: 'Ford Sierra 2012 Petrol',
  description: 'Used 2012 Model for Sale in Lagos',
  price: '₦ 40,000 NGN',
  location: 'Lagos City, Nigeria',
  imageSrc: '/assets/car-ford.png',
  verified: true,
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function MarketplaceHero() {
  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: '420px', background: '#1A1A10' }}
    >
      {/* Background image */}
      <img
        src="/assets/org-cta.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto gap-6 py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
          Discover what you're<br />looking for
        </h1>
        <div className="w-full flex items-center bg-white rounded-full shadow-lg overflow-hidden">
          <SearchIcon className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
          <input
            type="text"
            placeholder="Search listings, goods or categories..."
            className="flex-1 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          <button className="m-1 px-6 py-2.5 rounded-full bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors shrink-0">
            Explore
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Discover your Listing ────────────────────────────────────────────────────

const DISCOVER_CATS = [
  { label: 'Used Goods',  color: '#2C2018', img: '/assets/car-ford.png' },
  { label: 'Donations',   color: '#1A2418', img: '/assets/spotlight-ad.jpg' },
  { label: 'New & Packed', color: '#18181E', img: '/assets/event-theology.png' },
] as const;

function DiscoverSection() {
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-12">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark mb-6">
        Discover your Listing
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DISCOVER_CATS.map(({ label, color, img }) => (
          <div
            key={label}
            className="relative rounded-2xl overflow-hidden h-52 flex flex-col justify-end"
            style={{ background: color }}
          >
            <img
              src={img}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative z-10 p-5 flex flex-col gap-2">
              <p className="text-white font-serif font-bold text-xl">{label}</p>
              <button className="self-start flex items-center gap-1.5 text-xs font-semibold text-white/80 border border-white/30 hover:border-white/60 rounded-full px-4 py-1.5 transition-colors">
                DISCOVER
                <ArrowRightIcon className="w-3 h-3 rotate-90" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Trending Categories ──────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Home & Living',   gradient: 'from-amber-800 to-amber-600',   emoji: '🏠' },
  { label: 'Electronics',     gradient: 'from-slate-700 to-slate-500',    emoji: '📱' },
  { label: 'Family & Kids',   gradient: 'from-pink-700 to-rose-500',      emoji: '👨‍👩‍👧' },
  { label: 'Clothing',        gradient: 'from-emerald-800 to-emerald-600', emoji: '👗' },
  { label: 'Books',           gradient: 'from-stone-700 to-amber-700',    emoji: '📚' },
  { label: 'Transport',       gradient: 'from-gray-800 to-gray-600',      emoji: '🚗' },
  { label: 'Sports & Outdoor', gradient: 'from-green-800 to-green-600',   emoji: '⚽' },
  { label: 'Food / Produce',  gradient: 'from-yellow-700 to-orange-600',  emoji: '🍎' },
] as const;

function TrendingCategories() {
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-8 border-t border-gray-50">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark mb-6">
        Trending Categories
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map(({ label, gradient, emoji }) => (
          <button
            key={label}
            className={`relative rounded-2xl overflow-hidden h-28 flex flex-col items-start justify-end p-4 bg-gradient-to-br ${gradient} hover:scale-[1.02] transition-transform`}
          >
            <span className="absolute top-3 right-3 text-2xl">{emoji}</span>
            <p className="text-white font-semibold text-sm text-left leading-snug">{label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Card grid section ────────────────────────────────────────────────────────

function CardGrid({ cols = 4 }: { cols?: number }) {
  return (
    <div
      className={`grid gap-4 ${
        cols === 4
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <MarketplaceCard key={i} {...SAMPLE_CARD} />
      ))}
    </div>
  );
}

// ─── Based on your Interests ──────────────────────────────────────────────────

function BasedOnInterests() {
  const [tab, setTab] = useState('Trending');
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-12 border-t border-gray-50">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="text-xs font-medium text-dark/40 tracking-wider uppercase mb-1">Personalised for You</p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">Based on your Interests</h2>
        </div>
        <Link to="/marketplace" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <FilterTabs active={tab} onChange={setTab} />
      <div className="mt-5">
        <CardGrid cols={4} />
      </div>
    </section>
  );
}

// ─── Saved Listings ───────────────────────────────────────────────────────────

function SavedListings() {
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-12 border-t border-gray-50">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">Saved Listings</h2>
        <Link to="/marketplace" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW MORE <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <CardGrid cols={4} />
    </section>
  );
}

// ─── Generic featured section ─────────────────────────────────────────────────

function FeaturedListingsSection({ title = 'Featured Listings', viewAllTo = '/marketplace', cols = 4 }: {
  title?: string;
  viewAllTo?: string;
  cols?: number;
}) {
  const [tab, setTab] = useState('Trending');
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-12 border-t border-gray-50">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">{title}</h2>
        <Link to={viewAllTo} className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <div className="mb-5">
        <FilterTabs active={tab} onChange={setTab} />
      </div>
      <CardGrid cols={cols} />
    </section>
  );
}

// ─── Scripture quote banner ───────────────────────────────────────────────────

function ScriptureBanner() {
  return (
    <section className="relative w-full overflow-hidden">
      <img
        src="/assets/org-cta.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-10 py-16 text-center flex flex-col gap-4 items-center">
        <p className="font-serif text-white text-xl md:text-2xl leading-relaxed italic">
          "One who is gracious to a poor man lends to the Lord,
          <br className="hidden md:block" />
          And He will repay him for his good deed."
        </p>
        <span className="text-white/50 text-xs tracking-wider">Proverbs 19:17</span>
      </div>
    </section>
  );
}

// ─── All Listings ─────────────────────────────────────────────────────────────

function AllListings() {
  const [tab, setTab] = useState('Trending');
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-12 border-t border-gray-50">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">All Listings</h2>
        <Link to="/marketplace" className="text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark flex items-center gap-1 shrink-0">
          VIEW ALL <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>
      <div className="mb-5">
        <FilterTabs active={tab} onChange={setTab} />
      </div>

      {/* Row 1 */}
      <CardGrid cols={4} />

      {/* Row 2 */}
      <div className="mt-4">
        <CardGrid cols={4} />
      </div>

      {/* Load more / pagination */}
      <div className="flex justify-center mt-8">
        <button className="px-8 py-2.5 rounded-full border border-dark/20 text-dark text-sm font-medium hover:border-dark/40 transition-colors">
          Load More
        </button>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  return (
    <>
      <MarketplaceHero />
      <DiscoverSection />
      <TrendingCategories />
      <BasedOnInterests />
      <SavedListings />
      <FeaturedListingsSection title="Featured Listings" />
      <ScriptureBanner />
      <FeaturedListingsSection title="Featured Listings" />
      <FeaturedListingsSection title="Featured Listings" />
      <FeaturedListingsSection title="Featured Listings" />
      <FeaturedListingsSection title="Featured Listings" />
      <AllListings />
    </>
  );
}
