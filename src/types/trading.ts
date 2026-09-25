export type AssetCategory = 'Indices' | 'Equities' | 'Crypto' | 'Commodities' | 'Forex';
export type MarketTrend = 'Bullish' | 'Bearish' | 'Neutral';
export type TradeDirection = 'LONG' | 'SHORT';
export type SetupQuality = 'Strong' | 'Moderate' | 'Weak';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AssetQuote {
  symbol: string;
  name: string;
  category: AssetCategory;
  currency: 'INR' | 'USD';
  price: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  rsi: number;
  macd: string;
  trend: MarketTrend;
  support: number;
  resistance: number;
  sma20: number;
  sma50: number;
  ema200: number;
  sparkline: number[];
  intradayCandles: Candle[];
  sentimentScore: number;
  sentimentSummary: string;
  isDemoData: boolean;
}

export interface TradeSetup {
  symbol: string;
  direction: TradeDirection;
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: string;
  setup: string;
  invalidation: string;
  quality: SetupQuality;
  qualityRationale: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachedImage?: {
    data: string;
    mimeType: string;
    previewUrl?: string;
  };
  parsedSetup?: TradeSetup | null;
  notice?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  currentSymbol: string;
}

export interface RiskCalculation {
  accountSize: number;
  riskPercent: number;
  maxRiskAmount: number;
  entry: number;
  stopLoss: number;
  target: number;
  riskPerShare: number;
  rewardPerShare: number;
  positionSize: number;
  totalPositionValue: number;
  potentialLoss: number;
  potentialProfit: number;
  riskRewardRatio: string;
  capitalExposurePercent: string;
}

export interface JournalTrade {
  id: string;
  date: string;
  symbol: string;
  direction: TradeDirection;
  entry: number;
  exit?: number;
  stopLoss: number;
  target: number;
  positionSize: number;
  strategy: string;
  result: 'Win' | 'Loss' | 'Breakeven' | 'Open';
  pnl: number;
  notes: string;
  screenshotUrl?: string;
}

export interface JournalMetrics {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  averageRR: number;
  bestStrategy: string;
  worstStrategy: string;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
}
