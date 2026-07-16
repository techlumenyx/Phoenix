import type { IOrganisation } from '../models/organisation.model';

export async function sendVerificationSubmission(input: {
  organisation: IOrganisation & { _id: { toString(): string } };
  requestedTier: 'STANDARD' | 'CHARITY' | 'NGO';
  documentUrls: string[];
}) {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) throw new Error('Verification service credentials are not configured');
  const baseUrl = process.env['ADMIN_INTERNAL_URL'] ?? 'http://localhost:4004';
  const organisation = input.organisation;
  const response = await fetch(`${baseUrl}/internal/verifications`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-cl-service-key': secret },
    body: JSON.stringify({
      organisationId: organisation._id.toString(),
      organisationName: organisation.name ?? 'Unnamed organisation',
      ownerFirebaseUid: organisation.createdBy,
      requestedTier: input.requestedTier,
      documentUrls: input.documentUrls,
      snapshot: {
        officialName: organisation.verificationDetails.officialName,
        registrationNumber: organisation.verificationDetails.registrationNumber,
        officialEmail: organisation.verificationDetails.officialEmail,
        pocName: organisation.verificationDetails.pocName,
        pocTitle: organisation.verificationDetails.pocTitle,
        organisationType: organisation.organisationType,
        region: organisation.region,
      },
    }),
  });
  if (!response.ok) throw new Error('Verification review service is unavailable');
  return response.json() as Promise<{ id: string; version: number; createdAt: string }>;
}
