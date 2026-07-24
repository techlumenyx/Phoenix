import { VerificationSubmissionModel } from '../models';
import { acceptEmailIntent } from './email-orchestration.service';

export interface VerificationIntakeInput {
  organisationId: string;
  organisationName: string;
  ownerFirebaseUid: string;
  requestedTier: 'STANDARD' | 'CHARITY' | 'NGO';
  documentUrls: string[];
  snapshot: {
    officialName: string | null;
    registrationNumber: string | null;
    officialEmail: string | null;
    pocName: string | null;
    pocTitle: string | null;
    organisationType: string | null;
    region: string | null;
  };
}

export async function ingestVerificationSubmission(input: VerificationIntakeInput) {
  const latest = await VerificationSubmissionModel.findOne({ organisationId: input.organisationId }).sort({ version: -1 });
  if (latest?.status === 'PENDING_REVIEW') return latest;
  const doc = await VerificationSubmissionModel.create({
    ...input,
    version: (latest?.version ?? 0) + 1,
    status: 'PENDING_REVIEW',
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });
  const email = input.snapshot.officialEmail;
  if (email) {
    await acceptEmailIntent({
      templateKey: 'VERIFICATION_UPDATE', to: email,
      variables: { organisationName: input.organisationName, status: 'PENDING REVIEW', settingsUrl: `${publicAppUrl()}/org/settings` },
      idempotencyKey: `verification:${doc._id}:PENDING_REVIEW`,
      source: { service: 'admin', entityType: 'ORGANISATION_VERIFICATION', entityId: doc._id.toString() },
    }).catch((error: unknown) => console.warn('[email] verification receipt could not be queued', error));
  }
  return doc;
}

function publicAppUrl() { return (process.env['PUBLIC_APP_URL'] ?? 'http://localhost:3000').replace(/\/$/, ''); }
