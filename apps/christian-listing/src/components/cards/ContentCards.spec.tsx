import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EventCard from './EventCard';
import JobCard from './JobCard';
import MarketplaceCard from './MarketplaceCard';

describe('content card navigation', () => {
  it('makes the complete event card a single native link', () => {
    render(<MemoryRouter><EventCard title="Community gathering" href="/events/event-id" /></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'RSVP Now: Community gathering' });
    expect(link.getAttribute('href')).toBe('/events/event-id');
    expect(link.textContent).toContain('Community gathering');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('makes the complete job card a single native link', () => {
    render(<MemoryRouter><JobCard title="Project Coordinator" company="Grace Town" href="/jobs/job-id" /></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'Apply Now: Project Coordinator' });
    expect(link.getAttribute('href')).toBe('/jobs/job-id');
    expect(link.textContent).toContain('Project Coordinator');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('makes the complete marketplace card a single native link', () => {
    render(<MemoryRouter><MarketplaceCard title="Community table" price="£25" href="/marketplace/listing-id" /></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'View: Community table' });
    expect(link.getAttribute('href')).toBe('/marketplace/listing-id');
    expect(link.textContent).toContain('Community table');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('keeps a card without an href non-interactive', () => {
    render(<MemoryRouter><JobCard title="Preview role" company="Preview organisation" /></MemoryRouter>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
