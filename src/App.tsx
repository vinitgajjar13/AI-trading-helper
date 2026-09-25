/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AssetQuote,
  Conversation,
  ChatMessage,
  TradeSetup,
  JournalTrade,
} from './types/trading';
import {
  loadConversations,
  saveConversations,
  loadWatchlist,
  saveWatchlist,
  loadJournalTrades,
  saveJournalTrades,
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  UserSettings,
} from './services/marketData';
import { fetchMarketData, sendChatMessage } from './services/api';

import { Sidebar } from './components/layout/Sidebar';
import { HeaderBar } from './components/common/HeaderBar';
import { ChatArea } from './components/chat/ChatArea';
import { RightAnalysisPanel } from './components/panels/RightAnalysisPanel';
import { WatchlistView } from './components/watchlist/WatchlistView';
import { MarketOverviewView } from './components/market/MarketOverviewView';
import { RiskCalculatorView } from './components/calculator/RiskCalculatorView';
import { TradingJournalView } from './components/journal/TradingJournalView';
import { SettingsModal } from './components/modals/SettingsModal';

export default function App() {
  // App view state
  const [activeView, setActiveView] = useState<'chat' | 'watchlist' | 'market' | 'calculator' | 'journal'>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false); // Default closed for clean simple chat view
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings: default light mode
  const [settings, setSettings] = useState<UserSettings>(() => {
    const s = loadSettings();
    return { ...s, theme: s.theme || 'light' };
  });

  // Market quotes repository
  const [quotes, setQuotes] = useState<AssetQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<AssetQuote | null>(null);

  // Watchlist state
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(loadWatchlist);

  // Journal trades state
  const [journalTrades, setJournalTrades] = useState<JournalTrade[]>(loadJournalTrades);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const loaded = loadConversations();
    return loaded[0]?.id || 'conv-default';
  });

  // Risk Calculator initial parameters for pre-filling
  const [calculatorParams, setCalculatorParams] = useState<{
    symbol?: string;
    entry?: number;
    stopLoss?: number;
    target?: number;
  }>({
    symbol: 'NIFTY 50',
    entry: 25420,
    stopLoss: 25280,
    target: 25750,
  });

  // Chat message loading state
  const [isGenerating, setIsGenerating] = useState(false);

  // Initial Market Data Fetch
  useEffect(() => {
    async function loadData() {
      const { quotes: fetched } = await fetchMarketData();
      if (fetched && fetched.length > 0) {
        setQuotes(fetched);
        const nifty = fetched.find((q) => q.symbol === 'NIFTY 50') || fetched[0];
        setSelectedQuote(nifty);
      }
    }
    loadData();
  }, []);

  // Sync state to local storage
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveWatchlist(watchlistSymbols);
  }, [watchlistSymbols]);

  useEffect(() => {
    saveJournalTrades(journalTrades);
  }, [journalTrades]);

  useEffect(() => {
    saveSettings(settings);
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [settings]);

  // Current active conversation
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Handler: New conversation
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentSymbol: selectedQuote?.symbol || 'NIFTY 50',
      messages: [],
    };
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
    setActiveView('chat');
  };

  // Handler: Delete conversation
  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    if (updated.length === 0) {
      handleNewConversation();
      return;
    }
    setConversations(updated);
    if (activeConversationId === id) {
      setActiveConversationId(updated[0].id);
    }
  };

  // Handler: Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Handler: Send Message
  const handleSendMessage = async (
    text: string,
    image?: { data: string; mimeType: string; previewUrl: string } | null
  ) => {
    if (!activeConversation) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      attachedImage: image ? { data: image.data, mimeType: image.mimeType, previewUrl: image.previewUrl } : undefined,
    };

    // Auto-update conversation title if first message
    const isFirstUserMessage = activeConversation.messages.filter((m) => m.role === 'user').length === 0;
    let newTitle = activeConversation.title;
    if (isFirstUserMessage) {
      newTitle = text.slice(0, 28).trim() || 'New Chat';
    }

    const updatedMessages = [...activeConversation.messages, userMessage];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, title: newTitle, messages: updatedMessages, updatedAt: new Date().toISOString() }
          : c
      )
    );

    setIsGenerating(true);

    try {
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage({
        message: text,
        conversationHistory: historyPayload,
        currentSymbol: activeConversation.currentSymbol,
        uploadedImage: image ? { data: image.data, mimeType: image.mimeType } : null,
        riskProfile: {
          accountSize: settings.defaultAccountSize,
          riskPercent: settings.defaultRiskPercent,
        },
      });

      const aiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
        notice: res.notice,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                currentSymbol: res.symbol || c.currentSymbol,
                messages: [...updatedMessages, aiMessage],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );

      if (res.symbol && quotes.length > 0) {
        const found = quotes.find((q) => q.symbol.toUpperCase() === res.symbol.toUpperCase());
        if (found) setSelectedQuote(found);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Please try again'}.`,
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, messages: [...updatedMessages, errorMessage] }
            : c
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Apply trade setup directly to risk calculator
  const handleApplyToCalculator = (setup: TradeSetup) => {
    setCalculatorParams({
      symbol: setup.symbol,
      entry: setup.entry,
      stopLoss: setup.stopLoss,
      target: setup.target1,
    });
    setActiveView('calculator');
  };

  // Handler: Add trade setup directly to journal
  const handleAddToJournal = (setup: TradeSetup) => {
    const riskPerShare = Math.abs(setup.entry - setup.stopLoss);
    const maxRisk = (settings.defaultAccountSize * settings.defaultRiskPercent) / 100;
    const computedSize = riskPerShare > 0 ? Math.floor(maxRisk / riskPerShare) : 10;

    const newJournalTrade: JournalTrade = {
      id: `trade-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      symbol: setup.symbol,
      direction: setup.direction,
      entry: setup.entry,
      stopLoss: setup.stopLoss,
      target: setup.target1,
      positionSize: computedSize,
      strategy: setup.setup || 'Trade Setup',
      result: 'Open',
      pnl: 0,
      notes: `Invalidation: ${setup.invalidation}. Quality: ${setup.quality}.`,
    };

    setJournalTrades([newJournalTrade, ...journalTrades]);
    setActiveView('journal');
  };

  const handleAddJournalTrade = (trade: JournalTrade) => {
    setJournalTrades([trade, ...journalTrades]);
  };

  const handleDeleteJournalTrade = (id: string) => {
    setJournalTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleWatchlist = (symbol: string) => {
    if (watchlistSymbols.includes(symbol)) {
      setWatchlistSymbols(watchlistSymbols.filter((s) => s !== symbol));
    } else {
      setWatchlistSymbols([...watchlistSymbols, symbol]);
    }
  };

  const handleSelectAssetForChat = (symbol: string) => {
    setActiveView('chat');
    const targetQuote = quotes.find((q) => q.symbol === symbol);
    if (targetQuote) setSelectedQuote(targetQuote);
    handleSendMessage(`Analyze ${symbol} today. Provide support, resistance, indicators, and a trade setup.`);
  };

  const handleSelectAssetForPanel = (quote: AssetQuote) => {
    setSelectedQuote(quote);
    setIsRightPanelOpen(true);
  };

  const handleQuickPrompt = (prompt: string) => {
    setActiveView('chat');
    handleSendMessage(prompt);
  };

  const handleResetData = () => {
    localStorage.clear();
    setConversations(loadConversations());
    setWatchlistSymbols(loadWatchlist());
    setJournalTrades(loadJournalTrades());
    setSettings({ ...DEFAULT_SETTINGS, theme: 'light' });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-800 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setActiveView('chat');
        }}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpenOnMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-white">
        {/* Top Header Bar */}
        <HeaderBar
          title={
            activeView === 'chat'
              ? activeConversation?.title || 'Chat'
              : activeView === 'watchlist'
              ? 'Watchlist'
              : activeView === 'market'
              ? 'Market Overview'
              : activeView === 'calculator'
              ? 'Risk Calculator'
              : 'Trading Journal'
          }
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNewChat={handleNewConversation}
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
          theme={settings.theme}
          onToggleTheme={() =>
            setSettings({
              ...settings,
              theme: settings.theme === 'dark' ? 'light' : 'dark',
            })
          }
          onOpenRiskCalc={() => setActiveView('calculator')}
          activeView={activeView}
          onChangeView={setActiveView}
        />

        {/* Dynamic Body Content depending on Active View */}
        <div className="flex-1 flex overflow-hidden bg-white">
          {activeView === 'chat' && (
            <ChatArea
              messages={activeConversation?.messages || []}
              currentSymbol={activeConversation?.currentSymbol || 'NIFTY 50'}
              isGenerating={isGenerating}
              onSendMessage={handleSendMessage}
              onApplyToCalculator={handleApplyToCalculator}
              onAddToJournal={handleAddToJournal}
              currency={settings.preferredCurrency}
              onQuickPrompt={handleQuickPrompt}
            />
          )}

          {activeView === 'watchlist' && (
            <WatchlistView
              quotes={quotes}
              watchlistSymbols={watchlistSymbols}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectAssetForChat={handleSelectAssetForChat}
              onSelectAssetForPanel={handleSelectAssetForPanel}
              currency={settings.preferredCurrency}
            />
          )}

          {activeView === 'market' && (
            <MarketOverviewView
              quotes={quotes}
              currency={settings.preferredCurrency}
              onSelectAssetForChat={handleSelectAssetForChat}
              onSelectAssetForPanel={handleSelectAssetForPanel}
            />
          )}

          {activeView === 'calculator' && (
            <RiskCalculatorView
              initialValues={calculatorParams}
              currency={settings.preferredCurrency}
              onAskAiToValidate={(prompt) => {
                setActiveView('chat');
                handleSendMessage(prompt);
              }}
            />
          )}

          {activeView === 'journal' && (
            <TradingJournalView
              trades={journalTrades}
              onAddTrade={handleAddJournalTrade}
              onDeleteTrade={handleDeleteJournalTrade}
              currency={settings.preferredCurrency}
              onAskAi={(prompt) => {
                setActiveView('chat');
                handleSendMessage(prompt);
              }}
            />
          )}

          {/* Right Technical Side Panel (Only opened on demand) */}
          {isRightPanelOpen && selectedQuote && (
            <div className="hidden xl:block">
              <RightAnalysisPanel
                quote={selectedQuote}
                currency={settings.preferredCurrency}
                onClose={() => setIsRightPanelOpen(false)}
                onAskAi={(prompt) => {
                  setActiveView('chat');
                  handleSendMessage(prompt);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onResetData={handleResetData}
      />
    </div>
  );
}
