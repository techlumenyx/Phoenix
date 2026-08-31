import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDownIcon, BrandLogo, MapPinIcon } from './icons';
import SignInModal from './SignInModal';
import { useAuthStore } from '../../store/authStore';
import { getDashboardRoute } from '../../lib/dashboard-route';
import { gql, useMutation } from '@apollo/client';
import LocationCombobox, { type CanonicalLocation } from '../location/LocationCombobox';
import { usePreferredRegion } from '../../lib/discovery';

const UPDATE_NAVBAR_REGION = gql`
  mutation UpdateNavbarRegion($input: UpdateProfileInput!) {
    updateProfile(input: $input) { id region regionCode }
  }
`;

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Events',      href: '/events' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Jobs',        href: '/jobs' },
] as const;

function RegionSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dbUser = useAuthStore((state) => state.dbUser);
  const { region, setRegion } = usePreferredRegion();
  const [updateProfile, { loading }] = useMutation(UPDATE_NAVBAR_REGION);

  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  async function selectLocation(location: CanonicalLocation) {
    if (dbUser) {
      const result = await updateProfile({
        variables: { input: { region: location.displayName, regionCode: location.id } },
      });
      const updated = result.data?.updateProfile;
      if (updated) {
        useAuthStore.setState({ dbUser: { ...dbUser, region: updated.region, regionCode: updated.regionCode } });
      }
    } else {
      setRegion(location.displayName);
    }
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full bg-[#2A2A2A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <MapPinIcon className="h-4 w-4 text-white/70" />
        <span className="max-w-[150px] truncate">{region ? region.split(',')[0] : 'Choose location'}</span>
        <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[65] mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
          <p className="mb-1 text-sm font-semibold text-[#1B1B1B]">{dbUser ? 'Update your home city' : 'Results near you'}</p>
          <p className="mb-3 text-xs text-gray-500">Search and select a city from GeoNames.</p>
          <LocationCombobox initialLabel={region} onChange={selectLocation} autoFocus />
          {loading && <p className="mt-2 text-xs text-gray-500">Saving location…</p>}
        </div>
      )}
    </div>
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

function UserMenu({
  displayName,
  dashboardRoute,
}: {
  displayName: string;
  dashboardRoute: '/org' | '/dashboard';
}) {
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
            onClick={() => { setOpen(false); navigate(dashboardRoute); }}
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
          <button onClick={() => { setOpen(false); navigate('/whats-new'); }} className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors">What’s New</button>
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
  const { user, dbUser, accountType, logout } = useAuthStore();

  const [menuOpen, setMenuOpen]     = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const displayName = user?.displayName ?? user?.email ?? 'User';
  const dashboardRoute = getDashboardRoute({
    accountType,
    orgId: dbUser?.orgId,
    roles: dbUser?.roles,
  });

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
        <a href="/" className="flex items-center shrink-0">
          <BrandLogo variant="white" className="h-9 w-auto" />
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
            <UserMenu displayName={displayName} dashboardRoute={dashboardRoute} />
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
            {user && (
              <a
                href="/dashboard/messages"
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium ${isActive('/dashboard/messages') ? 'text-white' : 'text-white/70'}`}
              >
                Messages
              </a>
            )}
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
                    onClick={() => { setMenuOpen(false); navigate(dashboardRoute); }}
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
                  <button onClick={() => { setMenuOpen(false); navigate('/whats-new'); }} className="self-start text-sm font-medium text-white/70 hover:text-white transition-colors">What’s New</button>
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
