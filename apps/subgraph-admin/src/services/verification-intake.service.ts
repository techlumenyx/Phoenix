import { VerificationSubmissionModel } from '../models';

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
  return VerificationSubmissionModel.create({
    ...input,
    version: (latest?.version ?? 0) + 1,
    status: 'PENDING_REVIEW',
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });
}
