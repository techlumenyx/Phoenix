import { SearchIcon } from '../layout/icons';

export default function HeroSection() {
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
        <div className="w-full max-w-lg flex items-center bg-white rounded-full shadow-md overflow-hidden">
          <SearchIcon className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
          <input
            type="text"
            placeholder="Search events, jobs or listings..."
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
