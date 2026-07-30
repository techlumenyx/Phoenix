import { ClassifiedAnalyticsEventSchema } from './analytics-event.model';

describe('ClassifiedAnalyticsEventSchema', () => {
  it('deduplicates impressions and expires raw analytics', () => {
    const indexes = ClassifiedAnalyticsEventSchema.indexes();
    expect(indexes).toEqual(expect.arrayContaining([
      expect.arrayContaining([expect.objectContaining({ viewerHash: 1, entityId: 1, eventType: 1, surface: 1, bucket: 1 }), expect.objectContaining({ unique: true })]),
    ]));
    expect(ClassifiedAnalyticsEventSchema.path('createdAt').options.expires).toBe(60 * 60 * 24 * 90);
  });
});
