import { fireEvent, render, screen } from '@testing-library/react';
import ContentPlaceholder, { contentInitials } from './ContentPlaceholder';
import NameAvatar from './NameAvatar';
import ResilientImage from './ResilientImage';

describe('media fallbacks', () => {
  it('creates compact initials from meaningful title words', () => {
    expect(contentInitials('Worship in the Gardens')).toBe('WG');
    expect(contentInitials('Hope')).toBe('HO');
    expect(contentInitials('')).toBe('CL');
  });

  it('renders a title-aware placeholder when a source is missing', () => {
    render(<ResilientImage src={undefined} alt="Event" fallback={<ContentPlaceholder variant="event" title="Worship in the Gardens" />} />);
    expect(screen.getByText('WG')).toBeTruthy();
    expect(screen.getByText('No image available for Worship in the Gardens')).toBeTruthy();
  });

  it('switches to the placeholder when a remote image fails', () => {
    render(<ResilientImage src="https://example.invalid/image.jpg" alt="Listing" fallback={<ContentPlaceholder variant="marketplace" title="Community Study Bible" />} />);
    fireEvent.error(screen.getByRole('img', { name: 'Listing' }));
    expect(screen.getByText('CS')).toBeTruthy();
  });

  it('uses the same resilient behaviour for names and logos', () => {
    render(<NameAvatar name="Grace Town Ministries" src="https://example.invalid/logo.jpg" />);
    fireEvent.error(screen.getByRole('img', { name: 'Grace Town Ministries image' }));
    expect(screen.getByLabelText('Grace Town Ministries initials').textContent).toBe('GT');
  });
});
