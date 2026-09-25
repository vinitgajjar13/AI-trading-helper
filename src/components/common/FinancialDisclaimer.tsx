import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FinancialDisclaimerProps {
  compact?: boolean;
}

export const FinancialDisclaimer: React.FC<FinancialDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>Educational analysis only. Not financial advice. Trading involves capital risk.</span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-slate-700 flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-slate-900">Financial Disclaimer:</span> TradeMind AI provides educational and analytical information, not guaranteed investment returns or personalized financial advice. Trading involves risk.
      </div>
    </div>
  );
};
