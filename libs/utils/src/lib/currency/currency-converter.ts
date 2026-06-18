import mockRates from './mock-rates.json';

export interface ConvertedPrice {
  original: number;
  originalCurrency: string;
  converted: number;
  toCurrency: string;
  isEstimate: true;
}

const REGION_CURRENCY_MAP: Record<string, string> = {
  GB: 'GBP',
  US: 'USD',
  NG: 'NGN',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  CA: 'CAD',
  AU: 'AUD',
  UG: 'UGX',
  TZ: 'TZS',
  ET: 'ETB',
  RW: 'RWF',
  SL: 'SLL',
  GM: 'GMD',
};

type RatesMap = Record<string, number>;
const rates = mockRates as RatesMap;

export class CurrencyConverter {
  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = rates[fromCurrency.toUpperCase()];
    const toRate = rates[toCurrency.toUpperCase()];

    if (!fromRate || !toRate) return amount;

    const usdAmount = amount / fromRate;
    return Math.round(usdAmount * toRate * 100) / 100;
  }

  getDisplayPrice(amount: number, currency: string, userRegion: string): ConvertedPrice {
    const toCurrency = REGION_CURRENCY_MAP[userRegion.toUpperCase()] ?? currency;

    return {
      original: amount,
      originalCurrency: currency,
      converted: this.convert(amount, currency, toCurrency),
      toCurrency,
      isEstimate: true,
    };
  }
}
