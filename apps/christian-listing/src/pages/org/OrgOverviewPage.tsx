import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { CalendarIcon, BriefcaseIcon, ListBulletIcon } from '../../components/layout/icons';
import { MY_ORGANISATIONS } from '../../graphql/mutations';

interface OrgSocialLinks {
  whatsapp:  string | null;
  instagram: string | null;
  facebook:  string | null;
  twitter:   string | null;
  website:   string | null;
}

interface OrgData {
  id:           string;
  name:         string | null;
  description:  string | null;
  logoUrl:      string | null;
  websiteUrl:   string | null;
  socialLinks:  OrgSocialLinks | null;
  region:       string | null;
  isVerified:   boolean;
  followerCount: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toString();
}

function OrgAvatarInitials({ name }: { name: string }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="w-full h-full bg-[#C9A96E] flex items-center justify-center text-white text-4xl font-bold">
      {initials || '?'}
    </div>
  );
}

// ── Org Profile Header ────────────────────────────────────────────────────────
function OrgProfileHeader({ org }: { org: OrgData }) {
  const socialEntries = org.socialLinks
    ? (['instagram', 'twitter', 'whatsapp', 'facebook'] as const)
        .map((k) => ({ key: k, handle: org.socialLinks![k] }))
        .filter((e) => !!e.handle)
        .slice(0, 2)
        .map((e) => ({ key: e.key, handle: e.handle! }))
    : [];

  const websiteDisplay = org.websiteUrl?.replace(/^https?:\/\//, '') ?? null;
  const websiteHref = org.websiteUrl
    ? org.websiteUrl.startsWith('http') ? org.websiteUrl : `https://${org.websiteUrl}`
    : null;

  return (
    <div className="bg-[#FDF8EE] px-10 py-12 flex items-start gap-8 font-sans min-w-max">

      {/* Left Column: Avatar */}
      <div className="relative shrink-0">
        <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200">
          {org.logoUrl ? (
            <img src={org.logoUrl} alt={org.name ?? 'Organisation'} className="w-full h-full object-cover" />
          ) : (
            <OrgAvatarInitials name={org.name ?? 'O'} />
          )}
        </div>
        {org.isVerified && (
          <div className="absolute bottom-2 right-2 bg-[#1B1B1B] text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-[#FDF8EE]">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.4 2.4 3.2-.8.8 3.2 2.4 2.4-2.4 2.4-.8 3.2-3.2-.8L12 22l-2.4-2.4-3.2.8-.8-3.2-2.4-2.4 2.4-2.4.8-3.2 3.2.8L12 2z" />
              <path fill="#FDF8EE" d="M10.5 15.5l-3-3 1.4-1.4 1.6 1.6 4.6-4.6 1.4 1.4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Right Column: Content */}
      <div className="flex flex-col w-full max-w-4xl">

        {/* Title & Edit Action */}
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-serif font-bold text-[#1B1B1B] tracking-tight">
            {org.name ?? 'Your Organisation'}
          </h1>
          <button
            className="text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Edit organisation name"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* Tagline */}
        {org.description && (
          <div className="border-l-[3px] border-gray-200 pl-4 mb-5">
            <p className="text-gray-600 italic text-lg tracking-wide">
              "{org.description}"
            </p>
          </div>
        )}

        {/* Stats & Links */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
          <span><strong className="text-[#1B1B1B] font-semibold">{formatCount(org.followerCount)}</strong> Followers</span>
          {websiteHref && websiteDisplay && (
            <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#1B1B1B] hover:underline font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {websiteDisplay}
            </a>
          )}
        </div>

        {/* White Dashed Container: Mission & Social */}
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 flex flex-col md:flex-row gap-8">

          {/* Mission Section */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider mb-3 uppercase">
              Our Mission
            </h3>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              {org.description ?? 'Add a mission statement in your settings to inspire your community.'}
            </p>
          </div>

          {/* Social Section */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider mb-3 uppercase">
              Social Connection
            </h3>
            <div className="flex items-center gap-3">
              {socialEntries.length > 0 ? socialEntries.map(({ key, handle }) => (
                <button key={key} className="bg-[#FCEBBB] hover:bg-[#F9DF9F] transition-colors text-[#1B1B1B] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                  {handle}
                </button>
              )) : (
                <p className="text-sm text-gray-400 italic">No social links added yet.</p>
              )}
              <button className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AnalyticsAtAGlance() {
  const analyticsData = [
    {
      title: 'Total Views',
      description: 'Views received by your listings this week',
      value: '22.5 K',
      change: '+14%',
      isPositive: true,
      previous: '18.6k',
      bgClass: 'bg-[#FEFCE2]',
      borderClass: 'border-[#EBEAAB]',
    },
    {
      title: 'Total Clicks',
      description: 'Clicks received on all your listings this week',
      value: '3.5 K',
      change: '-14%',
      isPositive: false,
      previous: '18.6k',
      bgClass: 'bg-[#ECFDE8]',
      borderClass: 'border-[#C8E8BC]',
    },
    {
      title: 'CTR',
      description: 'Total Clicks / Total Views',
      value: '5%',
      change: '+45%',
      isPositive: true,
      previous: '2.5%',
      bgClass: 'bg-[#FFF3F2]',
      borderClass: 'border-[#EBE0DF]',
    },
    {
      title: 'Engagement',
      description: 'Views received by your listings this week',
      value: '15%',
      change: '+5%',
      isPositive: true,
      previous: '18.6k',
      bgClass: 'bg-[#F2FCFA]',
      borderClass: 'border-[#D9EBE8]',
    },
    {
      title: 'Listings',
      description: 'Total Listings added this week',
      value: '125',
      change: '± 0%',
      isPositive: true, // Styling as green in the image
      previous: '125',
      bgClass: 'bg-[#FDF0F5]',
      borderClass: 'border-[#EADCE3]',
    },
  ];

  return (
    <div className="font-sans max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-serif font-bold text-[#1B1B1B] mb-6">
        Analytics at a Glance
      </h2>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {analyticsData.map((data, index) => (
          <div
            key={index}
            className={`${data.bgClass} border ${data.borderClass} rounded-xl p-5 flex flex-col justify-between min-h-[160px]`}
          >
            <div>
              {/* Header: Icon + Title */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-[#1B1B1B] flex items-center justify-center text-white shrink-0">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1B1B1B] leading-none">
                  {data.title}
                </h3>
              </div>

               {/* Description */}
              <p className="text-[11px] text-gray-500 leading-snug pr-2">
                {data.description}
              </p>
            </div>

            <div className="mt-4">
              {/* Value & Change */}
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-serif text-3xl font-bold text-[#1B1B1B]">
                  {data.value}
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    data.isPositive ? 'text-[#367A26]' : 'text-[#D03027]'
                  }`}
                >
                  {data.change}
                </span>
              </div>

              {/* Previous Week Footer */}
              <p className="text-[11px] text-gray-500">
                (v/s &nbsp;{data.previous} Last Week)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationCentre() {
  // Mock data to match the 6 repeated items in the image
  const notifications = Array(6).fill({
    title: 'New Job Application Added',
    time: '5 hours ago',
    context: 'Project Coordinator',
  });

  return (
    <div className="font-sans w-full max-w-[400px] border border-gray-200 rounded-2xl bg-white p-6 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-[#1B1B1B]">
          Notification Centre
        </h2>
        <span className="bg-[#41331C] text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
          5 New
        </span>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-6 flex-1 mb-6">
        {notifications.map((notification, index) => (
          <div key={index} className="flex gap-4 items-start">
            {/* Icon Circle */}
            <div className="w-10 h-10 rounded-full bg-[#FCEBBB] flex items-center justify-center shrink-0 text-[#1B1B1B]">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                <path d="M16 7h-1.5v1.5h-1.5V7H11.5V5.5H13V4h1.5v1.5H16V7z" />
              </svg>
            </div>
            
            {/* Text Content */}
            <div className="mt-0.5">
              <h4 className="font-semibold text-[#1B1B1B] text-[15px] leading-tight">
                {notification.title}
              </h4>
              <p className="text-[12px] text-gray-500 mt-1">
                {notification.time} &bull; {notification.context}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / View All Link */}
      <div className="border-t border-gray-100 pt-5 pb-3 text-center">
        <button className="text-[12px] font-semibold text-gray-400 hover:text-gray-700 transition-colors">
          View All Notifications
        </button>
      </div>

      {/* Promo Box */}
      <div className="bg-[#41331C] rounded-xl p-6 mt-2">
        <h3 className="font-serif text-lg font-medium text-[#FDF8EE] mb-1.5">
          Reach more people.
        </h3>
        <p className="text-[13px] text-[#FDF8EE]/80 leading-snug mb-5 pr-4">
          Boost your listings to appear at the top of community searches.
        </p>
        <button className="w-full bg-white text-[#1B1B1B] font-bold py-2.5 rounded-lg text-[13px] hover:bg-gray-100 transition-colors shadow-sm">
          Boost Presence
        </button>
      </div>
      
    </div>
  );
}

function MarketplaceMessages() {
  // Mock data to match the 4 repeated items in the image
  const messages = Array(4).fill({
    id: crypto.randomUUID(),
    name: 'CL User',
    avatarUrl: 'https://i.pravatar.cc/150?img=11', // Placeholder avatar
    preview: "Hello! I'm interested in buying your bible for sale....",
    time: '10m ago',
    isUnread: true,
  });

  return (
    <div className="font-sans w-full bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200">
        <h2 className="text-2xl font-serif font-bold text-[#1B1B1B]">
          Marketplace Messages
        </h2>
        <button className="text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors">
          Open Inbox
        </button>
      </div>

      {/* Messages List */}
      <div className="flex flex-col">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-4 px-6 py-4 ${
              index !== messages.length - 1 ? 'border-b border-gray-100' : ''
            } hover:bg-gray-50/50 transition-colors cursor-pointer`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
              <img 
                src={message.avatarUrl} 
                alt={message.name} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Container */}
            <div className="flex-1 min-w-0">
              {/* Top Row: Name & Meta */}
              <div className="flex justify-between items-center mb-0.5">
                <h4 className="font-bold text-[#1B1B1B] text-[14px]">
                  {message.name}
                </h4>
                
                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <span className="text-[12px] text-gray-400 font-medium">
                    {message.time}
                  </span>
                  {message.isUnread && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1B1B1B]" />
                  )}
                </div>
              </div>

              {/* Bottom Row: Message Preview */}
              <p className="text-[13px] text-gray-500 truncate pr-4">
                {message.preview}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ── Shared 3-dot action button ────────────────────────────────────────────────
function RowActions() {
  return (
    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>
  );
}

function ViewsCell({ views }: { views: string }) {
  return (
    <div className="flex items-center gap-1.5 text-gray-500 text-[13px]">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      {views}
    </div>
  );
}

// ── Tab: All Listings ─────────────────────────────────────────────────────────
const ALL_LISTINGS_DATA = [
  { id: 1, title: 'Community Prayer Night', sub: '14 Jul 2025 · In Person', badge: 'EVENT',       badgeCls: 'bg-[#9C5177] text-white',  views: '3.1k views', count: '87',  label: 'RSVPs' },
  { id: 2, title: 'Project Coordinator (Teaching Aid)', sub: 'Lagos (Hybrid)',  badge: 'JOB',         badgeCls: 'bg-[#121958] text-white',  views: '1.2k views', count: '24',  label: 'Applications' },
  { id: 3, title: 'Study Bible — Good Condition',       sub: 'Marketplace · Good', badge: 'LISTING', badgeCls: 'bg-[#0F6D1A] text-white',  views: '540 views',  count: '6',   label: 'Enquiries' },
];

function AllListingsTab() {
  const iconMap: Record<string, JSX.Element> = {
    EVENT: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    JOB: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    LISTING: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  };

  return (
    <>
      {ALL_LISTINGS_DATA.map((item, index) => (
        <div key={item.id} className={`px-6 py-5 grid grid-cols-[2.5fr_1fr_1fr_1fr_auto] gap-4 items-center ${index !== ALL_LISTINGS_DATA.length - 1 ? 'border-b border-gray-100' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-[#EAEAF5] flex items-center justify-center shrink-0 text-[#1B1B1B]">
              {iconMap[item.badge]}
            </div>
            <div>
              <h4 className="font-bold text-[#1B1B1B] text-[15px] leading-snug">{item.title}</h4>
              <p className="text-[13px] text-gray-500 mt-0.5">{item.sub}</p>
            </div>
          </div>
          <div><span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${item.badgeCls}`}>{item.badge}</span></div>
          <ViewsCell views={item.views} />
          <div className="text-[13px] text-gray-500"><strong className="text-[#1B1B1B] font-bold">{item.count}</strong> {item.label}</div>
          <RowActions />
        </div>
      ))}
    </>
  );
}

// ── Tab: Events (RSVPs) ───────────────────────────────────────────────────────
const EVENTS_DATA = [
  { id: 1, title: 'Community Prayer Night',        date: '14 Jul 2025', venue: 'In Person · Lagos',   category: 'Worship & Prayer',       catCls: 'bg-[#6B21A8] text-white',  views: '3.1k views', rsvpTotal: '87',  confirmed: '42' },
  { id: 2, title: 'Youth Leadership Conference',   date: '22 Aug 2025', venue: 'Hybrid · Abuja',      category: 'Youth & Young Adults',   catCls: 'bg-[#0369A1] text-white',  views: '2.4k views', rsvpTotal: '134', confirmed: '89' },
  { id: 3, title: 'Monthly Bible Study',           date: '05 Jul 2025', venue: 'Online',               category: 'Bible Study & Theology', catCls: 'bg-[#065F46] text-white',  views: '980 views',  rsvpTotal: '56',  confirmed: '31' },
];

function EventsTab() {
  return (
    <>
      {EVENTS_DATA.map((item, index) => (
        <div key={item.id} className={`px-6 py-5 grid grid-cols-[2.5fr_1fr_1fr_1fr_auto] gap-4 items-center ${index !== EVENTS_DATA.length - 1 ? 'border-b border-gray-100' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-[#F3E8FF] flex items-center justify-center shrink-0 text-[#6B21A8]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[#1B1B1B] text-[15px] leading-snug">{item.title}</h4>
              <p className="text-[13px] text-gray-500 mt-0.5">{item.date} · {item.venue}</p>
            </div>
          </div>
          <div><span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap ${item.catCls}`}>{item.category}</span></div>
          <ViewsCell views={item.views} />
          <div className="text-[13px] text-gray-500">
            <strong className="text-[#1B1B1B] font-bold">{item.rsvpTotal}</strong> RSVPs
            <span className="text-[11px] text-[#0F6D1A] font-medium ml-1.5">({item.confirmed} confirmed)</span>
          </div>
          <RowActions />
        </div>
      ))}
    </>
  );
}

// ── Tab: Jobs (Apps) ──────────────────────────────────────────────────────────
const JOBS_DATA = [
  { id: 1, title: 'Project Coordinator (Teaching Aid)', location: 'Lagos (Hybrid)',  roleType: 'PAID',        roleCls: 'bg-[#121958] text-white',  views: '1.2k views', apps: '24', deadline: '31 Jul 2025' },
  { id: 2, title: 'Community Outreach Volunteer',       location: 'Remote',          roleType: 'VOLUNTEER',   roleCls: 'bg-[#065F46] text-white',  views: '870 views',  apps: '11', deadline: '15 Aug 2025' },
  { id: 3, title: 'Communications Intern',              location: 'London (On-site)',  roleType: 'INTERNSHIP',  roleCls: 'bg-[#92400E] text-white',  views: '640 views',  apps: '7',  deadline: '20 Jul 2025' },
];

function JobsTab() {
  return (
    <>
      {JOBS_DATA.map((item, index) => (
        <div key={item.id} className={`px-6 py-5 grid grid-cols-[2.5fr_1fr_1fr_1fr_auto] gap-4 items-center ${index !== JOBS_DATA.length - 1 ? 'border-b border-gray-100' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#121958]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[#1B1B1B] text-[15px] leading-snug">{item.title}</h4>
              <p className="text-[13px] text-gray-500 mt-0.5">{item.location} · Deadline {item.deadline}</p>
            </div>
          </div>
          <div><span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${item.roleCls}`}>{item.roleType}</span></div>
          <ViewsCell views={item.views} />
          <div className="text-[13px] text-gray-500"><strong className="text-[#1B1B1B] font-bold">{item.apps}</strong> Applications</div>
          <RowActions />
        </div>
      ))}
    </>
  );
}

// ── Tab: Marketplace ──────────────────────────────────────────────────────────
const MARKETPLACE_DATA = [
  { id: 1, title: 'Study Bible — ESV (Like New)',    location: 'London, UK',   condition: 'Like New', condCls: 'bg-[#ECFDE8] text-[#0F6D1A]', price: '£12',  views: '540 views', enquiries: '6' },
  { id: 2, title: 'Church Projector Screen 120"',    location: 'Lagos, NG',    condition: 'Good',     condCls: 'bg-[#FEF9C3] text-[#854D0E]', price: '₦45k', views: '1.1k views', enquiries: '14' },
  { id: 3, title: 'Children\'s Ministry Craft Kit',  location: 'Manchester, UK', condition: 'New',    condCls: 'bg-[#DBEAFE] text-[#1E40AF]', price: 'Free', views: '320 views', enquiries: '3', isDonation: true },
];

function MarketplaceTab() {
  return (
    <>
      {MARKETPLACE_DATA.map((item, index) => (
        <div key={item.id} className={`px-6 py-5 grid grid-cols-[2.5fr_1fr_1fr_1fr_auto] gap-4 items-center ${index !== MARKETPLACE_DATA.length - 1 ? 'border-b border-gray-100' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-[#F0FDF4] flex items-center justify-center shrink-0 text-[#0F6D1A]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[#1B1B1B] text-[15px] leading-snug">
                {item.title}
                {item.isDonation && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C9A96E]/20 text-[#92400E] uppercase tracking-wide">Donation</span>
                )}
              </h4>
              <p className="text-[13px] text-gray-500 mt-0.5">{item.location}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide w-fit ${item.condCls}`}>{item.condition}</span>
            <span className="text-[13px] font-bold text-[#1B1B1B]">{item.price}</span>
          </div>
          <ViewsCell views={item.views} />
          <div className="text-[13px] text-gray-500"><strong className="text-[#1B1B1B] font-bold">{item.enquiries}</strong> Enquiries</div>
          <RowActions />
        </div>
      ))}
    </>
  );
}

// ── ListingsManager ───────────────────────────────────────────────────────────
const LISTINGS_TABS = ['All Listings', 'Events (RSVPs)', 'Jobs (Apps)', 'Marketplace'] as const;
type ListingsTab = typeof LISTINGS_TABS[number];

const TAB_HEADER_LABELS: Record<ListingsTab, string> = {
  'All Listings':   'Type',
  'Events (RSVPs)': 'Category',
  'Jobs (Apps)':    'Role Type',
  'Marketplace':    'Condition',
};

function ListingsManager() {
  const [activeTab, setActiveTab] = useState<ListingsTab>('All Listings');

  return (
    <div className="font-sans max-w-5xl mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6">
        <h2 className="text-3xl font-serif font-bold text-[#1B1B1B] mb-6">Listings Manager</h2>
        <div className="flex items-center gap-8 border-b border-gray-200">
          {LISTINGS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-[#1B1B1B]' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#1B1B1B]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-[#FAF6ED] px-6 py-3 border-b border-gray-200 grid grid-cols-[2.5fr_1fr_1fr_1fr_auto] gap-4 text-[11px] font-bold text-gray-600 tracking-wider uppercase">
        <div>Listing Details</div>
        <div>{TAB_HEADER_LABELS[activeTab]}</div>
        <div>Metrics</div>
        <div>Activity</div>
        <div className="w-6" />
      </div>

      {/* Table Body */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'All Listings'   && <AllListingsTab />}
        {activeTab === 'Events (RSVPs)' && <EventsTab />}
        {activeTab === 'Jobs (Apps)'    && <JobsTab />}
        {activeTab === 'Marketplace'    && <MarketplaceTab />}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
        <button className="text-[13px] font-semibold text-[#1B1B1B] hover:text-[#C9A96E] transition-colors flex items-center gap-1">
          View all
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
// ── Creation Centre ───────────────────────────────────────────────────────────
const CREATION_TABS = [
  { label: 'Create Event',   icon: CalendarIcon },
  { label: 'Create Listing', icon: ListBulletIcon },
  { label: 'Create Jobs',    icon: BriefcaseIcon },
] as const;

const EVENT_CATEGORY_PILLS = [
  'Worship & Prayer', 'Bible Study & Theology', 'Community & Social',
  'Conferences & Seminars', 'Youth & Young Adults', 'Music & Arts',
  'Charity & Welfare', 'Cultural & Heritage', 'Other',
];

function CreateEventForm() {
  const [eventType, setEventType] = useState<'PHYSICAL' | 'VIRTUAL' | 'HYBRID'>('PHYSICAL');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event Title</label>
        <input
          type="text"
          placeholder="Give your event a clear, welcoming name..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
        />
      </div>

      {/* Event Type (category pills) */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Event Type</label>
        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORY_PILLS.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategories.includes(cat)
                  ? 'bg-[#1B1B1B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event Description</label>
        <textarea
          rows={3}
          placeholder="Share the event description, for users to understand the vision and purpose behind the gathering..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E] resize-none"
        />
      </div>

      {/* Date / Time / Location */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
          <input
            type="date"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Time</label>
          <input
            type="time"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {(['PHYSICAL', 'VIRTUAL', 'HYBRID'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setEventType(t)}
                className={`flex-1 py-2.5 transition-colors ${
                  eventType === t ? 'bg-[#1B1B1B] text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t === 'PHYSICAL' ? 'Venue' : t === 'VIRTUAL' ? 'Virtual' : 'Hybrid'}
              </button>
            ))}
          </div>
          {eventType !== 'VIRTUAL' && (
            <input
              type="text"
              placeholder="Street address or venue name"
              className="w-full mt-2 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
            />
          )}
          {eventType !== 'PHYSICAL' && (
            <input
              type="url"
              placeholder="Online meeting link"
              className="w-full mt-2 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
            />
          )}
        </div>
      </div>

      {/* Region Tag */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Region Tag</label>
        <input
          type="text"
          placeholder="Select a region for better local discovery..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
        />
      </div>

      {/* Media Gallery */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Media Gallery <span className="text-gray-400 font-normal">(up to 10)</span>
        </label>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <p className="text-xs text-gray-400">Click to upload gallery images / videos</p>
        </div>
      </div>

      {/* Embed Video */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Embed Video</label>
        <input
          type="url"
          placeholder="YouTube URL"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
        />
      </div>

      {/* RSVP Configuration */}
      <div>
        <h3 className="text-sm font-semibold text-[#1B1B1B] mb-3">RSVP Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Capacity</label>
            <input
              type="number"
              placeholder="Select total capacity of attendees..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
            />
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 accent-[#C9A96E]" />
              Enable automatic waitlist
            </label>
          </div>
        </div>

        {/* RSVP Stage indicators */}
        <div className="flex items-center gap-3 mt-4">
          {['Interested', 'Saved', 'Confirmed'].map((stage, i) => (
            <div key={stage} className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1B1B] text-white text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
                {stage}
              </div>
              {i < 2 && <span className="text-gray-300 text-sm">→</span>}
            </div>
          ))}
        </div>

        {/* Ticket + Notifications */}
        <div className="flex flex-col gap-2 mt-4">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 accent-[#C9A96E]" />
            This is a Ticket Event
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 accent-[#C9A96E]" />
            Send Email Notifications to users
            <span className="px-1.5 py-0.5 rounded bg-[#C9A96E]/20 text-[#C9A96E] text-[10px] font-semibold">Pro</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Preview Draft
        </button>
        <button className="px-6 py-2.5 rounded-lg bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors">
          Publish Event
        </button>
      </div>
    </div>
  );
}

const LISTING_CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Furniture',
  'Food', 'Baby & Kids', 'Charity Items', 'Other',
];

const LISTING_CONDITIONS = ['New', 'Like New', 'Good', 'Fair'] as const;
const LISTING_CURRENCIES = ['GBP (£)', 'NGN (₦)', 'USD ($)', 'EUR (€)'] as const;

function CreateListingForm() {
  const [condition, setCondition]       = useState<typeof LISTING_CONDITIONS[number]>('New');
  const [currency, setCurrency]         = useState<typeof LISTING_CURRENCIES[number]>('GBP (£)');
  const [selectedCategory, setCategory] = useState<string | null>(null);
  const [isDonation, setIsDonation]     = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Item Title</label>
        <input
          type="text"
          placeholder="What are you selling or giving away?"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {LISTING_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1B1B1B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Condition</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
          {LISTING_CONDITIONS.map((c) => (
            <button
              key={c}
              onClick={() => setCondition(c)}
              className={`flex-1 py-2.5 transition-colors ${
                condition === c ? 'bg-[#1B1B1B] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
        <textarea
          rows={3}
          placeholder="Describe the item — condition details, size, age, reason for selling..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E] resize-none"
        />
      </div>

      {/* Price + Donation toggle */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-600">Price</label>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
            <span>This is a free donation</span>
            <button
              role="switch"
              aria-checked={isDonation}
              onClick={() => setIsDonation((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isDonation ? 'bg-[#C9A96E]' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isDonation ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </label>
        </div>

        {isDonation ? (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-dashed border-[#C9A96E]/50 bg-[#C9A96E]/5">
            <span className="text-sm text-[#92400E] font-medium">Listed as Free — Community Donation</span>
          </div>
        ) : (
          <div className="flex gap-2">
            {/* Currency selector */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 font-medium hover:border-gray-300 transition-colors whitespace-nowrap"
              >
                {currency}
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCurrencyMenu && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {LISTING_CURRENCIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCurrency(c); setShowCurrencyMenu(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        currency === c ? 'bg-[#FAF6ED] font-semibold text-[#1B1B1B]' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Amount */}
            <input
              type="number"
              min="0"
              placeholder="0.00"
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
            />
          </div>
        )}
      </div>

      {/* Location + Region */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">General Location</label>
          <input
            type="text"
            placeholder="Area or neighbourhood (e.g. Peckham, Lagos Island)"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
          />
          <p className="text-[11px] text-gray-400 mt-1">Don't share your precise address</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Region Tag</label>
          <input
            type="text"
            placeholder="e.g. United Kingdom, Nigeria..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
          />
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Photos <span className="text-gray-400 font-normal">(up to 8)</span>
        </label>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-[#C9A96E]/50 transition-colors cursor-pointer">
          <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 3.75H3M12 3v9m0 0l-3-3m3 3l3-3" />
          </svg>
          <p className="text-xs text-gray-400">Click to upload photos</p>
          <p className="text-[11px] text-gray-300 mt-0.5">Images are automatically compressed for fast loading</p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Preview Draft
        </button>
        <button className="px-6 py-2.5 rounded-lg bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors">
          Publish Listing
        </button>
      </div>
    </div>
  );
}

const JOB_ROLE_TYPES = ['Paid', 'Volunteer', 'Internship'] as const;
const JOB_LOCATION_TYPES = ['Physical', 'Remote', 'Hybrid'] as const;
const JOB_FAITH_TAGS = ['Open to All', 'Faith Background Preferred'] as const;

const SKILL_SUGGESTIONS = [
  'Project Management', 'Social Media', 'Accounting', 'Counselling',
  'Teaching', 'Driving Licence', 'Graphic Design', 'IT Support',
  'Community Outreach', 'Event Planning', 'Legal', 'Healthcare',
];

function CreateJobsForm() {
  const [roleType, setRoleType]         = useState<typeof JOB_ROLE_TYPES[number]>('Paid');
  const [locationType, setLocationType] = useState<typeof JOB_LOCATION_TYPES[number]>('Physical');
  const [faithTag, setFaithTag]         = useState<typeof JOB_FAITH_TAGS[number]>('Open to All');
  const [skills, setSkills]             = useState<string[]>([]);
  const [customSkill, setCustomSkill]   = useState('');
  const [showSalary, setShowSalary]     = useState(false);

  const toggleSkill = (skill: string) =>
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills((prev) => [...prev, trimmed]);
    setCustomSkill('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Job Title</label>
        <input
          type="text"
          placeholder="e.g. Community Outreach Coordinator, Finance Volunteer..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
        />
      </div>

      {/* Role Type + Location Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role Type</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {JOB_ROLE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setRoleType(t)}
                className={`flex-1 py-2.5 transition-colors ${roleType === t ? 'bg-[#1B1B1B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Work Location</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {JOB_LOCATION_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setLocationType(t)}
                className={`flex-1 py-2.5 transition-colors ${locationType === t ? 'bg-[#1B1B1B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
          {locationType !== 'Remote' && (
            <input
              type="text"
              placeholder="City or address"
              className="w-full mt-2 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
            />
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role Description</label>
        <textarea
          rows={3}
          placeholder="Describe the role, its purpose, and what makes it meaningful..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E] resize-none"
        />
      </div>

      {/* Responsibilities */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Key Responsibilities</label>
        <textarea
          rows={3}
          placeholder="List the main duties and day-to-day responsibilities..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E] resize-none"
        />
      </div>

      {/* Skill Tags */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Required Skills</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SKILL_SUGGESTIONS.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                skills.includes(skill) ? 'bg-[#1B1B1B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
        {/* Selected custom skills */}
        {skills.filter((s) => !SKILL_SUGGESTIONS.includes(s)).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.filter((s) => !SKILL_SUGGESTIONS.includes(s)).map((skill) => (
              <span key={skill} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1B1B1B] text-white">
                {skill}
                <button onClick={() => toggleSkill(skill)} className="ml-0.5 opacity-60 hover:opacity-100">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        {/* Custom skill input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
            placeholder="Add a custom skill and press Enter..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
          />
          <button
            onClick={addCustomSkill}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Deadline + Region */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Application Deadline</label>
          <input
            type="date"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Region Tag</label>
          <input
            type="text"
            placeholder="e.g. United Kingdom, Nigeria..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
          />
        </div>
      </div>

      {/* Salary Range (optional) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-600">Salary Range</label>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
            <span>Include salary</span>
            <button
              role="switch"
              aria-checked={showSalary}
              onClick={() => setShowSalary((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showSalary ? 'bg-[#C9A96E]' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${showSalary ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </label>
        </div>
        {showSalary ? (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Min (e.g. £25,000)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
            />
            <input
              type="text"
              placeholder="Max (e.g. £35,000)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
            />
          </div>
        ) : (
          <p className="text-[12px] text-gray-400 px-1">Salary hidden — candidates will see "Competitive"</p>
        )}
      </div>

      {/* External Apply URL */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">External Application URL</label>
        <input
          type="url"
          placeholder="https://yourorganisation.org/apply or mailto:jobs@org.com"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/40 focus:border-[#C9A96E]"
        />
        <p className="text-[11px] text-gray-400 mt-1">Candidates will be redirected here when they click Apply</p>
      </div>

      {/* Faith Alignment */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Faith Alignment</label>
        <div className="flex gap-3">
          {JOB_FAITH_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setFaithTag(tag)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                faithTag === tag
                  ? 'border-[#1B1B1B] bg-[#1B1B1B] text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${faithTag === tag ? 'bg-[#C9A96E]' : 'bg-gray-300'}`} />
              {tag}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2 px-1">Helps candidates understand expectations upfront</p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Preview Draft
        </button>
        <button className="px-6 py-2.5 rounded-lg bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors">
          Post Job
        </button>
      </div>
    </div>
  );
}

function CreationCentre() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#1B1B1B]">Creation Centre</h2>
        <p className="text-xs text-gray-400 mt-0.5">Keep building a better world</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {CREATION_TABS.map(({ label, icon: Icon }, i) => (
          <button
            key={label}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === i
                ? 'border-[#1B1B1B] text-[#1B1B1B]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="px-6 py-6">
        {activeTab === 0 && <CreateEventForm />}
        {activeTab === 1 && <CreateListingForm />}
        {activeTab === 2 && <CreateJobsForm />}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OrgOverviewPage() {
  const { data, loading } = useQuery<{ myOrganisations: OrgData[] }>(MY_ORGANISATIONS);
  const org = data?.myOrganisations?.[0] ?? null;

  return (
    <div className="min-h-screen bg-white">
      {loading ? (
        <div className="bg-[#FDF8EE] h-64 flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : org ? (
        <OrgProfileHeader org={org} />
      ) : (
        <div className="bg-[#FDF8EE] px-10 py-16 text-center">
          <p className="text-gray-500 text-sm mb-3">No organisation found.</p>
          <a href="/org/signup" className="text-sm font-semibold text-[#C9A96E] underline">
            Set one up →
          </a>
        </div>
      )}

      <AnalyticsAtAGlance />

      <ListingsManager />

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-6 items-start">
          <div className="col-span-2">
            <MarketplaceMessages />
          </div>
          <NotificationCentre />
        </div>

        <CreationCentre />
      </div>
    </div>
  );
}
