import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  CalendarIcon,
  ChatBubbleIcon,
  ChevronLeftIcon,
  ChurchLogo,
  CogIcon,
  GridIcon,
  ListBulletIcon,
} from './icons';

const NAV_ITEMS = [
  { label: 'Overview',         icon: GridIcon,       path: '/org' },
  { label: 'Events Manager',   icon: CalendarIcon,   path: '/org/events' },
  { label: 'Listings Manager', icon: ListBulletIcon, path: '/org/listings' },
  { label: 'Hiring & Jobs',    icon: BriefcaseIcon,  path: '/org/jobs' },
  { label: 'Messages',         icon: ChatBubbleIcon, path: '/org/messages' },
  { label: 'Settings',         icon: CogIcon,        path: '/org/settings' },
] as const;

export default function OrgLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F4F4F0]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 flex flex-col bg-[#1B1B1B] transition-all duration-200 z-40 ${
          collapsed ? 'w-[60px]' : 'w-56'
        }`}
      >
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-3 px-4 py-5 shrink-0 overflow-hidden"
        >
          <ChurchLogo className="shrink-0" />
          {!collapsed && (
            <span className="text-white font-semibold text-xs tracking-widest uppercase leading-tight whitespace-nowrap">
              Christian
              <br />
              Listings
            </span>
          )}
        </a>

        {/* Org name + role */}
        {!collapsed && (
          <div className="px-4 pb-4 border-b border-white/10 shrink-0">
            <p className="text-white text-sm font-semibold truncate">Grace Community</p>
            <p className="text-white/40 text-xs">Admin Dashboard</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 py-4 border-t border-white/10 shrink-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors"
          >
            <ChevronLeftIcon
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && <span>Hide Corner</span>}
          </button>
        </div>
      </aside>

      {/* Main content — offset by sidebar width */}
      <div className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-[60px]' : 'ml-56'}`}>
        <Outlet />
      </div>
    </div>
  );
}
