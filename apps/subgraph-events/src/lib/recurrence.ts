import type { IRecurrenceRule } from '../models/event-series.model';

export const RECURRENCE_HORIZON_MONTHS = 12;
export const MAX_SERIES_OCCURRENCES = 100;

interface DateParts { year: number; month: number; day: number; hour: number; minute: number; second: number }

function zonedParts(date: Date, timezone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value('year'), month: value('month'), day: value('day'), hour: value('hour'), minute: value('minute'), second: value('second') };
}

function zonedDate(parts: DateParts, timezone: string) {
  const desired = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  let result = new Date(desired);
  for (let pass = 0; pass < 2; pass += 1) {
    const actual = zonedParts(result, timezone);
    const actualUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    result = new Date(result.getTime() + desired - actualUtc);
  }
  return result;
}
function calendarDate(year: number, month: number, day: number) {
  const value = new Date(Date.UTC(year, month - 1, day));
  return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
}

function addMonths(year: number, month: number, amount: number) {
  const value = new Date(Date.UTC(year, month - 1 + amount, 1));
  return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1 };
}

export function generateOccurrenceDates(startDate: Date, rule: IRecurrenceRule) {
  if (!Number.isInteger(rule.interval) || rule.interval < 1) throw new Error('Recurrence interval must be at least 1');
  try { new Intl.DateTimeFormat('en', { timeZone: rule.timezone }).format(startDate); } catch { throw new Error('A valid IANA timezone is required'); }
  const start = zonedParts(startDate, rule.timezone);
  const horizonMonth = addMonths(start.year, start.month, RECURRENCE_HORIZON_MONTHS);
  const horizon = zonedDate({ ...start, ...horizonMonth, day: Math.min(start.day, new Date(Date.UTC(horizonMonth.year, horizonMonth.month, 0)).getUTCDate()) }, rule.timezone);
  const requestedLimit = rule.occurrenceCount ?? MAX_SERIES_OCCURRENCES;
  const limit = Math.min(requestedLimit, MAX_SERIES_OCCURRENCES);
  const result: Date[] = [];
  const withinLimits = (date: Date) => date <= horizon && (!rule.endsAt || date <= rule.endsAt) && result.length < limit;

  if (rule.frequency === 'MONTHLY') {
    const dayOfMonth = rule.dayOfMonth ?? start.day;
    for (let index = 0; index < MAX_SERIES_OCCURRENCES && result.length < limit; index += 1) {
      const target = addMonths(start.year, start.month, index * rule.interval);
      const lastDay = new Date(Date.UTC(target.year, target.month, 0)).getUTCDate();
      const date = zonedDate({ ...start, ...target, day: Math.min(dayOfMonth, lastDay) }, rule.timezone);
      if (!withinLimits(date)) break;
      if (date >= startDate) result.push(date);
    }
    return result;
  }

  const selectedDays = rule.daysOfWeek.length ? [...new Set(rule.daysOfWeek)].sort() : [new Date(Date.UTC(start.year, start.month - 1, start.day)).getUTCDay()];
  for (let offset = 0; offset <= 370 && result.length < limit; offset += 1) {
    const target = calendarDate(start.year, start.month, start.day + offset);
    const calendarValue = new Date(Date.UTC(target.year, target.month - 1, target.day));
    if (Math.floor(offset / 7) % rule.interval !== 0 || !selectedDays.includes(calendarValue.getUTCDay())) continue;
    const date = zonedDate({ ...start, ...target }, rule.timezone);
    if (!withinLimits(date)) break;
    if (date >= startDate) result.push(date);
  }
  return result;
}
