import { HomepageEvent, HomepageJob, HomepageListing, HomepageQueryData, selectHomepageContent } from './homepage-selection';

const NOW = new Date('2026-07-18T00:00:00.000Z');

function event(id: string, overrides: Partial<HomepageEvent> = {}): HomepageEvent {
  return { id, title: `Event ${id}`, description: 'Description', category: 'COMMUNITY', date: '2026-07-20T10:00:00.000Z', endDate: null, region: 'London', rsvpCount: 10, imageUrls: [`${id}.jpg`], isPromoted: false, location: { type: 'PHYSICAL', city: 'London', country: 'UK' }, hosts: [], ...overrides };
}

function job(id: string, isPromoted = false): HomepageJob {
  return { id, title: `Job ${id}`, roleType: 'FULL_TIME', workLocation: 'ON_SITE', region: 'London', salaryRange: null, isPromoted, organisation: { id: `org-${id}`, name: 'Organisation', isVerified: true } };
}

function listing(id: string, isPromoted = false): HomepageListing {
  return { id, title: `Listing ${id}`, description: 'Description', price: 20, currency: 'GBP', condition: 'GOOD', region: 'London', imageUrls: [`${id}.jpg`], isDonation: false, isPromoted };
}

function data(overrides: Partial<HomepageQueryData> = {}): HomepageQueryData {
  return { globalFeaturedEvents: [], globalWeeklyEvents: { edges: [] }, globalUpcomingEvents: { edges: [] }, globalJobs: { edges: [] }, globalListings: { edges: [] }, ...overrides };
}

describe('selectHomepageContent', () => {
  it('prioritises regional candidates and removes regional/global duplicates', () => {
    const local = event('local');
    const duplicate = event('duplicate');
    const result = selectHomepageContent(data({ regionalWeeklyEvents: { edges: [local, duplicate] }, globalWeeklyEvents: { edges: [duplicate, event('global')] }, globalJobs: { edges: [job('job')] }, globalListings: { edges: [listing('listing')] } }), NOW);

    expect(result.spotlight.trending.events.map(({ id }) => id)).toEqual(['local', 'duplicate']);
  });

  it('puts promoted records first in the Featured tab', () => {
    const result = selectHomepageContent(data({ globalFeaturedEvents: [event('promoted', { isPromoted: true })], globalWeeklyEvents: { edges: [event('organic')] }, globalJobs: { edges: [job('organic-job'), job('promoted-job', true)] }, globalListings: { edges: [listing('organic-listing'), listing('promoted-listing', true)] } }), NOW);

    expect(result.spotlight.featured.events[0].id).toBe('promoted');
    expect(result.spotlight.featured.jobs[0].id).toBe('promoted-job');
    expect(result.spotlight.featured.listings[0].id).toBe('promoted-listing');
  });

  it('uses non-spotlight upcoming events for Events at a Glance', () => {
    const candidates = ['one', 'two', 'three', 'four', 'five', 'six'].map((id) => event(id));
    const result = selectHomepageContent(data({ globalWeeklyEvents: { edges: candidates } }), NOW);

    expect(result.glanceEvents.map(({ id }) => id)).toEqual(['three', 'four']);
    expect(result.glanceEvents).toHaveLength(2);
  });

  it('excludes past events from all homepage event slots', () => {
    const result = selectHomepageContent(data({ globalFeaturedEvents: [event('past', { date: '2026-07-17T10:00:00.000Z' })], globalWeeklyEvents: { edges: [event('future'), event('past', { date: '2026-07-17T10:00:00.000Z' })] } }), NOW);

    expect(result.spotlight.featured.events.map(({ id }) => id)).not.toContain('past');
    expect(result.spotlight.trending.events.map(({ id }) => id)).toEqual(['future']);
  });
});
