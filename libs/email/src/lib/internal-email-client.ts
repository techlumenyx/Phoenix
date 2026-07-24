import type { EmailIntent } from './contracts';

export async function requestEmail(intent: EmailIntent): Promise<{ id: string; status: string }> {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) throw new Error('INTERNAL_SERVICE_KEY is not configured');
  const baseUrl = process.env['ADMIN_INTERNAL_URL'] ?? 'http://localhost:4004';
  const response = await fetch(`${baseUrl}/internal/emails`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-cl-service-key': secret },
    body: JSON.stringify(intent),
  });
  if (!response.ok) throw new Error(`Email orchestration failed with HTTP ${response.status}`);
  return response.json() as Promise<{ id: string; status: string }>;
}

export function requestEmailSafely(intent: EmailIntent, logger: Pick<Console, 'warn'> = console): void {
  void requestEmail(intent).catch((error: unknown) => {
    logger.warn(`[email] ${error instanceof Error ? error.message : 'Email request failed'}`);
  });
}

export function cancelEmailSafely(idempotencyKey: string, logger: Pick<Console, 'warn'> = console): void {
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) { logger.warn('[email] INTERNAL_SERVICE_KEY is not configured'); return; }
  const baseUrl = process.env['ADMIN_INTERNAL_URL'] ?? 'http://localhost:4004';
  void fetch(`${baseUrl}/internal/emails/cancel`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-cl-service-key': secret }, body: JSON.stringify({ idempotencyKey }),
  }).then((response) => { if (!response.ok) throw new Error(`Email cancellation failed with HTTP ${response.status}`); })
    .catch((error: unknown) => logger.warn(`[email] ${error instanceof Error ? error.message : 'Email cancellation failed'}`));
}
