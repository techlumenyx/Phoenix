import { MAX_VIDEO_BYTES, MEDIA_POLICIES } from './media-upload';

describe('media upload policies', () => {
  it('limits every video purpose to 20 MB', () => {
    const videoPolicies = Object.values(MEDIA_POLICIES).filter((policy) => policy.resourceType === 'video');

    expect(videoPolicies).not.toHaveLength(0);
    expect(videoPolicies.every((policy) => policy.maxBytes === MAX_VIDEO_BYTES)).toBe(true);
    expect(MAX_VIDEO_BYTES).toBe(20_000_000);
  });
});
