import React, { useState } from 'react';
import { Conversation } from '../../types/trading';
import {
  Plus,
  MessageSquare,
  Search,
  Star,
  Compass,
  Calculator,
  BookOpen,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  activeView: 'chat' | 'watchlist' | 'market' | 'calculator' | 'journal';
  onChangeView: (view: 'chat' | 'watchlist' | 'market' | 'calculator' | 'journal') => void;
  onOpenSettings: () => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  activeView,
  onChangeView,
  onOpenSettings,
  isOpenOnMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                TradeMind <span className="text-emerald-600 font-medium">AI</span>
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-500 hover:text-slate-800 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewConversation();
              onChangeView('chat');
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Quick Views */}
        <div className="px-3 py-1 space-y-0.5 text-xs">
          <button
            onClick={() => {
              onChangeView('chat');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeView === 'chat'
                ? 'bg-slate-200 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Chat Assistant</span>
          </button>

          <button
            onClick={() => {
              onChangeView('watchlist');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeView === 'watchlist'
                ? 'bg-slate-200 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-slate-500" />
            <span>Watchlist</span>
          </button>

          <button
            onClick={() => {
              onChangeView('market');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeView === 'market'
                ? 'bg-slate-200 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Market Overview</span>
          </button>

          <button
            onClick={() => {
              onChangeView('calculator');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeView === 'calculator'
                ? 'bg-slate-200 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            <span>Risk Calculator</span>
          </button>

          <button
            onClick={() => {
              onChangeView('journal');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeView === 'journal'
                ? 'bg-slate-200 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Trading Journal</span>
          </button>
        </div>

        <hr className="my-2 border-slate-200 mx-3" />

        {/* Recent Conversations */}
        <div className="flex-1 flex flex-col min-h-0 px-3">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Recent Chats
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {filteredConversations.length}
            </span>
          </div>

          {/* Search chat */}
          <div className="relative mb-2">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredConversations.length === 0 ? (
              <div className="p-3 text-center text-slate-400 text-xs">
                No chats yet
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeConversationId === c.id && activeView === 'chat';
                const isEditing = editingId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectConversation(c.id);
                      onChangeView('chat');
                      onCloseMobile();
                    }}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-white text-slate-900 font-medium border border-slate-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-1.5 py-0.5 rounded bg-white border border-slate-300 text-xs text-slate-800"
                          autoFocus
                        />
                        <button
                          onClick={(e) => saveEditing(c.id, e)}
                          className="p-0.5 text-emerald-600 hover:bg-slate-100 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-0.5 text-slate-400 hover:bg-slate-100 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="truncate">{c.title}</span>
                        </div>

                        <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                          <button
                            onClick={(e) => startEditing(c, e)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {conversations.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation(c.id);
                              }}
                              className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Settings */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between p-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Settings</span>
            </div>
            <span className="text-[10px] text-slate-400">Light Mode</span>
          </button>
        </div>
      </aside>
    </>
  );
};
