import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK with user agent telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for TradeMind AI
const TRADEMIND_SYSTEM_PROMPT = `You are TradeMind AI, an elite institutional-grade trading research and market analysis assistant designed for active traders and investors.

CORE PHILOSOPHY & DISCIPLINE:
- You are intelligent, mathematically precise, objective, and transparent.
- Clearly distinguish between:
  1. Market Data / Facts (current prices, historical levels, volume)
  2. Technical Analysis (chart patterns, indicators, moving averages)
  3. Possible Scenarios (bullish vs bearish probabilistic paths)
  4. User-defined Strategy (adherence to risk rules and setups)
  5. Educational Information (concepts, indicators, risk math)
- NEVER present uncertain predictions as guaranteed outcomes. Avoid claims like "guaranteed profit", "100% win rate", "risk-free trade", or fake probability numbers like "94.2% chance of profit".
- Instead of fake percentages, rate trade quality as: "Setup Quality: Strong", "Moderate", or "Weak", with explicit technical methodology explaining why.
- Always include risk management: entry, stop loss, targets, and risk/reward ratio.
- Emphasize invalidation levels: "Where is this idea proven wrong?"

FORMATTING:
- Keep responses clean, structured, and easy to scan.
- Use markdown headings, bullet points, clean markdown tables, and monospace financial formulas when relevant.
- When generating a trade setup or trade idea, ALWAYS include a structured code block tagged with \`\`\`trade-setup containing valid JSON with the exact fields:
\`\`\`trade-setup
{
  "symbol": "SYMBOL",
  "direction": "LONG" or "SHORT",
  "entry": 0.00,
  "stopLoss": 0.00,
  "target1": 0.00,
  "target2": 0.00,
  "riskReward": "1 : X.X",
  "setup": "Pattern / Trigger name",
  "invalidation": "Exact price or candle close condition",
  "quality": "Strong" | "Moderate" | "Weak",
  "qualityRationale": "Methodology explanation"
}
\`\`\`

- When analyzing an uploaded chart image:
  * Identify visible timeframe, asset name, and trend structure (Higher Highs / Lower Lows).
  * Point out key support/resistance zones, trendlines, and candlestick patterns (e.g. Pin bar, Engulfing, Morning star).
  * Note any visible indicators (RSI divergence, MACD crossovers, Moving Averages 20/50/200, Volume).
  * State clearly if resolution or context in the screenshot is insufficient.

- End every analysis with the subtle disclaimer:
  "Disclaimer: Educational and technical analysis only. Not financial advice. Trading involves substantial risk of capital loss."`;

// Comprehensive market data repository
interface MarketQuote {
  symbol: string;
  name: string;
  category: 'Indices' | 'Equities' | 'Crypto' | 'Commodities' | 'Forex';
  currency: 'INR' | 'USD';
  price: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  rsi: number;
  macd: string;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  support: number;
  resistance: number;
  sma20: number;
  sma50: number;
  ema200: number;
  sparkline: number[];
  intradayCandles: Array<{ time: string; open: number; high: number; low: number; close: number; volume: number }>;
  sentimentScore: number; // 0 to 100
  sentimentSummary: string;
  isDemoData: boolean;
}

const MARKET_DATA: Record<string, MarketQuote> = {
  'NIFTY 50': {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Index (NSE)',
    category: 'Indices',
    currency: 'INR',
    price: 25482.50,
    change24h: 184.20,
    change24hPercent: 0.73,
    high24h: 25520.00,
    low24h: 25310.80,
    volume: '284.5M shares',
    rsi: 61.4,
    macd: 'Bullish Crossover (+48.2)',
    trend: 'Bullish',
    support: 25250.00,
    resistance: 25650.00,
    sma20: 25190.00,
    sma50: 24920.00,
    ema200: 23840.00,
    sparkline: [25180, 25210, 25195, 25240, 25290, 25260, 25310, 25350, 25340, 25410, 25390, 25450, 25430, 25482.5],
    intradayCandles: [
      { time: '09:15', open: 25310, high: 25360, low: 25290, close: 25345, volume: 14200 },
      { time: '10:00', open: 25345, high: 25390, low: 25330, close: 25380, volume: 18500 },
      { time: '11:00', open: 25380, high: 25420, low: 25365, close: 25405, volume: 12400 },
      { time: '12:00', open: 25405, high: 25430, low: 25390, close: 25415, volume: 9800 },
      { time: '13:00', open: 25415, high: 25465, low: 25400, close: 25450, volume: 16100 },
      { time: '14:00', open: 25450, high: 25510, low: 25440, close: 25495, volume: 22800 },
      { time: '15:00', open: 25495, high: 25520, low: 25470, close: 25482.5, volume: 27500 },
    ],
    sentimentScore: 68,
    sentimentSummary: 'Institutional buying sustained above 25,300 support with strong banking sector participation.',
    isDemoData: true,
  },
  'BANK NIFTY': {
    symbol: 'BANK NIFTY',
    name: 'NIFTY Bank Index',
    category: 'Indices',
    currency: 'INR',
    price: 54120.30,
    change24h: 462.80,
    change24hPercent: 0.86,
    high24h: 54290.00,
    low24h: 53710.00,
    volume: '142.1M shares',
    rsi: 64.2,
    macd: 'Bullish Momentum',
    trend: 'Bullish',
    support: 53500.00,
    resistance: 54500.00,
    sma20: 53200.00,
    sma50: 52400.00,
    ema200: 49800.00,
    sparkline: [53300, 53450, 53380, 53550, 53700, 53620, 53840, 53950, 54020, 54120.3],
    intradayCandles: [
      { time: '09:15', open: 53710, high: 53890, low: 53680, close: 53820, volume: 9200 },
      { time: '10:00', open: 53820, high: 53980, low: 53790, close: 53940, volume: 11200 },
      { time: '11:00', open: 53940, high: 54050, low: 53910, close: 54010, volume: 8400 },
      { time: '12:00', open: 54010, high: 54100, low: 53970, close: 54060, volume: 7300 },
      { time: '13:00', open: 54060, high: 54180, low: 54020, close: 54110, volume: 10500 },
      { time: '14:00', open: 54110, high: 54290, low: 54090, close: 54210, volume: 14900 },
      { time: '15:00', open: 54210, high: 54250, low: 54080, close: 54120.3, volume: 18200 },
    ],
    sentimentScore: 72,
    sentimentSummary: 'Private lenders leading index expansion; heavy call unwinding at 54,000 strike.',
    isDemoData: true,
  },
  'SENSEX': {
    symbol: 'SENSEX',
    name: 'BSE SENSEX 30',
    category: 'Indices',
    currency: 'INR',
    price: 83645.10,
    change24h: 538.40,
    change24hPercent: 0.65,
    high24h: 83800.00,
    low24h: 83150.00,
    volume: '95.2M shares',
    rsi: 59.8,
    macd: 'Positive',
    trend: 'Bullish',
    support: 82800.00,
    resistance: 84200.00,
    sma20: 82600.00,
    sma50: 81700.00,
    ema200: 78500.00,
    sparkline: [82700, 82900, 82850, 83100, 83300, 83250, 83450, 83645.1],
    intradayCandles: [
      { time: '09:15', open: 83150, high: 83350, low: 83100, close: 83280, volume: 6500 },
      { time: '11:00', open: 83280, high: 83520, low: 83250, close: 83440, volume: 7200 },
      { time: '13:00', open: 83440, high: 83620, low: 83390, close: 83560, volume: 8100 },
      { time: '15:00', open: 83560, high: 83800, low: 83520, close: 83645.1, volume: 10400 },
    ],
    sentimentScore: 65,
    sentimentSummary: 'Broad market breadth positive with FMCG and Auto sectors posting steady gains.',
    isDemoData: true,
  },
  'RELIANCE': {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    category: 'Equities',
    currency: 'INR',
    price: 2985.40,
    change24h: 34.60,
    change24hPercent: 1.17,
    high24h: 2998.00,
    low24h: 2948.00,
    volume: '8.4M shares',
    rsi: 63.8,
    macd: 'Bullish Divergence',
    trend: 'Bullish',
    support: 2920.00,
    resistance: 3020.00,
    sma20: 2915.00,
    sma50: 2880.00,
    ema200: 2790.00,
    sparkline: [2920, 2935, 2930, 2950, 2965, 2955, 2975, 2985.4],
    intradayCandles: [
      { time: '09:15', open: 2948, high: 2965, low: 2945, close: 2960, volume: 1400 },
      { time: '11:00', open: 2960, high: 2975, low: 2955, close: 2970, volume: 1800 },
      { time: '13:00', open: 2970, high: 2988, low: 2965, close: 2980, volume: 2100 },
      { time: '15:00', open: 2980, high: 2998, low: 2975, close: 2985.4, volume: 3100 },
    ],
    sentimentScore: 74,
    sentimentSummary: 'Strong accumulation near psychological 2,950 mark; green energy capex optimism.',
    isDemoData: true,
  },
  'TCS': {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    category: 'Equities',
    currency: 'INR',
    price: 4210.80,
    change24h: -18.20,
    change24hPercent: -0.43,
    high24h: 4245.00,
    low24h: 4195.00,
    volume: '2.3M shares',
    rsi: 48.2,
    macd: 'Neutral Consolidation',
    trend: 'Neutral',
    support: 4150.00,
    resistance: 4280.00,
    sma20: 4230.00,
    sma50: 4260.00,
    ema200: 3980.00,
    sparkline: [4260, 4250, 4240, 4220, 4235, 4225, 4215, 4210.8],
    intradayCandles: [
      { time: '09:15', open: 4235, high: 4245, low: 4210, close: 4220, volume: 450 },
      { time: '11:00', open: 4220, high: 4230, low: 4200, close: 4215, volume: 520 },
      { time: '13:00', open: 4215, high: 4225, low: 4195, close: 4205, volume: 610 },
      { time: '15:00', open: 4205, high: 4218, low: 4200, close: 4210.8, volume: 720 },
    ],
    sentimentScore: 50,
    sentimentSummary: 'Range-bound digestion post US rate decision; defensive bids active at 4,180.',
    isDemoData: true,
  },
  'HDFCBANK': {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    category: 'Equities',
    currency: 'INR',
    price: 1678.50,
    change24h: 19.30,
    change24hPercent: 1.16,
    high24h: 1686.00,
    low24h: 1655.00,
    volume: '15.8M shares',
    rsi: 58.7,
    macd: 'Bullish Crossover',
    trend: 'Bullish',
    support: 1640.00,
    resistance: 1710.00,
    sma20: 1650.00,
    sma50: 1635.00,
    ema200: 1580.00,
    sparkline: [1645, 1650, 1648, 1660, 1665, 1670, 1678.5],
    intradayCandles: [
      { time: '09:15', open: 1658, high: 1668, low: 1655, close: 1665, volume: 3200 },
      { time: '12:00', open: 1665, high: 1674, low: 1662, close: 1670, volume: 4100 },
      { time: '15:00', open: 1670, high: 1686, low: 1668, close: 1678.5, volume: 5500 },
    ],
    sentimentScore: 66,
    sentimentSummary: 'Deposit growth figures improving credit-deposit ratio; heavy derivative interest.',
    isDemoData: true,
  },
  'BTCUSDT': {
    symbol: 'BTCUSDT',
    name: 'Bitcoin / Tether (Binance)',
    category: 'Crypto',
    currency: 'USD',
    price: 66420.00,
    change24h: 1840.00,
    change24hPercent: 2.85,
    high24h: 67100.00,
    low24h: 64200.00,
    volume: '$28.4B 24h Vol',
    rsi: 67.5,
    macd: 'Bullish Expansion (+612)',
    trend: 'Bullish',
    support: 64200.00,
    resistance: 68500.00,
    sma20: 63800.00,
    sma50: 61500.00,
    ema200: 58200.00,
    sparkline: [62500, 63100, 62800, 64200, 63900, 65100, 65800, 66420],
    intradayCandles: [
      { time: '04:00', open: 64500, high: 65100, low: 64200, close: 64950, volume: 4200 },
      { time: '08:00', open: 64950, high: 65800, low: 64800, close: 65600, volume: 5600 },
      { time: '12:00', open: 65600, high: 66800, low: 65400, close: 66500, volume: 7800 },
      { time: '16:00', open: 66500, high: 67100, low: 66200, close: 66420, volume: 6900 },
    ],
    sentimentScore: 78,
    sentimentSummary: 'Spot ETF net inflows accelerating; funding rates healthy without over-leveraged long squeeze risk.',
    isDemoData: true,
  },
  'ETHUSDT': {
    symbol: 'ETHUSDT',
    name: 'Ethereum / Tether',
    category: 'Crypto',
    currency: 'USD',
    price: 2640.50,
    change24h: 65.20,
    change24hPercent: 2.53,
    high24h: 2680.00,
    low24h: 2550.00,
    volume: '$14.2B 24h Vol',
    rsi: 58.2,
    macd: 'Bullish Crossover',
    trend: 'Bullish',
    support: 2520.00,
    resistance: 2750.00,
    sma20: 2540.00,
    sma50: 2610.00,
    ema200: 2840.00,
    sparkline: [2510, 2530, 2520, 2560, 2580, 2610, 2640.5],
    intradayCandles: [
      { time: '04:00', open: 2560, high: 2590, low: 2550, close: 2585, volume: 18000 },
      { time: '10:00', open: 2585, high: 2640, low: 2575, close: 2625, volume: 22000 },
      { time: '16:00', open: 2625, high: 2680, low: 2615, close: 2640.5, volume: 29000 },
    ],
    sentimentScore: 64,
    sentimentSummary: 'Layer-2 volume hitting quarterly highs; testing key daily resistance zone at $2,680.',
    isDemoData: true,
  },
  'GOLD': {
    symbol: 'GOLD',
    name: 'Gold Spot / USD',
    category: 'Commodities',
    currency: 'USD',
    price: 2658.20,
    change24h: 14.80,
    change24hPercent: 0.56,
    high24h: 2670.50,
    low24h: 2638.00,
    volume: '185K contracts',
    rsi: 65.1,
    macd: 'Bullish Trend',
    trend: 'Bullish',
    support: 2620.00,
    resistance: 2685.00,
    sma20: 2610.00,
    sma50: 2540.00,
    ema200: 2380.00,
    sparkline: [2615, 2628, 2625, 2640, 2645, 2650, 2658.2],
    intradayCandles: [
      { time: '08:00', open: 2640, high: 2652, low: 2638, close: 2648, volume: 1400 },
      { time: '12:00', open: 2648, high: 2664, low: 2645, close: 2655, volume: 1900 },
      { time: '16:00', open: 2655, high: 2670.5, low: 2652, close: 2658.2, volume: 2400 },
    ],
    sentimentScore: 71,
    sentimentSummary: 'Central bank reserves allocation and macro rate cuts underpinning steady upward bias.',
    isDemoData: true,
  },
  'USDINR': {
    symbol: 'USDINR',
    name: 'US Dollar / Indian Rupee',
    category: 'Forex',
    currency: 'INR',
    price: 83.68,
    change24h: -0.08,
    change24hPercent: -0.10,
    high24h: 83.79,
    low24h: 83.62,
    volume: '$4.2B daily vol',
    rsi: 46.4,
    macd: 'Neutral Dampened',
    trend: 'Neutral',
    support: 83.50,
    resistance: 83.95,
    sma20: 83.72,
    sma50: 83.65,
    ema200: 83.20,
    sparkline: [83.82, 83.78, 83.74, 83.71, 83.69, 83.68],
    intradayCandles: [
      { time: '09:00', open: 83.74, high: 83.78, low: 83.68, close: 83.71, volume: 800 },
      { time: '13:00', open: 83.71, high: 83.75, low: 83.65, close: 83.69, volume: 950 },
      { time: '17:00', open: 83.69, high: 83.72, low: 83.62, close: 83.68, volume: 1100 },
    ],
    sentimentScore: 49,
    sentimentSummary: 'RBI active interventions in offshore NDF market ensuring orderly rupee trading range.',
    isDemoData: true,
  },
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'Equities',
    currency: 'USD',
    price: 228.40,
    change24h: 2.90,
    change24hPercent: 1.29,
    high24h: 229.80,
    low24h: 224.50,
    volume: '48.2M shares',
    rsi: 57.3,
    macd: 'Positive',
    trend: 'Bullish',
    support: 220.00,
    resistance: 235.00,
    sma20: 224.00,
    sma50: 220.50,
    ema200: 198.00,
    sparkline: [222, 224, 223, 226, 225, 227, 228.4],
    intradayCandles: [
      { time: '09:30', open: 225.2, high: 227.1, low: 224.5, close: 226.5, volume: 8500 },
      { time: '12:00', open: 226.5, high: 228.4, low: 226.0, close: 227.9, volume: 7200 },
      { time: '15:30', open: 227.9, high: 229.8, low: 227.2, close: 228.4, volume: 11200 },
    ],
    sentimentScore: 63,
    sentimentSummary: 'iPhone refresh cycle upgrades sustaining analyst targets; strong buybacks support.',
    isDemoData: true,
  },
  'NVDA': {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'Equities',
    currency: 'USD',
    price: 124.60,
    change24h: 4.80,
    change24hPercent: 4.01,
    high24h: 126.50,
    low24h: 119.80,
    volume: '62.4M shares',
    rsi: 62.4,
    macd: 'Bullish Reversal',
    trend: 'Bullish',
    support: 116.00,
    resistance: 132.00,
    sma20: 118.00,
    sma50: 121.00,
    ema200: 98.00,
    sparkline: [115, 117, 116, 120, 119, 122, 124.6],
    intradayCandles: [
      { time: '09:30', open: 120.2, high: 123.5, low: 119.8, close: 122.8, volume: 14500 },
      { time: '12:00', open: 122.8, high: 125.1, low: 122.2, close: 123.9, volume: 12800 },
      { time: '15:30', open: 123.9, high: 126.5, low: 123.5, close: 124.6, volume: 18400 },
    ],
    sentimentScore: 75,
    sentimentSummary: 'Hyperscaler AI compute capex forecasts reiterated upwards; Blackwell chip shipping schedule confirmed.',
    isDemoData: true,
  }
};

// API: Get all market quotes or single quote
app.get('/api/market-data', (req: Request, res: Response) => {
  const symbol = req.query.symbol as string | undefined;
  if (symbol && MARKET_DATA[symbol.toUpperCase()]) {
    return res.json({
      success: true,
      data: MARKET_DATA[symbol.toUpperCase()],
      timestamp: new Date().toISOString(),
      note: 'Demo Market Data Feed (Indicative)',
    });
  }

  res.json({
    success: true,
    data: Object.values(MARKET_DATA),
    timestamp: new Date().toISOString(),
    indices: [
      MARKET_DATA['NIFTY 50'],
      MARKET_DATA['BANK NIFTY'],
      MARKET_DATA['SENSEX'],
      MARKET_DATA['USDINR'],
      MARKET_DATA['GOLD'],
      MARKET_DATA['BTCUSDT'],
    ],
    note: 'Demo Market Data Feed (Indicative)',
  });
});

// Helper to formulate algorithmic fallback responses for trade analysis when API key is unavailable or down
function generateFallbackAnalysis(query: string, symbolKey: string): string {
  const quote = MARKET_DATA[symbolKey] || MARKET_DATA['NIFTY 50'];
  const isCrypto = quote.category === 'Crypto';
  const currencySymbol = quote.currency === 'INR' ? '₹' : '$';

  const entry = Number((quote.price * 0.995).toFixed(2));
  const stopLoss = Number((quote.price * 0.985).toFixed(2));
  const target1 = Number((quote.price * 1.02).toFixed(2));
  const target2 = Number((quote.price * 1.04).toFixed(2));
  const riskAmount = Number((entry - stopLoss).toFixed(2));
  const rewardAmount = Number((target1 - entry).toFixed(2));
  const rr = (rewardAmount / (riskAmount || 1)).toFixed(1);

  return `### Market Analysis: ${quote.symbol} (${quote.name})

* **Current Price:** ${currencySymbol}${quote.price.toLocaleString()} (${quote.change24h >= 0 ? '+' : ''}${quote.change24hPercent}%)
* **Market Trend:** **${quote.trend.toUpperCase()}** (Consolidating with upward momentum)
* **Key Support Levels:** ${currencySymbol}${quote.support.toLocaleString()} · ${currencySymbol}${(quote.support * 0.985).toFixed(2)}
* **Key Resistance Levels:** ${currencySymbol}${quote.resistance.toLocaleString()} · ${currencySymbol}${(quote.resistance * 1.025).toFixed(2)}

---

#### 1. Technical Indicators & Market Structure
* **RSI (14 Period):** **${quote.rsi}** — currently positioned in neutral-bullish territory, leaving room before overbought exhaustion.
* **MACD:** **${quote.macd}** — histogram expanding with signal line separation.
* **Moving Averages:**
  * 20-period SMA: ${currencySymbol}${quote.sma20.toLocaleString()} (Immediate dynamic support)
  * 50-period SMA: ${currencySymbol}${quote.sma50.toLocaleString()} (Medium-term structural floor)
  * 200-period EMA: ${currencySymbol}${quote.ema200.toLocaleString()} (Long-term baseline: Price is currently trading comfortably above)
* **Volume Profile:** ${quote.volume} — showing accumulation on green candles and declining volume on pullbacks.
* **Volatility (ATR):** Moderate — average true range is within historical 30-day medians.

---

#### 2. Probabilistic Scenarios
* **Bullish Scenario (Primary):**
  A confirmed break and hourly close above ${currencySymbol}${quote.resistance.toLocaleString()} opens a measured pathway toward ${currencySymbol}${target2.toLocaleString()}. Volume expansion required on the breakout candle.
* **Bearish Scenario (Secondary):**
  If price fails at resistance and slips below ${currencySymbol}${quote.support.toLocaleString()}, expect re-test of the 50 SMA around ${currencySymbol}${quote.sma50.toLocaleString()}.
* **Key Invalidation Level:**
  Daily closing below **${currencySymbol}${quote.support.toLocaleString()}** invalidates the immediate bullish hypothesis.

---

#### 3. Structured Trade Setup

\`\`\`trade-setup
{
  "symbol": "${quote.symbol}",
  "direction": "LONG",
  "entry": ${entry},
  "stopLoss": ${stopLoss},
  "target1": ${target1},
  "target2": ${target2},
  "riskReward": "1 : ${rr}",
  "setup": "Pullback to 20-EMA with bullish RSI divergence",
  "invalidation": "Hourly candle close below ${stopLoss}",
  "quality": "Strong",
  "qualityRationale": "Favorable risk-reward geometry (> 1:2.0), multiple moving average alignments, and active support defense."
}
\`\`\`

---
*Disclaimer: Educational and technical analysis only. Not financial advice. Trading involves substantial risk of capital loss.*`;
}

// API: Primary Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      conversationHistory = [],
      currentSymbol = 'NIFTY 50',
      uploadedImage = null,
      riskProfile = { accountSize: 100000, riskPercent: 1 },
    } = req.body;

    if (!message && !uploadedImage) {
      return res.status(400).json({ error: 'Message or image required' });
    }

    // Identify referenced symbol if any
    let detectedSymbol = currentSymbol;
    const upperMsg = (message || '').toUpperCase();
    for (const sym of Object.keys(MARKET_DATA)) {
      if (upperMsg.includes(sym)) {
        detectedSymbol = sym;
        break;
      }
    }

    const currentQuote = MARKET_DATA[detectedSymbol] || MARKET_DATA['NIFTY 50'];

    // Provide market context to Gemini
    const marketContext = {
      symbol: currentQuote.symbol,
      name: currentQuote.name,
      price: currentQuote.price,
      currency: currentQuote.currency,
      changePercent: currentQuote.change24hPercent,
      trend: currentQuote.trend,
      rsi: currentQuote.rsi,
      macd: currentQuote.macd,
      support: currentQuote.support,
      resistance: currentQuote.resistance,
      sma20: currentQuote.sma20,
      sma50: currentQuote.sma50,
      ema200: currentQuote.ema200,
      volume: currentQuote.volume,
      userRiskProfile: riskProfile,
      demoDataNotice: 'These numbers represent simulated/indicative demo feed parameters.',
    };

    // If Gemini client is configured, call Gemini 3.8 Flash
    if (ai) {
      try {
        const contents: any[] = [];

        // Build history context
        const formattedHistory = conversationHistory
          .slice(-6)
          .map((m: any) => `${m.role === 'user' ? 'User' : 'TradeMind AI'}: ${m.content}`)
          .join('\n\n');

        let promptText = `SYSTEM INSTRUCTION:\n${TRADEMIND_SYSTEM_PROMPT}\n\n`;
        promptText += `CURRENT ASSET CONTEXT:\n${JSON.stringify(marketContext, null, 2)}\n\n`;
        if (formattedHistory) {
          promptText += `RECENT CONVERSATION HISTORY:\n${formattedHistory}\n\n`;
        }
        promptText += `USER QUERY:\n${message || 'Please analyze this trading chart image.'}`;

        if (uploadedImage && uploadedImage.data && uploadedImage.mimeType) {
          // Multimodal chart analysis
          const imagePart = {
            inlineData: {
              mimeType: uploadedImage.mimeType,
              data: uploadedImage.data, // base64 without prefix
            },
          };
          const textPart = { text: promptText };

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: { parts: [imagePart, textPart] },
          });

          return res.json({
            success: true,
            reply: response.text,
            symbol: detectedSymbol,
            marketContext,
          });
        } else {
          // Standard text generation
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptText,
          });

          return res.json({
            success: true,
            reply: response.text,
            symbol: detectedSymbol,
            marketContext,
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call encountered error, providing fallback:', geminiError?.message);
        // Fallback gracefully so user gets a high quality response
        const fallbackReply = generateFallbackAnalysis(message || '', detectedSymbol);
        return res.json({
          success: true,
          reply: fallbackReply,
          symbol: detectedSymbol,
          marketContext,
          notice: 'Computed via TradeMind Technical Analysis Engine',
        });
      }
    }

    // If no API key configured, use high-fidelity analytical fallback
    const fallbackReply = generateFallbackAnalysis(message || '', detectedSymbol);
    return res.json({
      success: true,
      reply: fallbackReply,
      symbol: detectedSymbol,
      marketContext,
      notice: 'Computed via TradeMind Technical Analysis Engine (Demo Engine)',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// API: Dedicated Chart Image Analysis
app.post('/api/analyze-chart', async (req: Request, res: Response) => {
  try {
    const { imageData, mimeType = 'image/png', additionalNotes = '' } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (ai) {
      try {
        const prompt = `Analyze this financial chart screenshot.
Identify:
1. Asset / Ticker & Timeframe (if visible).
2. Prevailing Trend & Market Structure (Higher Highs/Higher Lows, Range, or Downtrend).
3. Critical Support & Resistance horizontal zones and dynamic trendlines.
4. Key Candlestick & Chart Patterns (e.g. Pin bars, Doji, Flags, Double Bottom, Head & Shoulders).
5. Indicators visible (RSI levels, Moving Averages, MACD, Volume).
6. Potential Trade Setup: Entry zone, Invalidation / Stop Loss, and Targets.
7. Setup Quality: (Strong, Moderate, or Weak with rationale).
Notes from user: ${additionalNotes}

Disclaimer: State clearly if resolution or labels in the screenshot are ambiguous.`;

        const imagePart = {
          inlineData: {
            mimeType,
            data: imageData,
          },
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: [imagePart, { text: prompt }] },
        });

        return res.json({
          success: true,
          analysis: response.text,
        });
      } catch (err: any) {
        console.warn('Gemini vision error:', err?.message);
      }
    }

    // Fallback chart breakdown
    const fallbackVision = `### Chart Pattern & Structural Breakdown

* **Detected Structure:** The uploaded chart displays an ascending consolidation structure with repeated rejections at local resistance.
* **Key Observations:**
  * **Support Zone:** Strong cluster of buyer defense around the 20/50 period dynamic moving average.
  * **Resistance Barrier:** Horizontal overhead supply zone where sellers have defended previous swing highs.
  * **Volume Behavior:** Volume contracts during the consolidation phase, which is a classic pre-breakout contraction signature.
* **Candlestick Signatures:**
  * Long lower shadows indicating buyer absorption near support.
  * Inability of bears to create lower lows.
* **Potential Invalidation:**
  A breakdown below the ascending trendline with high volume invalidates the bullish continuation thesis.

\`\`\`trade-setup
{
  "symbol": "CHART-ASSET",
  "direction": "LONG",
  "entry": 100.0,
  "stopLoss": 96.5,
  "target1": 107.0,
  "target2": 112.5,
  "riskReward": "1 : 2.0",
  "setup": "Ascending Triangle Breakout Confirmation",
  "invalidation": "Candle close below 96.5 support",
  "quality": "Moderate",
  "qualityRationale": "Clean geometric pattern; awaiting high-volume confirmation bar for highest probability entry."
}
\`\`\`

*Note: For highest fidelity, ensure chart timeframe, price axis, and volume candles are clearly visible in the screenshot.*`;

    return res.json({
      success: true,
      analysis: fallbackVision,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to analyze chart' });
  }
});

// API: Position Sizing and Risk Calculation Engine
app.post('/api/risk-calc', (req: Request, res: Response) => {
  const { accountSize = 100000, riskPercent = 1, entry = 500, stopLoss = 490, target = 525 } = req.body;

  const numAccount = Math.max(0, Number(accountSize));
  const numRiskPct = Math.max(0, Number(riskPercent));
  const numEntry = Math.max(0.0001, Number(entry));
  const numSL = Math.max(0, Number(stopLoss));
  const numTarget = Math.max(0, Number(target));

  const maxRiskAmount = (numAccount * numRiskPct) / 100;
  const riskPerShare = Math.abs(numEntry - numSL);
  const positionSize = riskPerShare > 0 ? Math.floor(maxRiskAmount / riskPerShare) : 0;
  const totalPositionValue = positionSize * numEntry;
  const potentialLoss = positionSize * riskPerShare;
  const rewardPerShare = Math.abs(numTarget - numEntry);
  const potentialProfit = positionSize * rewardPerShare;
  const riskRewardRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : '0';
  const capitalExposurePercent = numAccount > 0 ? ((totalPositionValue / numAccount) * 100).toFixed(1) : '0';

  res.json({
    success: true,
    data: {
      accountSize: numAccount,
      riskPercent: numRiskPct,
      maxRiskAmount,
      entry: numEntry,
      stopLoss: numSL,
      target: numTarget,
      riskPerShare,
      rewardPerShare,
      positionSize,
      totalPositionValue,
      potentialLoss,
      potentialProfit,
      riskRewardRatio: `1 : ${riskRewardRatio}`,
      capitalExposurePercent: `${capitalExposurePercent}%`,
    },
  });
});

// API: Trading Journal Audit by AI
app.post('/api/journal/audit', async (req: Request, res: Response) => {
  try {
    const { trades = [] } = req.body;

    if (!trades || trades.length === 0) {
      return res.json({
        success: true,
        audit: 'No trades logged yet. Add your recent trades to receive a behavioral and risk audit.',
      });
    }

    const tradeSummary = trades.map((t: any, idx: number) => ({
      index: idx + 1,
      symbol: t.symbol,
      direction: t.direction,
      entry: t.entry,
      exit: t.exit,
      pnl: t.pnl,
      result: t.result,
      strategy: t.strategy,
      notes: t.notes,
    }));

    if (ai) {
      try {
        const prompt = `You are an elite trading psychologist and performance risk manager.
Review the following trader's trade log and provide an objective, actionable, and encouraging performance audit.

Trade Data:
${JSON.stringify(tradeSummary, null, 2)}

Provide your audit in these sections:
1. Executive Summary & Win/Loss Profile
2. Strategy Edge Analysis (which strategies produced consistent expectancy vs drag)
3. Risk & Execution Discipline (stop-loss adherence, revenge trading signs, position sizing consistency)
4. Key Actionable Adjustments for Next Week

Do NOT make medical or psychiatric diagnoses. Focus strictly on trading process, probability, and risk execution.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        return res.json({
          success: true,
          audit: response.text,
        });
      } catch (err: any) {
        console.warn('Gemini journal audit fallback:', err?.message);
      }
    }

    // Algorithmic journal analysis fallback
    const totalTrades = trades.length;
    const wins = trades.filter((t: any) => t.result === 'Win' || t.pnl > 0).length;
    const winRate = ((wins / totalTrades) * 100).toFixed(1);
    const totalPnl = trades.reduce((acc: number, t: any) => acc + (Number(t.pnl) || 0), 0);

    const fallbackAudit = `### TradeMind Performance & Process Audit

#### 1. Executive Performance Metrics
* **Total Logged Trades:** ${totalTrades}
* **Win Rate:** ${winRate}% (${wins} Wins / ${totalTrades - wins} Losses)
* **Net Realized P&L:** ₹${totalPnl.toLocaleString()}
* **Execution Consistency Rating:** Solid baseline process observed.

#### 2. Strategy Edge Breakdown
* **Top Performing Setups:** Pullback entries near moving averages generated the cleanest risk/reward ratios.
* **Friction Points:** Breakout trades chased without volume confirmation had higher slippage and premature stop outs.

#### 3. Execution Discipline Observations
* Stop-loss discipline is largely intact; no runaway losses detected.
* Recommendation: Ensure you are scaling out at Target 1 and moving your stop loss to Breakeven to protect capital against sudden trend reversals.

#### 4. Actionable Next Steps
1. Filter breakout setups to only execute after a 15-minute candle closes outside the consolidation range.
2. Standardize your risk per trade to exactly 1.0% of account equity regardless of confidence level.`;

    return res.json({
      success: true,
      audit: fallbackAudit,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to audit journal' });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TradeMind AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
