import { AssetQuote, RiskCalculation } from '../types/trading';

export async function fetchMarketData(symbol?: string): Promise<{ quotes: AssetQuote[]; indices: AssetQuote[] }> {
  try {
    const url = symbol ? `/api/market-data?symbol=${encodeURIComponent(symbol)}` : '/api/market-data';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch market data');
    const json = await res.json();
    if (symbol) {
      return { quotes: json.data ? [json.data] : [], indices: [] };
    }
    return {
      quotes: json.data || [],
      indices: json.indices || [],
    };
  } catch (err) {
    console.error('Error fetching market data from server:', err);
    return { quotes: [], indices: [] };
  }
}

export async function sendChatMessage(params: {
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  currentSymbol: string;
  uploadedImage?: { data: string; mimeType: string } | null;
  riskProfile?: { accountSize: number; riskPercent: number };
}): Promise<{ reply: string; symbol: string; marketContext?: any; notice?: string }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'Failed to send message to TradeMind AI');
  }

  return res.json();
}

export async function analyzeChartImage(imageData: string, mimeType = 'image/png', additionalNotes = ''): Promise<{ analysis: string }> {
  const res = await fetch('/api/analyze-chart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, mimeType, additionalNotes }),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'Failed to analyze chart');
  }

  return res.json();
}

export async function calculateRiskPosition(params: {
  accountSize: number;
  riskPercent: number;
  entry: number;
  stopLoss: number;
  target: number;
}): Promise<RiskCalculation> {
  const res = await fetch('/api/risk-calc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error('Risk calculation failed');
  }

  const json = await res.json();
  return json.data;
}

export async function auditJournalTrades(trades: any[]): Promise<string> {
  const res = await fetch('/api/journal/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trades }),
  });

  if (!res.ok) {
    throw new Error('Failed to audit trading journal');
  }

  const json = await res.json();
  return json.audit;
}
