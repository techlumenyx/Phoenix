import { AdminCommandSchema } from './admin-command.model';
import { AuditEventSchema } from './audit-event.model';
import { FeaturedPlacementSchema } from './featured-placement.model';
import { ModerationCaseSchema } from './moderation-case.model';
import { VerificationSubmissionSchema } from './verification-submission.model';

function hasIndex(schema: { indexes(): Array<[Record<string, unknown>, unknown]> }, expected: Record<string, number>) {
  return schema.indexes().some(([keys]) => Object.entries(expected).every(([key, direction]) => keys[key] === direction));
}

describe('admin operational indexes', () => {
  it('covers queue, SLA, audit, curation, and reconciliation access patterns', () => {
    expect(hasIndex(ModerationCaseSchema, { status: 1, priority: -1, updatedAt: -1 })).toBe(true);
    expect(hasIndex(VerificationSubmissionSchema, { status: 1, dueAt: 1 })).toBe(true);
    expect(hasIndex(AuditEventSchema, { targetType: 1, action: 1, result: 1, createdAt: -1 })).toBe(true);
    expect(hasIndex(FeaturedPlacementSchema, { regions: 1, status: 1, startsAt: 1, endsAt: 1, rank: 1 })).toBe(true);
    expect(hasIndex(AdminCommandSchema, { state: 1, updatedAt: 1 })).toBe(true);
  });
});
