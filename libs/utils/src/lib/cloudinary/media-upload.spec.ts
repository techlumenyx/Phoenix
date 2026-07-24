import { MAX_VIDEO_BYTES, MEDIA_POLICIES, resolveMediaFormat } from './media-upload';

describe('media upload policies', () => {
  it('limits every video purpose to 20 MB', () => {
    const videoPolicies = Object.values(MEDIA_POLICIES).filter((policy) => policy.resourceType === 'video');

    expect(videoPolicies).not.toHaveLength(0);
    expect(videoPolicies.every((policy) => policy.maxBytes === MAX_VIDEO_BYTES)).toBe(true);
    expect(MAX_VIDEO_BYTES).toBe(20_000_000);
  });

  it('accepts every verification-document type advertised by the form', () => {
    expect(MEDIA_POLICIES.VERIFICATION_DOCUMENT.mimeTypes).toEqual(expect.arrayContaining([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ]));
  });

  it('derives formats when Cloudinary omits them for raw private assets', () => {
    expect(resolveMediaFormat(undefined, 'application/pdf')).toBe('pdf');
    expect(resolveMediaFormat('', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('docx');
    expect(resolveMediaFormat(undefined, 'image/jpeg')).toBe('jpg');
    expect(resolveMediaFormat('PNG', 'application/octet-stream')).toBe('png');
  });
});
