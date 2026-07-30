import { entityIdFromHref } from './useContentImpression';

describe('content analytics route parsing', () => {
  it('extracts ids only from matching public content routes', () => {
    expect(entityIdFromHref('/events/700000000000000000000032', 'EVENT')).toBe('700000000000000000000032');
    expect(entityIdFromHref('/jobs/700000000000000000000032?source=home', 'JOB')).toBe('700000000000000000000032');
    expect(entityIdFromHref('/marketplace/700000000000000000000032', 'MARKETPLACE')).toBe('700000000000000000000032');
    expect(entityIdFromHref('/events/all', 'EVENT')).toBeNull();
    expect(entityIdFromHref('/jobs/700000000000000000000032', 'EVENT')).toBeNull();
  });
});
