import React from 'react';
import {
  Menu,
  Plus,
  PanelRight,
  Sun,
  Moon,
  Calculator,
  Clock,
  Sparkles,
  BarChart2,
  BookOpen,
  Star,
  Compass,
} from 'lucide-react';

interface HeaderBarProps {
  title: string;
  onOpenMobileMenu: () => void;
  onNewChat: () => void;
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenRiskCalc: () => void;
  activeView: 'chat' | 'watchlist' | 'market' | 'calculator' | 'journal';
  onChangeView: (view: 'chat' | 'watchlist' | 'market' | 'calculator' | 'journal') => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  onOpenMobileMenu,
  onNewChat,
  isRightPanelOpen,
  onToggleRightPanel,
  theme,
  onToggleTheme,
  onOpenRiskCalc,
  activeView,
  onChangeView,
}) => {
  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white px-4 flex items-center justify-between z-20 shadow-xs">
      {/* Left: Mobile trigger & session title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {title || 'TradeMind AI'}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Market Active</span>
          </span>
        </div>
      </div>

      {/* Center navigation tabs for fast access */}
      <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
        <button
          onClick={() => onChangeView('chat')}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            activeView === 'chat'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => onChangeView('watchlist')}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            activeView === 'watchlist'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Watchlist
        </button>
        <button
          onClick={() => onChangeView('calculator')}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            activeView === 'calculator'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Risk Calculator
        </button>
        <button
          onClick={() => onChangeView('journal')}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            activeView === 'journal'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Journal
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
          title="New Chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        <button
          onClick={onToggleRightPanel}
          className={`p-1.5 rounded-lg border transition-colors ${
            isRightPanelOpen
              ? 'bg-slate-100 text-slate-900 border-slate-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Analysis Side Panel"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
