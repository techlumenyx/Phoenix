import { createFixedWindowRateLimiter, parseAllowedOrigins } from './launch-hardening';

describe('admin launch hardening', () => {
  it('parses an exact origin allowlist', () => {
    expect([...parseAllowedOrigins('https://admin.example, https://backup.example')]).toEqual([
      'https://admin.example',
      'https://backup.example',
    ]);
  });

  it('rejects requests beyond the fixed window and resets safely', () => {
    let time = 1_000;
    const limit = createFixedWindowRateLimiter(2, 100, () => time);
    expect(limit('admin').allowed).toBe(true);
    expect(limit('admin').allowed).toBe(true);
    expect(limit('admin').allowed).toBe(false);
    time = 1_101;
    expect(limit('admin').allowed).toBe(true);
  });
});
