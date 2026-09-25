import React from 'react';
import { AssetQuote } from '../../types/trading';
import { formatPrice } from '../../services/marketData';
import { Sparkline } from '../common/Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface MarketOverviewViewProps {
  quotes: AssetQuote[];
  currency: 'INR' | 'USD';
  onSelectAssetForChat: (symbol: string) => void;
  onSelectAssetForPanel: (quote: AssetQuote) => void;
}

export const MarketOverviewView: React.FC<MarketOverviewViewProps> = ({
  quotes,
  currency,
  onSelectAssetForChat,
  onSelectAssetForPanel,
}) => {
  const keySymbols = ['NIFTY 50', 'SENSEX', 'BANK NIFTY', 'USDINR', 'GOLD', 'BTCUSDT'];
  const keyQuotes = keySymbols
    .map((sym) => quotes.find((q) => q.symbol === sym))
    .filter(Boolean) as AssetQuote[];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto h-full overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Market Overview</h2>
          <p className="text-xs text-slate-500">
            Benchmarks, currency pairs, commodities, and sentiment.
          </p>
        </div>

        <button
          onClick={() =>
            onSelectAssetForChat(
              'Summarize broader market conditions today across Indian indices and Bitcoin.'
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI Summary</span>
        </button>
      </div>

      {/* Benchmark Index Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {keyQuotes.map((q) => {
          const isPositive = q.change24h >= 0;
          return (
            <div
              key={q.symbol}
              onClick={() => onSelectAssetForPanel(q)}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{q.symbol}</span>
                  <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">{q.name}</span>
                </div>
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {q.change24hPercent}%
                </span>
              </div>

              <div className="my-1.5">
                <span className="text-lg font-bold text-slate-900">
                  {formatPrice(q.price, q.currency)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Trend: <strong className="text-slate-700">{q.trend}</strong>
                </span>
                <Sparkline data={q.sparkline} isPositive={isPositive} width={70} height={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Market Sentiment Overview */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Market Sentiment Drivers
          </h3>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Bullish Stance (68 / 100)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-2.5 rounded-lg bg-slate-50">
            <span className="font-semibold text-slate-800 block mb-1">DII Inflows</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Domestic mutual fund inflows remain steady, providing price support on pullbacks.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50">
            <span className="font-semibold text-slate-800 block mb-1">Global Liquidity</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Global rate cuts supporting emerging market equities and high-beta assets.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50">
            <span className="font-semibold text-slate-800 block mb-1">Volatility Watch</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Crude oil prices and currency fluctuations remain primary watch items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
