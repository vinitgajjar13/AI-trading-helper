import React from 'react';
import { TradeSetup } from '../../types/trading';
import { formatPrice } from '../../services/marketData';
import { TrendingUp, TrendingDown, ShieldAlert, Target, Calculator, BookOpen } from 'lucide-react';

interface TradeSetupCardProps {
  setup: TradeSetup;
  currency?: 'INR' | 'USD';
  onApplyToCalculator?: (setup: TradeSetup) => void;
  onAddToJournal?: (setup: TradeSetup) => void;
}

export const TradeSetupCard: React.FC<TradeSetupCardProps> = ({
  setup,
  currency = 'INR',
  onApplyToCalculator,
  onAddToJournal,
}) => {
  const isLong = setup.direction === 'LONG';
  const riskPerShare = Math.abs(setup.entry - setup.stopLoss);
  const reward1 = Math.abs(setup.target1 - setup.entry);
  const reward2 = setup.target2 ? Math.abs(setup.target2 - setup.entry) : reward1;

  const qualityBadge =
    setup.quality === 'Strong'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : setup.quality === 'Moderate'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-slate-600 bg-slate-100 border-slate-200';

  return (
    <div className="my-3 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:border-slate-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
              isLong
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isLong ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{setup.direction}</span>
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-tight">{setup.symbol} Setup</span>
        </div>

        <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${qualityBadge}`}>
          Quality: {setup.quality}
        </span>
      </div>

      {/* Main Levels Grid */}
      <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-500 block">Entry</span>
          <span className="text-sm font-bold text-slate-800">
            {formatPrice(setup.entry, currency)}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
          <div className="flex items-center gap-1 text-[10px] font-medium text-rose-700">
            <ShieldAlert className="w-3 h-3" />
            <span>Stop Loss</span>
          </div>
          <span className="text-sm font-bold text-rose-700">
            {formatPrice(setup.stopLoss, currency)}
          </span>
          <span className="text-[9px] text-rose-600/80 block">
            -{formatPrice(riskPerShare, currency)}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700">
            <Target className="w-3 h-3" />
            <span>Target 1</span>
          </div>
          <span className="text-sm font-bold text-emerald-700">
            {formatPrice(setup.target1, currency)}
          </span>
          <span className="text-[9px] text-emerald-600/80 block">
            +{formatPrice(reward1, currency)}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700">
            <Target className="w-3 h-3" />
            <span>Target 2</span>
          </div>
          <span className="text-sm font-bold text-emerald-700">
            {formatPrice(setup.target2, currency)}
          </span>
          <span className="text-[9px] text-emerald-600/80 block">
            +{formatPrice(reward2, currency)}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="px-3 pb-2.5 pt-1 space-y-1.5 text-xs border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Risk / Reward:</span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
            {setup.riskReward}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-slate-500 shrink-0">Setup:</span>
          <span className="text-slate-700 font-medium text-right">{setup.setup}</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-slate-500 shrink-0">Invalidation:</span>
          <span className="text-rose-600 font-medium text-right">{setup.invalidation}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
        {onApplyToCalculator && (
          <button
            onClick={() => onApplyToCalculator(setup)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Calculator className="w-3 h-3 text-emerald-600" />
            <span>Calculate Size</span>
          </button>
        )}
        {onAddToJournal && (
          <button
            onClick={() => onAddToJournal(setup)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="w-3 h-3 text-indigo-600" />
            <span>Log Trade</span>
          </button>
        )}
      </div>
    </div>
  );
};
