import { resolveMediaEndpoint } from './media-endpoint';

describe('resolveMediaEndpoint', () => {
  it('uses an explicitly configured endpoint', () => {
    expect(resolveMediaEndpoint(' https://uploads.example.test/custom ', 'https://api.example.test/', 'identity'))
      .toBe('https://uploads.example.test/custom');
  });

  it('derives the production proxy endpoint from the GraphQL origin', () => {
    expect(resolveMediaEndpoint(undefined, 'https://christian-listings.duckdns.org/', 'identity'))
      .toBe('https://christian-listings.duckdns.org/media/identity/upload');
  });

  it('keeps local development on the service port', () => {
    expect(resolveMediaEndpoint(undefined, 'http://localhost:4000/', 'events'))
      .toBe('http://localhost:4002/media/upload');
  });

  it('does not treat an empty deployment variable as a valid endpoint', () => {
    expect(resolveMediaEndpoint('', 'https://api.example.test/graphql', 'classifieds'))
      .toBe('https://api.example.test/media/classifieds/upload');
  });
});
