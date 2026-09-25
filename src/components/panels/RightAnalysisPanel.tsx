import React, { useState } from 'react';
import { AssetQuote, Candle } from '../../types/trading';
import { formatPrice } from '../../services/marketData';
import {
  TrendingUp,
  TrendingDown,
  X,
  Sparkles,
  BarChart2,
  ShieldAlert,
  Target,
  Gauge,
  Activity,
  Layers,
} from 'lucide-react';

interface RightAnalysisPanelProps {
  quote: AssetQuote | null;
  currency: 'INR' | 'USD';
  onClose: () => void;
  onAskAi: (prompt: string) => void;
}

export const RightAnalysisPanel: React.FC<RightAnalysisPanelProps> = ({
  quote,
  currency,
  onClose,
  onAskAi,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M'>('1D');

  if (!quote) {
    return (
      <aside className="w-80 shrink-0 border-l border-slate-200 bg-slate-50/60 p-6 flex flex-col items-center justify-center text-center text-slate-400">
        <BarChart2 className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs">Select an asset to view market data</p>
      </aside>
    );
  }

  const isPositive = quote.change24h >= 0;

  // Mini Candlestick SVG generator
  const renderCandlestickChart = (candles: Candle[]) => {
    if (!candles || candles.length === 0) return null;

    const width = 280;
    const height = 120;
    const padding = 10;

    const allPrices = candles.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;

    const candleWidth = Math.max(3, (width - padding * 2) / candles.length - 4);

    return (
      <svg width={width} height={height} className="w-full h-28 overflow-visible">
        <line
          x1={padding}
          y1={padding}
          x2={width - padding}
          y2={padding}
          stroke="#E2E8F0"
          strokeDasharray="2 2"
        />
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="#E2E8F0"
          strokeDasharray="2 2"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#E2E8F0"
          strokeDasharray="2 2"
        />

        {candles.map((candle, idx) => {
          const x = padding + idx * ((width - padding * 2) / candles.length) + candleWidth / 2;
          const isGreen = candle.close >= candle.open;
          const color = isGreen ? '#10B981' : '#EF4444';

          const yHigh = height - padding - ((candle.high - minPrice) / priceRange) * (height - padding * 2);
          const yLow = height - padding - ((candle.low - minPrice) / priceRange) * (height - padding * 2);
          const yOpen = height - padding - ((candle.open - minPrice) / priceRange) * (height - padding * 2);
          const yClose = height - padding - ((candle.close - minPrice) / priceRange) * (height - padding * 2);

          const bodyY = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

          return (
            <g key={idx}>
              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.25" />
              <rect
                x={x - candleWidth / 2}
                y={bodyY}
                width={candleWidth}
                height={bodyHeight}
                fill={color}
                rx={1}
              />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <aside className="w-80 shrink-0 border-l border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-slate-900 text-sm">{quote.symbol}</h3>
            <span className="text-[10px] text-slate-500">· {quote.category}</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate max-w-[190px]">{quote.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Price & Change Banner */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {formatPrice(quote.price, quote.currency)}
            </span>
            <div
              className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${
                isPositive
                  ? 'text-emerald-700 bg-emerald-100'
                  : 'text-rose-700 bg-rose-100'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {isPositive ? '+' : ''}
                {quote.change24hPercent}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>24h Change: {formatPrice(quote.change24h, quote.currency)}</span>
            <span>Vol: {quote.volume}</span>
          </div>
        </div>

        {/* Mini Chart Section */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Intraday Candles</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-slate-200">
              {(['1D', '1W', '1M'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                    selectedTimeframe === tf
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-1.5 rounded-lg border border-slate-200">
            {renderCandlestickChart(quote.intradayCandles)}
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700 block">
            Technical Indicators
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">RSI (14)</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="font-bold text-slate-800">{quote.rsi}</span>
                <span className="text-[10px] text-slate-500">
                  {quote.rsi > 70 ? 'Overbought' : quote.rsi < 30 ? 'Oversold' : 'Neutral'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">MACD</span>
              <span className="font-medium text-slate-700 text-[11px] truncate block mt-0.5">
                {quote.macd}
              </span>
            </div>
          </div>

          {/* Support & Resistance */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Support:</span>
              <span className="font-semibold text-emerald-700">
                {formatPrice(quote.support, quote.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Resistance:</span>
              <span className="font-semibold text-rose-700">
                {formatPrice(quote.resistance, quote.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* AI Action */}
        <div className="pt-1 space-y-2">
          <button
            onClick={() => onAskAi(`Analyze ${quote.symbol} today. Provide trend, key support, resistance, and setup.`)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI About {quote.symbol}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
