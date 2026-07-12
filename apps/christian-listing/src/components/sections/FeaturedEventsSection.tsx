import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../layout/icons';
import EventCard from '../cards/EventCard';
import { useDiscovery, usePreferredRegion } from '../../lib/discovery';

const TABS = ['Trending', 'Newly Added', 'Theology', 'Music', 'Worship', 'Movies / Films'] as const;

export default function FeaturedEventsSection() {
  const [activeTab, setActiveTab] = useState('Trending');
  const { region } = usePreferredRegion();
  const { data, loading, error } = useDiscovery('', 3);
  const events = data?.events.edges ?? [];

  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div><h2 className="text-3xl md:text-4xl font-serif font-bold text-dark">Featured Events</h2>{region && <p className="mt-1 text-xs text-gray-400">Personalised for {region}</p>}</div>
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
        {loading && !data && <p className="text-sm text-gray-500">Loading events…</p>}
        {error && <p className="text-sm text-red-600">Events are temporarily unavailable.</p>}
        {!loading && !error && events.length === 0 && <p className="text-sm text-gray-500">No events found{region ? ` in ${region}` : ''}.</p>}
        {events.map((event) => (
          <EventCard
            key={event.id}
            badge={event.category.replaceAll('_', ' ')}
            date={new Date(event.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
            title={event.title}
            description={event.description}
            location={[event.location.city, event.location.country].filter(Boolean).join(', ') || event.region}
            invites={`${event.rsvpCount} RSVPs`}
            imageSrc={event.imageUrls[0] || '/assets/event-theology.png'}
            href={`/events/${event.id}`}
            className="h-[300px]"
          />
        ))}
      </div>
    </section>
  );
}
