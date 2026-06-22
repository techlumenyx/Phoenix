import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChurchLogo, MapPinIcon } from './icons';
import SignInModal from './SignInModal';
import { useAuthStore } from '../../store/authStore';

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Events',      href: '/events' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Jobs',        href: '/jobs' },
] as const;

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

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full bg-[#C9A96E] flex items-center justify-center text-[#1B1B1B] text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeLink, setActiveLink] = useState<string>('Home');
  const [menuOpen, setMenuOpen]     = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const handleProfileClick = () => {
    // orgId routing added here once GraphQL me query is wired
    navigate('/profile');
  };

  const displayName = user?.displayName ?? user?.email ?? 'User';

  return (
    <>
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
          {user ? (
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2A2A2A] hover:bg-[#333] transition-colors"
            >
              <UserAvatar name={displayName} />
              <span className="text-white text-sm font-medium max-w-[120px] truncate">
                {displayName}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setSignInOpen(true)}
              className="px-5 py-2 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold hover:bg-[#b8965e] transition-colors"
            >
              Sign In
            </button>
          )}
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
              {user ? (
                <button
                  onClick={() => { setMenuOpen(false); handleProfileClick(); }}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2A2A2A]"
                >
                  <UserAvatar name={displayName} />
                  <span className="text-white text-sm font-medium truncate max-w-[100px]">
                    {displayName}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); setSignInOpen(true); }}
                  className="px-5 py-2 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {signInOpen && <SignInModal onClose={() => setSignInOpen(false)} />}
    </>
  );
}
