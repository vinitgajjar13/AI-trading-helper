import React, { useState } from 'react';
import { AssetQuote } from '../../types/trading';
import { formatPrice } from '../../services/marketData';
import { Sparkline } from '../common/Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  Star,
} from 'lucide-react';

interface WatchlistViewProps {
  quotes: AssetQuote[];
  watchlistSymbols: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectAssetForChat: (symbol: string) => void;
  onSelectAssetForPanel: (quote: AssetQuote) => void;
  currency: 'INR' | 'USD';
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  quotes,
  watchlistSymbols,
  onToggleWatchlist,
  onSelectAssetForChat,
  onSelectAssetForPanel,
  currency,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'Indices', 'Equities', 'Crypto', 'Commodities', 'Forex'];

  const filteredQuotes = quotes.filter((q) => {
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesSearch =
      q.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto h-full overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Watchlist</h2>
          <p className="text-xs text-slate-500">
            Real-time market quotes and one-click AI analysis.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Clean Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 w-8"></th>
                <th className="px-3 py-2.5">Asset</th>
                <th className="px-3 py-2.5">Price</th>
                <th className="px-3 py-2.5">24h Change</th>
                <th className="px-3 py-2.5">RSI</th>
                <th className="px-3 py-2.5">Support / Res.</th>
                <th className="px-3 py-2.5">Trend</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredQuotes.map((q) => {
                const isPositive = q.change24h >= 0;
                const isPinned = watchlistSymbols.includes(q.symbol);

                return (
                  <tr
                    key={q.symbol}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onSelectAssetForPanel(q)}
                  >
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleWatchlist(q.symbol)}
                        className={`p-1 rounded ${
                          isPinned ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{q.symbol}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{q.name}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 whitespace-nowrap font-medium text-slate-900">
                      {formatPrice(q.price, q.currency)}
                    </td>

                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold text-[11px] ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {q.change24hPercent}%
                      </span>
                    </td>

                    <td className="px-3 py-2.5 whitespace-nowrap font-medium text-slate-700">
                      {q.rsi}
                    </td>

                    <td className="px-3 py-2.5 whitespace-nowrap text-[11px] text-slate-500">
                      {formatPrice(q.support, q.currency)} / {formatPrice(q.resistance, q.currency)}
                    </td>

                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Sparkline data={q.sparkline} isPositive={isPositive} width={70} height={20} />
                    </td>

                    <td className="px-3 py-2.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectAssetForChat(q.symbol)}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
