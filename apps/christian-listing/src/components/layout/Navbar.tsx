import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

function UserMenu({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await logout();
    navigate('/');
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2A2A2A] hover:bg-[#333] transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <UserAvatar name={displayName} />
        <span className="text-white text-sm font-medium max-w-[120px] truncate">{displayName}</span>
        <ChevronDownIcon className={`w-3.5 h-3.5 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#1B1B1B] border border-white/10 shadow-xl overflow-hidden z-50">
          <button
            onClick={() => { setOpen(false); navigate('/dashboard'); }}
            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => { setOpen(false); navigate('/dashboard/saved'); }}
            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            Saved Items
          </button>
          <button
            onClick={() => { setOpen(false); navigate('/profile'); }}
            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            View Profile
          </button>
          <div className="h-px bg-white/10" />
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();

  const [menuOpen, setMenuOpen]     = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const displayName = user?.displayName ?? user?.email ?? 'User';

  async function handleMobileSignOut() {
    setMenuOpen(false);
    await logout();
    navigate('/');
  }

  return (
    <>
      <nav
        className="w-full px-6 md:px-10 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 shrink-0">
          <ChurchLogo color="white" />
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
                className={`text-sm font-medium transition-colors pb-1 ${
                  isActive(href)
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
            <UserMenu displayName={displayName} />
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
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium ${isActive(href) ? 'text-white' : 'text-white/70'}`}
              >
                {label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
              <RegionSelector />
              {user ? (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2A2A2A] self-start"
                  >
                    <UserAvatar name={displayName} />
                    <span className="text-white text-sm font-medium truncate max-w-[100px]">
                      {displayName}
                    </span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}
                    className="self-start text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/dashboard/saved'); }}
                    className="self-start text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    Saved Items
                  </button>
                  <button
                    onClick={handleMobileSignOut}
                    className="self-start text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); setSignInOpen(true); }}
                  className="px-5 py-2 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold self-start"
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
