import { resolveLocationRegion } from './region-helpers';

describe('resolveLocationRegion', () => {
  it.each(['GB-LND', 'GB-LDN', 'London, UK', 'London'])('normalises %s to London', (value) => {
    expect(resolveLocationRegion(value)).toEqual({ code: 'GB-LND', displayName: 'London, UK', codes: ['GB-LND', 'GB-LDN'] });
  });

  it('preserves an unknown display location', () => {
    expect(resolveLocationRegion('Birmingham, UK')).toEqual({ code: 'BIRMINGHAM, UK', displayName: 'Birmingham, UK', codes: ['BIRMINGHAM, UK'] });
  });

  it('returns null for an empty value', () => {
    expect(resolveLocationRegion('  ')).toBeNull();
  });
});
