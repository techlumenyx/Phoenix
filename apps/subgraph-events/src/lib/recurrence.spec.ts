import { generateOccurrenceDates, MAX_SERIES_OCCURRENCES } from './recurrence';
import type { IRecurrenceRule } from '../models/event-series.model';

function rule(overrides: Partial<IRecurrenceRule>): IRecurrenceRule {
  return {
    frequency: 'WEEKLY', interval: 1, daysOfWeek: [0], dayOfMonth: null,
    timezone: 'UTC', endsAt: null, occurrenceCount: null, ...overrides,
  };
}

describe('generateOccurrenceDates', () => {
  it('generates selected weekdays at the requested weekly interval', () => {
    const dates = generateOccurrenceDates(new Date('2026-07-06T18:00:00.000Z'), rule({ daysOfWeek: [1, 3], occurrenceCount: 4 }));
    expect(dates.map((date) => date.toISOString())).toEqual([
      '2026-07-06T18:00:00.000Z', '2026-07-08T18:00:00.000Z',
      '2026-07-13T18:00:00.000Z', '2026-07-15T18:00:00.000Z',
    ]);
  });

  it('uses the last valid day for shorter months', () => {
    const dates = generateOccurrenceDates(new Date('2026-01-31T10:00:00.000Z'), rule({ frequency: 'MONTHLY', daysOfWeek: [], dayOfMonth: 31, occurrenceCount: 3 }));
    expect(dates.map((date) => date.toISOString())).toEqual([
      '2026-01-31T10:00:00.000Z', '2026-02-28T10:00:00.000Z', '2026-03-31T10:00:00.000Z',
    ]);
  });

  it('keeps the same local time when daylight-saving time changes', () => {
    const dates = generateOccurrenceDates(new Date('2026-03-22T10:00:00.000Z'), rule({ timezone: 'Europe/London', occurrenceCount: 2 }));
    expect(dates.map((date) => date.toISOString())).toEqual(['2026-03-22T10:00:00.000Z', '2026-03-29T09:00:00.000Z']);
  });

  it('caps open-ended series generation', () => {
    expect(generateOccurrenceDates(new Date('2026-01-01T10:00:00.000Z'), rule({ daysOfWeek: [4] }))).toHaveLength(MAX_SERIES_OCCURRENCES > 52 ? 53 : MAX_SERIES_OCCURRENCES);
  });
});
