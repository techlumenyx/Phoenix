import { useState } from 'react';
import { ChevronDownIcon, MapPinIcon } from './icons';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Jobs', href: '/jobs' },
] as const;

function ChurchLogo() {
  return (
    <svg
      width="36"
      height="44"
      viewBox="0 0 36 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="33" height="41" rx="2" stroke="white" strokeWidth="1.5" />
      <line x1="18" y1="5" x2="18" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="10.5" x2="24" y2="10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 22 Q7 15 18 15 Q29 15 29 22" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M13 43 L13 32 Q13 28 16 28 L20 28 Q23 28 23 32 L23 43" stroke="white" strokeWidth="1.5" fill="none" />
      <rect x="7" y="22" width="22" height="21" fill="none" />
    </svg>
  );
}

function RegionSelector() {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A2A2A] text-white text-sm font-medium hover:bg-[#333] transition-colors"
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      <MapPinIcon className="w-4 h-4 text-white/70" />
      <span>United Kingdom</span>
      <ChevronDownIcon className={`w-4 h-4 text-white/70 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export default function Navbar() {
  const [activeLink, setActiveLink] = useState<string>('Home');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="w-full px-6 md:px-10 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-3 shrink-0">
        <ChurchLogo />
        <span className="text-white font-semibold text-sm tracking-widest uppercase leading-tight">
          Christian
          <br />
          Listings
        </span>
      </a>

      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              onClick={() => setActiveLink(label)}
              className={`text-sm font-medium transition-colors pb-1 ${
                activeLink === label
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Right actions */}
      <div className="hidden md:flex items-center gap-3">
        <RegionSelector />
        <a
          href="/signin"
          className="px-5 py-2 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold hover:bg-[#b8965e] transition-colors"
        >
          Sign In
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white p-2"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span className="block w-5 h-0.5 bg-white mb-1" />
        <span className="block w-5 h-0.5 bg-white mb-1" />
        <span className="block w-5 h-0.5 bg-white" />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 w-full md:hidden flex flex-col px-6 py-4 gap-4 border-t border-white/10"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => { setActiveLink(label); setMenuOpen(false); }}
              className={`text-sm font-medium ${activeLink === label ? 'text-white' : 'text-white/70'}`}
            >
              {label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <RegionSelector />
            <a
              href="/signin"
              className="px-5 py-2 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold"
            >
              Sign In
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
