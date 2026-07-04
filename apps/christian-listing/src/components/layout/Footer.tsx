import { Link } from 'react-router-dom';
import { ChurchLogo } from './icons';

const LINKS = {
  Platform: [
    { label: 'Events',      to: '/events' },
    { label: 'Marketplace', to: '/marketplace' },
    { label: 'Jobs',        to: '/jobs' },
    { label: 'Organizations', to: '/org/signup' },
  ],
  Company: [
    { label: 'About Us',  to: '/' },
    { label: 'Blog',      to: '/' },
    { label: 'Careers',   to: '/' },
    { label: 'Contact',   to: '/' },
  ],
  Legal: [
    { label: 'Privacy Policy',    to: '/' },
    { label: 'Terms of Service',  to: '/' },
    { label: 'Cookie Policy',     to: '/' },
  ],
} as const;

export default function Footer() {
  return (
    <footer className="w-full bg-[#111111] text-white px-6 md:px-10 lg:px-16 pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5 w-fit">
              <ChurchLogo color="white" className="w-7 h-[34px]" />
              <span className="text-white font-semibold text-xs tracking-widest uppercase leading-tight">
                Christian
                <br />
                Listings
              </span>
            </Link>
            <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
              A curated ecosystem of faith-led ministries, community events, and grace-centered marketplaces.
            </p>
          </div>

          {/* Link columns */}
          {(Object.entries(LINKS) as [string, readonly { label: string; to: string }[]][]).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">{group}</p>
              {items.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Christian Listings. All rights reserved.
          </p>
          <p className="text-xs text-white/20">Made with faith &amp; purpose.</p>
        </div>
      </div>
    </footer>
  );
}
