import { useState } from 'react';
import EventCard from '../cards/EventCard';
import JobCard from '../cards/JobCard';
import MarketplaceCard from '../cards/MarketplaceCard';

const TABS = ['Trending', 'Top Listings'] as const;
type Tab = (typeof TABS)[number];

// Sample data matching the Figma design
const SPOTLIGHT_ITEMS = [
  {
    type: 'event' as const,
    props: {
      badge: 'EVENT/MINISTRY',
      date: '24 OCT 2026',
      title: 'Theology of Work: A Masterclass for Professionals',
      description: 'An evening of peace and calm aimed to help youngsters learn the word of God.',
      location: 'Lagos City Centre',
      time: '09:30 AM To 08:00 PM',
      invites: '3500 Invites',
      likes: '15K Likes',
      featured: true,
      imageSrc: '/assets/event-theology.jpg',
    },
  },
  {
    type: 'job' as const,
    props: {
      badge: 'JOB LISTING',
      title: 'Project Coordinator',
      company: 'Grace Town Ministries',
      salaryRange: '60k – 85k NGN',
      location: 'Lagos City, Nigeria',
      employmentType: 'Full Time Employment',
      featured: true,
    },
  },
  {
    type: 'marketplace' as const,
    props: {
      badge: 'FOR SALE',
      title: 'Ford Sierra 2012 Petrol',
      description: 'Used 2012 Model for Sale in Lagos',
      price: '₦ 40,000 NGN',
      location: 'Lagos City, Nigeria',
      featured: true,
      imageSrc: '/assets/car-ford.jpg',
    },
  },
];

export default function SpotlightSection() {
  const [activeTab, setActiveTab] = useState<Tab>('Trending');

  return (
    <section className="w-full bg-white px-6 md:px-10 py-12">
      {/* Section header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Curated Highlights
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
            The Spotlight
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 self-center">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-[#1B1B1B] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid — 3 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SPOTLIGHT_ITEMS.map((item, i) => {
          if (item.type === 'event') {
            return <EventCard key={i} {...item.props} />;
          }
          if (item.type === 'job') {
            return <JobCard key={i} {...item.props} />;
          }
          return <MarketplaceCard key={i} {...item.props} />;
        })}
      </div>
    </section>
  );
}
