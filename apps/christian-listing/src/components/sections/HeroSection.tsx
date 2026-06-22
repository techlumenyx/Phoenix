import { SearchIcon } from '../layout/icons';

export default function HeroSection() {
  return (
    <section
      className="relative w-full min-h-[520px] md:min-h-[600px] flex items-center justify-center bg-[#2B2416] overflow-hidden"
      aria-label="Hero"
    >
      {/* Background image — replace src with the actual church interior asset */}
      <img
        src="/assets/hero-church.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
      />

      {/* Gradient overlay to darken edges and keep centre readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

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
