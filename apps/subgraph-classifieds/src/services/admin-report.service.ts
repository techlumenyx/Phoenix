import { GraphQLError } from 'graphql';

export interface AdminReportResult {
  reportId: string;
  caseId: string;
  distinctReportCount: number;
  duplicate: boolean;
  shouldHide: boolean;
}

export async function sendMarketplaceReport(input: {
  itemId: string;
  reporterFirebaseUid: string;
  reason: string;
  snapshot: {
    title: string;
    ownerFirebaseUid: string;
    organisationId: string | null;
    status: string;
  };
}): Promise<AdminReportResult> {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) {
    throw new GraphQLError('Reporting is temporarily unavailable', { extensions: { code: 'SERVICE_UNAVAILABLE' } });
  }
  const baseUrl = process.env['ADMIN_INTERNAL_URL'] ?? 'http://localhost:4004';
  const response = await fetch(`${baseUrl}/internal/reports/marketplace`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-cl-service-key': secret },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new GraphQLError('The report could not be recorded. Please try again.', { extensions: { code: 'BAD_GATEWAY' } });
  }
  return response.json() as Promise<AdminReportResult>;
}
