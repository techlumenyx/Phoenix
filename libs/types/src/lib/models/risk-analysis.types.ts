export const CONTENT_RISK_QUEUE = 'content-risk-analysis';

export const RISK_SIGNAL_CODES = [
  'SCAM_LANGUAGE',
  'SUSPICIOUS_PAYMENT',
  'OFF_PLATFORM_CONTACT',
  'PROHIBITED_ITEM',
  'MISLEADING_CLAIM',
  'DUPLICATE_OR_SPAM',
  'PRICE_ANOMALY',
  'CATEGORY_MISMATCH',
  'OTHER',
] as const;

export type RiskSignalCode = (typeof RISK_SIGNAL_CODES)[number];
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskRecommendedAction = 'NONE' | 'REVIEW' | 'PENDING_REVIEW';

export interface MarketplaceRiskAnalysisJob {
  analysisId: string;
  targetId: string;
  content: {
    title: string;
    description: string;
    category: string;
    condition: string;
    price: number;
    currency: string;
    isDonation: boolean;
    region: string;
  };
}

export interface ContentRiskSignalResult {
  code: RiskSignalCode;
  confidence: number;
  explanation: string;
  evidenceExcerpt: string | null;
}

export interface ContentRiskAnalysisResult {
  status: 'COMPLETED' | 'FAILED';
  provider: 'GEMINI';
  model: string;
  score?: number;
  level?: RiskLevel;
  summary?: string;
  recommendedAction?: RiskRecommendedAction;
  signals?: ContentRiskSignalResult[];
  error?: string;
}
