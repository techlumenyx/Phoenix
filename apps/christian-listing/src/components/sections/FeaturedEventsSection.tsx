import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../layout/icons';
import EventCard from '../cards/EventCard';

const TABS = ['Trending', 'Newly Added', 'Theology', 'Music', 'Worship', 'Movies / Films'] as const;

export default function FeaturedEventsSection() {
  const [activeTab, setActiveTab] = useState('Trending');

  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark">Featured Events</h2>
        <Link
          to="/events"
          className="font-display text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark transition-colors flex items-center gap-1 shrink-0 mb-1"
        >
          VIEW ALL EVENTS
          <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-dark text-white'
                : 'bg-gray-100 text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <EventCard
            key={i}
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
            className="h-[300px]"
          />
        ))}
      </div>
    </section>
  );
}
