import { AssetQuote, TradeSetup, JournalTrade, Conversation } from '../types/trading';

export const DEFAULT_WATCHLIST_SYMBOLS = [
  'NIFTY 50',
  'BANK NIFTY',
  'RELIANCE',
  'TCS',
  'HDFCBANK',
  'BTCUSDT',
  'GOLD',
  'AAPL',
  'NVDA',
];

export const INITIAL_JOURNAL_TRADES: JournalTrade[] = [
  {
    id: 'trade-1',
    date: '2026-09-22',
    symbol: 'NIFTY 50',
    direction: 'LONG',
    entry: 25320,
    exit: 25480,
    stopLoss: 25250,
    target: 25500,
    positionSize: 50,
    strategy: 'Pullback to 20-EMA',
    result: 'Win',
    pnl: 8000,
    notes: 'Clean defense of 25,300 round number support. Trailed stop loss effectively into market close.',
  },
  {
    id: 'trade-2',
    date: '2026-09-21',
    symbol: 'RELIANCE',
    direction: 'LONG',
    entry: 2940,
    exit: 2980,
    stopLoss: 2915,
    target: 2990,
    positionSize: 200,
    strategy: 'Consolidation Breakout',
    result: 'Win',
    pnl: 8000,
    notes: 'Volume expansion on 15m breakout bar. Exited 70% at target 1, trailed remainder to 2,980.',
  },
  {
    id: 'trade-3',
    date: '2026-09-18',
    symbol: 'BTCUSDT',
    direction: 'SHORT',
    entry: 64800,
    exit: 65150,
    stopLoss: 65100,
    target: 63500,
    positionSize: 0.5,
    strategy: 'Resistance Rejection',
    result: 'Loss',
    pnl: -175,
    notes: 'Counter-trend short attempt. Slipped through stop loss slightly during ETF inflow spike. Stuck to hard SL.',
  },
  {
    id: 'trade-4',
    date: '2026-09-16',
    symbol: 'HDFCBANK',
    direction: 'LONG',
    entry: 1650,
    exit: 1675,
    stopLoss: 1635,
    target: 1680,
    positionSize: 400,
    strategy: 'Double Bottom Neckline',
    result: 'Win',
    pnl: 10000,
    notes: 'High probability textbook neckline re-test. High conviction setup following banking rally.',
  },
];

export function formatPrice(value: number, currency: 'INR' | 'USD' = 'INR'): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  const prefix = currency === 'INR' ? '₹' : '$';
  if (currency === 'INR') {
    return `${prefix}${value.toLocaleString('en-IN', {
      minimumFractionDigits: value < 100 ? 2 : 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${prefix}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseTradeSetupFromMarkdown(text: string): { cleanedMarkdown: string; setup: TradeSetup | null } {
  if (!text) return { cleanedMarkdown: '', setup: null };

  const regex = /```(?:trade-setup|json)?\s*(\{[\s\S]*?"symbol"[\s\S]*?"direction"[\s\S]*?\})\s*```/i;
  const match = text.match(regex);

  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]) as TradeSetup;
      const cleaned = text.replace(match[0], '').trim();
      return { cleanedMarkdown: cleaned, setup: parsed };
    } catch {
      // JSON parse error, keep full text
    }
  }

  return { cleanedMarkdown: text, setup: null };
}

// Storage helpers with safe localStorage
const CONVERSATIONS_KEY = 'trademind_conversations';
const WATCHLIST_KEY = 'trademind_watchlist';
const JOURNAL_KEY = 'trademind_journal';
const SETTINGS_KEY = 'trademind_settings';

export interface UserSettings {
  preferredCurrency: 'INR' | 'USD';
  defaultRiskPercent: number;
  defaultAccountSize: number;
  theme: 'dark' | 'light';
  analysisDetail: 'balanced' | 'deep' | 'concise';
}

export const DEFAULT_SETTINGS: UserSettings = {
  preferredCurrency: 'INR',
  defaultRiskPercent: 1.0,
  defaultAccountSize: 100000,
  theme: 'light',
  analysisDetail: 'balanced',
};

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_WATCHLIST_SYMBOLS;
}

export function saveWatchlist(symbols: string[]): void {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols));
  } catch {
    // ignore
  }
}

export function loadJournalTrades(): JournalTrade[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_JOURNAL_TRADES;
}

export function saveJournalTrades(trades: JournalTrade[]): void {
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(trades));
  } catch {
    // ignore
  }
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }

  // Initial welcome conversation
  const welcomeConv: Conversation = {
    id: 'conv-default',
    title: 'Market Analysis & Setup Primer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentSymbol: 'NIFTY 50',
    messages: [
      {
        id: 'msg-welcome-ai',
        role: 'assistant',
        content: `Welcome to **TradeMind AI** — your institutional-grade trading research and strategy copilot.

I am engineered to help you analyze market structure, test technical setups, manage position sizing, and audit your execution discipline.

* **Market Analysis:** Ask about any symbol (e.g. \`NIFTY 50\`, \`RELIANCE\`, \`BTCUSDT\`, \`GOLD\`, or \`AAPL\`) for key support, resistance, moving averages, and scenario pathways.
* **Trade Setups:** Request structured trade setups with explicit entry, stop loss, targets, and invalidation rules.
* **Chart Vision:** Upload any TradingView or candlestick screenshot for instant pattern and trendline breakdown.
* **Risk Engine:** Calculate exact position sizing based on your account equity and max risk tolerance.

What asset or chart are we reviewing today?`,
        timestamp: new Date().toISOString(),
        parsedSetup: {
          symbol: 'NIFTY 50',
          direction: 'LONG',
          entry: 25420,
          stopLoss: 25280,
          target1: 25750,
          target2: 25950,
          riskReward: '1 : 2.4',
          setup: 'Consolidation Breakout above 25,400 with 20-EMA slope',
          invalidation: 'Hourly candle close below 25,280 support floor',
          quality: 'Strong',
          qualityRationale: 'Confluence of multi-timeframe moving average support, RSI neutral-bullish room (61.4), and institutional volume defense.',
        },
      },
    ],
  };

  return [welcomeConv];
}

export function saveConversations(convs: Conversation[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
  } catch {
    // ignore
  }
}
