interface MarketplaceRiskSnapshot {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  currency: string;
  isDonation: boolean;
  region: string;
}

export function requestMarketplaceRiskAnalysis(snapshot: MarketplaceRiskSnapshot) {
  if (process.env['AI_RISK_ENABLED'] !== 'true') return;
  const secret = process.env['INTERNAL_SERVICE_KEY'];
  if (!secret) {
    console.warn('[risk-analysis] INTERNAL_SERVICE_KEY is not configured');
    return;
  }
  const baseUrl = process.env['ADMIN_INTERNAL_URL'] ?? 'http://localhost:4004';
  void fetch(`${baseUrl}/internal/risk-analyses`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-cl-service-key': secret },
    body: JSON.stringify({
      targetId: snapshot.id,
      content: {
        title: snapshot.title,
        description: snapshot.description,
        category: snapshot.category,
        condition: snapshot.condition,
        price: snapshot.price,
        currency: snapshot.currency,
        isDonation: snapshot.isDonation,
        region: snapshot.region,
      },
    }),
  }).then((response) => {
    if (!response.ok) console.warn(`[risk-analysis] intake failed with HTTP ${response.status}`);
  }).catch((error: unknown) => {
    console.warn('[risk-analysis] intake is unavailable', error instanceof Error ? error.message : 'unknown error');
  });
}
