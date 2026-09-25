import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../services/marketData';
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface RiskCalculatorViewProps {
  initialValues?: {
    symbol?: string;
    entry?: number;
    stopLoss?: number;
    target?: number;
  };
  currency: 'INR' | 'USD';
  onAskAiToValidate?: (prompt: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const RiskCalculatorView: React.FC<RiskCalculatorViewProps> = ({
  initialValues,
  currency,
  onAskAiToValidate,
  isModal = false,
  onClose,
}) => {
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(initialValues?.entry || 500);
  const [stopLossPrice, setStopLossPrice] = useState<number>(initialValues?.stopLoss || 490);
  const [targetPrice, setTargetPrice] = useState<number>(initialValues?.target || 525);
  const [symbol, setSymbol] = useState<string>(initialValues?.symbol || 'NIFTY 50');

  useEffect(() => {
    if (initialValues) {
      if (initialValues.entry) setEntryPrice(initialValues.entry);
      if (initialValues.stopLoss) setStopLossPrice(initialValues.stopLoss);
      if (initialValues.target) setTargetPrice(initialValues.target);
      if (initialValues.symbol) setSymbol(initialValues.symbol);
    }
  }, [initialValues]);

  // Reactive calculations
  const maxRiskAmount = (accountSize * riskPercent) / 100;
  const riskPerShare = Math.abs(entryPrice - stopLossPrice);
  const positionSize = riskPerShare > 0 ? Math.floor(maxRiskAmount / riskPerShare) : 0;
  const totalPositionValue = positionSize * entryPrice;
  const potentialLoss = positionSize * riskPerShare;
  const rewardPerShare = Math.abs(targetPrice - entryPrice);
  const potentialProfit = positionSize * rewardPerShare;
  const riskRewardRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : '0';
  const capitalExposurePercent = accountSize > 0 ? ((totalPositionValue / accountSize) * 100).toFixed(1) : '0';

  const isFavorableRR = Number(riskRewardRatio) >= 2.0;

  const handleSendToAi = () => {
    if (onAskAiToValidate) {
      const prompt = `Review my risk plan for ${symbol}:
Account Size: ${formatPrice(accountSize, currency)}
Risk: ${riskPercent}% (${formatPrice(maxRiskAmount, currency)})
Entry: ${formatPrice(entryPrice, currency)}
Stop Loss: ${formatPrice(stopLossPrice, currency)}
Target: ${formatPrice(targetPrice, currency)}
Position Size: ${positionSize} units
R:R: 1 : ${riskRewardRatio}

Is this setup sound and where could it break down?`;
      onAskAiToValidate(prompt);
      if (onClose) onClose();
    }
  };

  return (
    <div className={`p-4 sm:p-6 max-w-4xl mx-auto ${isModal ? '' : 'h-full overflow-y-auto'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Position Size & Risk Calculator</h2>
          <p className="text-xs text-slate-500">
            Calculate exact shares and potential loss based on account equity.
          </p>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Close
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Inputs */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Inputs
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Asset Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Account Equity</label>
            <input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>Risk Per Trade:</span>
              <span className="font-bold text-slate-800">{riskPercent}%</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="4.0"
              step="0.25"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full accent-slate-800 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Entry</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Math.max(0.001, Number(e.target.value)))}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-rose-600 mb-1">Stop Loss</label>
              <input
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Math.max(0.001, Number(e.target.value)))}
                className="w-full px-2 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-emerald-600 mb-1">Target</label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Math.max(0.001, Number(e.target.value)))}
                className="w-full px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Output Engine */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Calculation Results
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Max Risk Allocated</span>
              <span className="text-base font-bold text-slate-900">
                {formatPrice(maxRiskAmount, currency)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] text-emerald-700 block">Position Size</span>
              <span className="text-base font-bold text-emerald-800">
                {positionSize} <span className="text-xs font-normal">shares</span>
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2 text-slate-600">
            <div className="flex justify-between">
              <span>Risk Per Share:</span>
              <span className="font-semibold text-rose-600">-{formatPrice(riskPerShare, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Potential Loss (Stop Hit):</span>
              <span className="font-semibold text-rose-600">-{formatPrice(potentialLoss, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Potential Gain (Target Hit):</span>
              <span className="font-semibold text-emerald-600">+{formatPrice(potentialProfit, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Position Capital:</span>
              <span className="font-medium text-slate-800">
                {formatPrice(totalPositionValue, currency)} ({capitalExposurePercent}%)
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
              <span className="font-medium text-slate-800">Risk / Reward:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  isFavorableRR
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border border-amber-200'
                }`}
              >
                1 : {riskRewardRatio}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSendToAi}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Validate Plan With AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
