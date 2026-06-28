import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MY_ORGANISATIONS } from '../../graphql/mutations';
import {
  BriefcaseIcon,
  CalendarIcon,
  ChatBubbleIcon,
  ChevronLeftIcon,
  ChurchLogo,
  CogIcon,
  GridIcon,
  ListBulletIcon,
  MapPinIcon,
} from './icons';

const TOP_NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Events',      href: '/events' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Jobs',        href: '/jobs' },
] as const;

const NAV_ITEMS = [
  { label: 'Overview',         icon: GridIcon,       path: '/org' },
  { label: 'Events Manager',   icon: CalendarIcon,   path: '/org/events' },
  { label: 'Listings Manager', icon: ListBulletIcon, path: '/org/listings' },
  { label: 'Hiring & Jobs',    icon: BriefcaseIcon,  path: '/org/jobs' },
  { label: 'Messages',         icon: ChatBubbleIcon, path: '/org/messages' },
  { label: 'Settings',         icon: CogIcon,        path: '/org/settings' },
] as const;

function OrgTopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center px-6 gap-8">
      <a href="/" className="flex items-center gap-2.5 shrink-0">
        <ChurchLogo color="#1B1B1B" className="w-7 h-[34px]" />
        <span className="text-[#1B1B1B] font-semibold text-xs tracking-widest uppercase leading-tight">
          Christian
          <br />
          Listings
        </span>
      </a>

      <nav className="hidden md:flex items-center gap-6 flex-1">
        {TOP_NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="text-sm font-medium text-gray-500 hover:text-[#1B1B1B] transition-colors"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3 ml-auto">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-400 transition-colors">
          <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
          United Kingdom
        </button>
        <button className="px-4 py-1.5 rounded-full bg-[#C9A96E] text-white text-xs font-semibold hover:bg-[#b8965e] transition-colors">
          Profile
        </button>
      </div>
    </header>
  );
}

export default function OrgLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const { data: orgData } = useQuery<{ myOrganisations: { id: string; name: string | null }[] }>(MY_ORGANISATIONS);
  const orgName = orgData?.myOrganisations?.[0]?.name ?? 'Organisation';
  const orgInitials = orgName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-[#FEF7E9]">
      <OrgTopBar />

      {/* Light sidebar — starts below top bar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 flex flex-col bg-white border-r border-gray-100 transition-all duration-200 z-40 ${
          collapsed ? 'w-[60px]' : 'w-56'
        }`}
      >
        {/* Org name + role */}
        <div className={`shrink-0 border-b border-gray-100 ${collapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
          {!collapsed ? (
            <>
              <p
                className="text-[#1B1B1B] truncate"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 16, lineHeight: '20px', letterSpacing: 0 }}
              >
                {orgName}
              </p>
              <p
                className="text-gray-400 mt-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 10, lineHeight: '12px', letterSpacing: '0.6px', textTransform: 'uppercase' }}
              >
                Admin Dashboard
              </p>
            </>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#C9A96E] flex items-center justify-center text-white text-xs font-bold mx-auto">
              {orgInitials}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#FEF7E9] text-[#1B1B1B] font-medium'
                    : 'text-gray-500 hover:text-[#1B1B1B] hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1B1B1B]' : 'text-gray-400'}`} />
                {!collapsed && (
                  <span
                    className="truncate"
                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: 13, lineHeight: '16.8px', letterSpacing: '0.7px' }}
                  >
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center gap-2 text-gray-400 hover:text-gray-600 text-xs transition-colors"
          >
            <ChevronLeftIcon
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && <span>Hide Corner</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-200 pt-16 ${collapsed ? 'ml-[60px]' : 'ml-56'}`}>
        <Outlet />
      </div>
    </div>
  );
}
