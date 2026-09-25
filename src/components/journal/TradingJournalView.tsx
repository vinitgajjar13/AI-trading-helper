import React, { useState } from 'react';
import { JournalTrade } from '../../types/trading';
import { formatPrice } from '../../services/marketData';
import { auditJournalTrades } from '../../services/api';
import {
  BookOpen,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface TradingJournalViewProps {
  trades: JournalTrade[];
  onAddTrade: (trade: JournalTrade) => void;
  onDeleteTrade: (id: string) => void;
  currency: 'INR' | 'USD';
  onAskAi: (prompt: string) => void;
}

export const TradingJournalView: React.FC<TradingJournalViewProps> = ({
  trades,
  onAddTrade,
  onDeleteTrade,
  currency,
  onAskAi,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);

  // New trade form state
  const [newTrade, setNewTrade] = useState<Partial<JournalTrade>>({
    symbol: 'NIFTY 50',
    direction: 'LONG',
    entry: 25400,
    exit: 25550,
    stopLoss: 25300,
    target: 25600,
    positionSize: 50,
    strategy: 'Pullback to 20-EMA',
    result: 'Win',
    pnl: 7500,
    notes: 'Clean execution according to plan.',
    date: new Date().toISOString().split('T')[0],
  });

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === 'Win' || t.pnl > 0);
  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(0) : '0';
  const totalPnl = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      const report = await auditJournalTrades(trades);
      setAuditReport(report);
    } catch {
      setAuditReport('Unable to run audit right now.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSaveTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrade.symbol || !newTrade.entry || !newTrade.stopLoss) return;

    onAddTrade({
      id: `trade-${Date.now()}`,
      date: newTrade.date || new Date().toISOString().split('T')[0],
      symbol: newTrade.symbol.toUpperCase(),
      direction: (newTrade.direction as any) || 'LONG',
      entry: Number(newTrade.entry),
      exit: newTrade.exit ? Number(newTrade.exit) : undefined,
      stopLoss: Number(newTrade.stopLoss),
      target: Number(newTrade.target || newTrade.entry),
      positionSize: Number(newTrade.positionSize || 1),
      strategy: newTrade.strategy || 'Discretionary',
      result: (newTrade.result as any) || 'Open',
      pnl: Number(newTrade.pnl || 0),
      notes: newTrade.notes || '',
    });
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto h-full overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Trading Journal</h2>
          <p className="text-xs text-slate-500">
            Record executions and review discipline with AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAudit}
            disabled={isAuditing || trades.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isAuditing ? 'Auditing...' : 'AI Audit'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>

      {/* Simple Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Total P&L</span>
          <span
            className={`text-lg font-bold ${
              totalPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {totalPnl >= 0 ? '+' : ''}
            {formatPrice(totalPnl, currency)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Win Rate</span>
          <span className="text-lg font-bold text-slate-900">{winRate}%</span>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Trades Logged</span>
          <span className="text-lg font-bold text-slate-900">{totalTrades}</span>
        </div>
      </div>

      {/* AI Audit Report */}
      {auditReport && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-900">
            <span>AI Process Audit</span>
            <button onClick={() => setAuditReport(null)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
          <div className="text-slate-700 whitespace-pre-line leading-relaxed">
            {auditReport}
          </div>
        </div>
      )}

      {/* Trades Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Symbol</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Strategy</th>
                <th className="px-3 py-2.5">Entry / SL</th>
                <th className="px-3 py-2.5">P&L</th>
                <th className="px-3 py-2.5">Result</th>
                <th className="px-3 py-2.5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-slate-500">{t.date}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">{t.symbol}</td>
                  <td className="px-3 py-2.5">
                    <span className={t.direction === 'LONG' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                      {t.direction}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{t.strategy}</td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {formatPrice(t.entry, currency)} / {formatPrice(t.stopLoss, currency)}
                  </td>
                  <td className="px-3 py-2.5 font-semibold">
                    <span className={t.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {t.pnl >= 0 ? '+' : ''}
                      {formatPrice(t.pnl, currency)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      t.result === 'Win' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {t.result}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => onDeleteTrade(t.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Trade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Log Trade</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTrade} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Symbol</label>
                  <input
                    type="text"
                    required
                    value={newTrade.symbol}
                    onChange={(e) => setNewTrade({ ...newTrade, symbol: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Direction</label>
                  <select
                    value={newTrade.direction}
                    onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  >
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Entry</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newTrade.entry}
                    onChange={(e) => setNewTrade({ ...newTrade, entry: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newTrade.stopLoss}
                    onChange={(e) => setNewTrade({ ...newTrade, stopLoss: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Exit Price</label>
                  <input
                    type="number"
                    step="any"
                    value={newTrade.exit}
                    onChange={(e) => setNewTrade({ ...newTrade, exit: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">P&L Amount</label>
                  <input
                    type="number"
                    value={newTrade.pnl}
                    onChange={(e) => setNewTrade({ ...newTrade, pnl: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Result</label>
                  <select
                    value={newTrade.result}
                    onChange={(e) => setNewTrade({ ...newTrade, result: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  >
                    <option value="Win">Win</option>
                    <option value="Loss">Loss</option>
                    <option value="Breakeven">Breakeven</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg font-medium bg-slate-900 text-white hover:bg-slate-800"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
