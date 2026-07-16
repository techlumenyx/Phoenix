import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth, type AdminRole } from '../auth/authStore';
import AdminNotifications from './AdminNotifications';

type IconName = 'overview' | 'shield' | 'check' | 'users' | 'building' | 'content' | 'chart' | 'audit' | 'star' | 'system';

const navigation: Array<{ label: string; items: Array<{ label: string; to: string; icon: IconName; roles?: AdminRole[] }> }> = [
  { label: 'Work', items: [
    { label: 'Overview', to: '/', icon: 'overview' },
    { label: 'Moderation', to: '/moderation', icon: 'shield', roles: ['TRUST_SAFETY', 'AUDITOR'] },
    { label: 'Verifications', to: '/verifications', icon: 'check', roles: ['VERIFICATION_REVIEWER', 'AUDITOR'] },
  ] },
  { label: 'Directory', items: [
    { label: 'Users', to: '/users', icon: 'users', roles: ['SUPPORT_AGENT', 'TRUST_SAFETY', 'AUDITOR'] },
    { label: 'Organisations', to: '/organisations', icon: 'building', roles: ['SUPPORT_AGENT', 'TRUST_SAFETY', 'VERIFICATION_REVIEWER', 'AUDITOR'] },
    { label: 'Content', to: '/content/events', icon: 'content', roles: ['CONTENT_MANAGER', 'TRUST_SAFETY', 'AUDITOR'] },
  ] },
  { label: 'Platform', items: [
    { label: 'Analytics', to: '/analytics', icon: 'chart' },
    { label: 'Audit log', to: '/audit', icon: 'audit', roles: ['AUDITOR', 'TRUST_SAFETY'] },
    { label: 'Templates', to: '/templates', icon: 'content', roles: ['TRUST_SAFETY', 'VERIFICATION_REVIEWER', 'CONTENT_MANAGER', 'SUPPORT_AGENT', 'AUDITOR'] },
    { label: 'Highlights', to: '/curation', icon: 'star', roles: ['CONTENT_MANAGER'] },
    { label: 'System health', to: '/system', icon: 'system', roles: ['AUDITOR'] },
  ] },
];

export default function AdminShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const routeHeading = useRef<HTMLHeadingElement>(null);
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const initials = admin?.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() ?? 'A';
  const currentTitle = location.pathname.startsWith('/moderation/')
    ? 'Moderation case'
    : location.pathname.startsWith('/verifications/')
      ? 'Verification submission'
    : navigation.flatMap((group) => group.items).find((item) => item.to === location.pathname)?.label ?? 'Christian Listings Admin';
  const canSee = (roles?: AdminRole[]) => !roles || admin?.roles.includes('SUPER_ADMIN') || roles.some((role) => admin?.roles.includes(role));
  useEffect(() => {
    setMobileNavOpen(false);
    routeHeading.current?.focus();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172B4D]">
      <a href="#admin-main" className="skip-link">Skip to main content</a>
      {mobileNavOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setMobileNavOpen(false)} />}
      <aside id="admin-navigation" aria-label="Primary" className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#172B4D] text-white transition-transform lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
          <div className="grid h-8 w-8 place-items-center rounded bg-blue-500 text-sm font-bold">CL</div>
          <div>
            <p className="text-sm font-semibold leading-4">Christian Listings</p>
            <p className="text-[11px] text-slate-300">Administration</p>
          </div>
        </div>
        <nav className="admin-scrollbar flex-1 overflow-y-auto px-2 py-4" aria-label="Admin navigation">
          {navigation.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.label}</p>
              {group.items.filter((item) => canSee(item.roles)).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) => `mb-0.5 flex h-9 items-center gap-3 rounded px-3 text-sm transition ${isActive ? 'bg-white/15 font-semibold text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded px-2 py-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-500 text-xs font-bold">{initials}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{admin?.name}</p>
              <p className="truncate text-[10px] text-slate-300">{admin?.email}</p>
            </div>
            <button type="button" onClick={() => void logout()} className="rounded p-1.5 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Sign out">
              <Icon name="system" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#DFE1E6] bg-white px-4 sm:px-6">
          <button type="button" className="rounded p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation" aria-expanded={mobileNavOpen} aria-controls="admin-navigation">
            <span className="block h-0.5 w-5 bg-current" /><span className="mt-1 block h-0.5 w-5 bg-current" /><span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
          <h1 ref={routeHeading} tabIndex={-1} className="min-w-0 flex-1 truncate text-sm font-semibold text-[#172B4D] outline-none">{currentTitle}</h1>
          <NavLink to="/users" className="hidden h-8 w-64 items-center gap-2 rounded border border-[#DFE1E6] bg-[#F7F8FA] px-3 text-left text-xs text-slate-500 sm:flex">
            <span aria-hidden="true">⌕</span><span className="flex-1">Search admin…</span><kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
          </NavLink>
          <AdminNotifications />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#E9F2FF] text-xs font-bold text-blue-700 sm:hidden">{initials}</span>
        </header>
        <main id="admin-main" className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    overview: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></>,
    shield: <path d="M12 3l8 3v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3z" />,
    check: <><path d="M5 4h14v16H5z" /><path d="M8 12l2.5 2.5L16 9" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0112 0v2M16 5a3 3 0 010 6M18 14a5 5 0 013 4v2" /></>,
    building: <><path d="M4 21V7l8-4 8 4v14M8 10h2M14 10h2M8 14h2M14 14h2M10 21v-3h4v3" /></>,
    content: <><path d="M5 3h10l4 4v14H5zM15 3v5h5M8 12h8M8 16h8" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    audit: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    star: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z" />,
    system: <><path d="M12 3v8M8 5a8 8 0 108 0" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
