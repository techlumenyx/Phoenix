import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EventsGlanceSection from './EventsGlanceSection';
import SpotlightSection from './HomepageSpotlightSection';
import type { HomepageEvent, SpotlightSet } from '../../lib/homepage-selection';

function event(id: string, title: string): HomepageEvent {
  return {
    id,
    title,
    description: `${title} description`,
    category: 'WORSHIP',
    date: '2026-08-20T18:00:00.000Z',
    endDate: '2026-08-20T20:00:00.000Z',
    region: 'London, United Kingdom',
    rsvpCount: 12,
    imageUrls: [],
    isPromoted: false,
    location: { type: 'PHYSICAL', city: 'London', country: 'United Kingdom' },
    hosts: [{ id: 'organisation-id', name: 'Grace Town', isVerified: true }],
  };
}

describe('homepage card navigation', () => {
  it('makes both Events at a Glance cards complete native links', () => {
    render(<MemoryRouter><EventsGlanceSection events={[event('event-one', 'Morning worship'), event('event-two', 'Evening gathering')]} loading={false} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'RSVP Now: Morning worship' }).getAttribute('href')).toBe('/events/event-one');
    expect(screen.getByRole('link', { name: 'RSVP Now: Evening gathering' }).getAttribute('href')).toBe('/events/event-two');
  });

  it('makes the Scripture community card one native link', () => {
    const trending: SpotlightSet = { events: [event('event-one', 'Morning worship')], jobs: [], listings: [] };
    const empty: SpotlightSet = { events: [], jobs: [], listings: [] };
    render(<MemoryRouter><SpotlightSection content={{ trending, featured: empty }} loading={false} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Explore the community' }).getAttribute('href')).toBe('/events');
  });
});
