import { useState } from 'react';
import { ArrowRightIcon } from '../layout/icons';
import EventCard from '../cards/EventCard';
import JobCard from '../cards/JobCard';
import MarketplaceCard from '../cards/MarketplaceCard';

const TABS = ['Trending', 'Top Listings'] as const;
type Tab = (typeof TABS)[number];

function ScriptureAdCard({ className = '' }: { className?: string }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#1A1A1A] flex flex-col ${className}`}>
      <img
        src="/assets/spotlight-ad.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col justify-end h-full p-5 gap-4">
        <p className="font-serif text-white text-lg leading-snug">
          "A generous person will prosper, whoever refreshes others will be refreshed."
        </p>
        <button className="self-start flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white transition-colors border border-white/30 rounded-full px-4 py-1.5">
          Know More <ArrowRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function SpotlightSection() {
  const [activeTab, setActiveTab] = useState<Tab>('Trending');

  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-16">
      {/* Section header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Curated Highlights
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark">
            The Spotlight
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 self-center">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-dark text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid — 2 same-height rows, 3 variable-width cards each */}
      <div className="flex flex-col gap-4">

        {/* Row 1 */}
        <div className="flex gap-4 h-[360px]">
          <div className="flex-[5] min-w-0">
            <EventCard
              badge="STUDY/WORSHIP"
              date="24 OCT 2026"
              title="Theology of Work: A Masterclass for Professionals"
              description="An evening of peace and calm aimed to help youngsters learn the word of God."
              location="Lagos City Centre"
              time="09:30 AM To 06:00 PM"
              invites="3500 Invites"
              likes="15K Likes"
              verified
              imageSrc="/assets/event-theology.png"
              className="h-full"
            />
          </div>
          <div className="flex-[3] min-w-0">
            <JobCard
              badge="JOB LISTING"
              badgeColor="blue"
              title="Project Coordinator"
              company="Grace Town Ministries"
              salaryRange="40k – 85k NGN"
              employmentType="Full Time Employment"
              location="Lagos City, Nigeria"
              verified
              className="h-full"
            />
          </div>
          <div className="flex-[3] min-w-0">
            <MarketplaceCard
              badge="FOR SALE"
              title="Ford Sierra 2012 Petrol"
              description="Used 2012 Model for Sale in Lagos"
              price="₦ 40,000 NGN"
              location="Lagos City, Nigeria"
              imageSrc="/assets/car-ford.png"
              verified
              className="h-full"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex gap-4 h-[360px]">
          <div className="flex-[4] min-w-0">
            <EventCard
              badge="STUDY/WORSHIP"
              title="Theology of Work: A Masterclass for Professionals"
              invites="3500 Invites"
              likes="15K Likes"
              imageSrc="/assets/event-theology.png"
              className="h-full"
            />
          </div>
          <div className="flex-[4] min-w-0">
            <ScriptureAdCard className="h-full" />
          </div>
          <div className="flex-[3] min-w-0">
            <JobCard
              badge="VOLUNTEER"
              badgeColor="purple"
              title="Volunteers Needed"
              company="Grace Town Ministries"
              employmentType="Volunteering Experience"
              location="Lagos City, Nigeria"
              verified
              ctaLabel="Apply Now"
              className="h-full"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
