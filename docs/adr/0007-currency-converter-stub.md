# ADR 0007 — CurrencyConverter Stub for Phase 1

**Status:** Accepted

## Context

The marketplace module displays prices in the seller's regional currency. Buyers from different regions should see an estimated conversion. Phase 1 does not budget for a live exchange rate API (latency, cost, API key management).

Options:
1. Skip currency conversion in Phase 1
2. Hard-code a handful of rates in the resolver
3. Implement the final class interface now but back it with static data

## Decision

Implement a **`CurrencyConverter` class** in `@christian-listings/utils` with the final interface (`convert()`, `getDisplayPrice()`) but backed by a **static `mock-rates.json`** file instead of a live API.

The returned `ConvertedPrice` type always sets `isEstimate: true`, which the frontend renders as a disclaimer label ("Estimated price. Rates may vary.").

```typescript
class CurrencyConverter {
  convert(amount: number, from: string, to: string): number
  getDisplayPrice(amount: number, currency: string, userRegion: string): ConvertedPrice
}

interface ConvertedPrice {
  original: number;
  originalCurrency: string;
  converted: number;
  toCurrency: string;
  isEstimate: true;
}
```

## Consequences

**Positive:**
- The interface is stable. Swapping `mock-rates.json` for a live API call in Phase 2 requires changing only the `CurrencyConverter` constructor — zero changes to callers.
- No external API key needed in Phase 1.
- The `isEstimate: true` flag is always set, so even when a live API is added it can be set to `false` to communicate accuracy to the UI.

**Negative:**
- Exchange rates in `mock-rates.json` will become stale. Manually update the file periodically until Phase 2 integration.
- Users may see conversion estimates that differ significantly from real rates for volatile currencies (NGN, GHS). The disclaimer label partially mitigates this.
