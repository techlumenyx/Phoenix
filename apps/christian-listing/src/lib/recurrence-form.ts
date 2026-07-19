export function calendarWeekday(date: string) {
  return new Date(`${date}T12:00:00.000Z`).getUTCDay();
}

export function firstWeeklyDateOnOrAfter(startDate: string, selectedDays: number[]) {
  const start = new Date(`${startDate}T12:00:00.000Z`);
  const days = selectedDays.length ? selectedDays : [start.getUTCDay()];
  for (let offset = 0; offset < 7; offset += 1) {
    const candidate = new Date(start);
    candidate.setUTCDate(start.getUTCDate() + offset);
    if (days.includes(candidate.getUTCDay())) return candidate.toISOString().slice(0, 10);
  }
  return startDate;
}
