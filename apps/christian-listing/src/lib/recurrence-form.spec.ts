import { calendarWeekday, firstWeeklyDateOnOrAfter } from './recurrence-form';

describe('recurring event form dates', () => {
  it('uses the event weekday when no weekly days were explicitly selected', () => {
    expect(calendarWeekday('2026-07-30')).toBe(4);
    expect(firstWeeklyDateOnOrAfter('2026-07-30', [])).toBe('2026-07-30');
  });

  it('finds the first selected weekday after the event start date', () => {
    expect(firstWeeklyDateOnOrAfter('2026-07-30', [0])).toBe('2026-08-02');
  });
});
