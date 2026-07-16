import { buildAuditCsv, placementStatus, validateExportRange } from './stage4.resolver';

describe('Stage 4 operational controls', () => {
  it('limits audit exports to a bounded 31-day historical range', () => {
    const to = new Date(Date.now() - 60_000);
    expect(() => validateExportRange(new Date(to.getTime() - 32 * 24 * 60 * 60 * 1000), to)).toThrow('limited to 31 days');
    expect(validateExportRange(new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000), to)).toEqual(expect.objectContaining({ to }));
  });

  it('watermarks CSV exports and protects spreadsheet formula cells', () => {
    const csv = buildAuditCsv([{ _id: 'event-1', reason: '=HYPERLINK("bad")', adminRoles: ['AUDITOR'] }], 'admin-1', 'auditor@example.test', new Date('2026-01-01'), new Date('2026-01-02'));
    expect(csv).toContain('Requested by auditor@example.test (admin-1)');
    expect(csv).toContain("'=HYPERLINK");
  });

  it('derives scheduled, active, and expired placement states from the window', () => {
    const now = Date.now();
    expect(placementStatus(new Date(now + 60_000), new Date(now + 120_000))).toBe('SCHEDULED');
    expect(placementStatus(new Date(now - 60_000), new Date(now + 60_000))).toBe('ACTIVE');
    expect(placementStatus(new Date(now - 120_000), new Date(now - 60_000))).toBe('EXPIRED');
  });
});
