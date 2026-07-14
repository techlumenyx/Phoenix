import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon } from '../layout/icons';
import { useDiscovery, usePreferredRegion } from '../../lib/discovery';

export default function HeroSection() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const { region, setRegion, isProfileRegion } = usePreferredRegion();
  const { data, loading } = useDiscovery(search, 5, search.length < 2);
  const resultCount = data ? data.events.edges.length + data.jobListings.edges.length + data.marketplaceItems.edges.length + data.organisations.edges.length : 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const query = input.trim();
    if (!query) return;
    const params = new URLSearchParams({ q: query });
    if (region) params.set('region', region);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section
      style={{ minHeight: '100vh' }}
      className="relative w-full min-h-full flex items-center justify-center bg-[#2B2416] overflow-hidden"
      aria-label="Hero"
    >
      {/* Radial blur — sharp centre, blurred edges */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          maskImage:
            'radial-gradient(ellipse 55% 55% at 50% 50%, transparent 40%, black 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 55% 55% at 50% 50%, transparent 40%, black 100%)',
        }}
      />

      {/* Background image — replace src with the actual church interior asset */}
      <img
        src="/assets/background/background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
      />

      {/* Rectangle 83 — design-spec radial white vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(148.64% 121.35% at 50% -30.34%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 35.64%, rgba(255,255,255,0.25) 69.14%, rgba(255,255,255,0.68) 84.77%, #ffffff 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto gap-5">
        <h1 className="text-4xl md:text-5xl font-serif text-[#1B1208] leading-tight">
          A <strong className="font-bold">Sanctuary</strong> for
          <br />
          Purposeful <em className="font-bold not-italic italic">Connection</em>
        </h1>

        <p className="text-sm md:text-base text-[#2A1E0A]/80 max-w-sm">
          Discover a curated ecosystem of faith-led ministries, community
          events, and grace-centered marketplaces.
        </p>

        {/* Search bar */}
        <div className="flex items-center gap-2 text-xs text-[#2A1E0A]/70">
          <span>Showing results near</span>
          <input
            aria-label="Preferred region"
            value={region}
            disabled={isProfileRegion}
            onChange={(event) => setRegion(event.target.value)}
            placeholder="All regions"
            className="w-36 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 outline-none disabled:opacity-70"
          />
        </div>

        <form onSubmit={submit} className="relative w-full max-w-lg">
          <div className="flex items-center bg-white rounded-full shadow-md overflow-hidden">
          <SearchIcon className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(event) => {
              const value = event.target.value;
              setInput(value);
              setSearch(value.trim().length >= 2 ? value.trim() : '');
            }}
            placeholder="Search events, jobs or listings..."
            className="flex-1 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          <button type="submit" className="m-1 px-6 py-2.5 rounded-full bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors shrink-0">
            Explore
          </button>
          </div>

          {search.length >= 2 && (
            <div className="absolute top-full z-30 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl bg-white p-3 text-left shadow-xl">
              {loading && !data ? <p className="p-3 text-sm text-gray-500">Searching…</p> : resultCount === 0 ? <p className="p-3 text-sm text-gray-500">No results found{region ? ` in ${region}` : ''}.</p> : (
                <>
                  <ResultGroup title="Events" path="/events" itemLinks items={data?.events.edges ?? []} />
                  <ResultGroup title="Jobs" path="/jobs" itemLinks items={data?.jobListings.edges ?? []} />
                  <ResultGroup title="Marketplace" path="/marketplace" itemLinks items={data?.marketplaceItems.edges ?? []} />
                  <ResultGroup title="Organisations" path="/organisations" itemLinks items={data?.organisations.edges ?? []} />
                  <Link to={`/search?q=${encodeURIComponent(search)}${region ? `&region=${encodeURIComponent(region)}` : ''}`} className="mt-2 block rounded-lg border-t border-gray-100 px-3 py-3 text-center text-xs font-bold text-[#1B1B1B] hover:bg-gray-50">
                    View all results →
                  </Link>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function ResultGroup({ title, path, itemLinks = false, items }: { title: string; path?: string; itemLinks?: boolean; items: Array<{ id: string; title?: string; name?: string; region?: string | null }> }) {
  if (!items.length) return null;
  return (
    <div className="mb-2 last:mb-0">
      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{title}</p>
      {items.map((item) => (
        <Link key={item.id} to={path ? (itemLinks ? `${path}/${item.id}` : path) : '/'} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50">
          <span className="truncate font-medium">{item.title ?? item.name}</span>
          {item.region && <span className="ml-3 shrink-0 text-xs text-gray-400">{item.region}</span>}
        </Link>
      ))}
    </div>
  );
}
