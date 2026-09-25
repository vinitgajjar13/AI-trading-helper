import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TradeSetup } from '../../types/trading';
import { AiMarkdownRenderer } from './AiMarkdownRenderer';
import { FinancialDisclaimer } from '../common/FinancialDisclaimer';
import {
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  TrendingUp,
  Target,
  BarChart2,
  Calculator,
  BookOpen,
  X,
  Bot,
  User,
  ArrowUp,
} from 'lucide-react';

interface ChatAreaProps {
  messages: ChatMessage[];
  currentSymbol: string;
  isGenerating: boolean;
  onSendMessage: (
    message: string,
    image?: { data: string; mimeType: string; previewUrl: string } | null
  ) => void;
  onApplyToCalculator: (setup: TradeSetup) => void;
  onAddToJournal: (setup: TradeSetup) => void;
  currency: 'INR' | 'USD';
  onQuickPrompt: (prompt: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentSymbol,
  isGenerating,
  onSendMessage,
  onApplyToCalculator,
  onAddToJournal,
  currency,
  onQuickPrompt,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{
    data: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Handle Form Submit
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isGenerating) return;

    onSendMessage(inputText.trim(), attachedImage);
    setInputText('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle Image File Upload (Chart Screenshot)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image (PNG, JPG, or WEBP chart screenshot).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Full = reader.result as string;
      const base64Data = base64Full.split(',')[1];
      setAttachedImage({
        data: base64Data,
        mimeType: file.type,
        previewUrl: base64Full,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Voice Input (Web Speech API)
  const toggleVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const simplePrompts = [
    `Analyze ${currentSymbol}`,
    'Find bullish setups',
    'Explain RSI',
    'Calculate position size',
    'Analyze BTCUSDT',
  ];

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-white relative">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {isEmpty ? (
          /* Simple, clean ChatGPT-like starter screen */
          <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800">
                What would you like to analyze?
              </h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Ask about stocks, indices, crypto, technical indicators, or upload a chart screenshot.
              </p>
            </div>

            {/* Clean prompt pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
              <button
                onClick={() => onQuickPrompt('Analyze NIFTY 50 today with key levels and RSI')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-800">Analyze NIFTY 50</div>
                <div className="text-[11px] text-slate-500">Key support, resistance, and RSI</div>
              </button>

              <button
                onClick={() => onQuickPrompt('Find a setup with 1:2 risk/reward on RELIANCE')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-800">Trade Setup</div>
                <div className="text-[11px] text-slate-500">1:2 R:R setup with invalidation</div>
              </button>

              <button
                onClick={() => onQuickPrompt('Calculate position size for ₹1,00,000 capital, 1% risk, entry 25400, SL 25300')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-800">Risk & Position Sizing</div>
                <div className="text-[11px] text-slate-500">Capital preservation math</div>
              </button>

              <button
                onClick={() => onQuickPrompt('Explain RSI divergence like I am a beginner')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-800">Learn Indicator</div>
                <div className="text-[11px] text-slate-500">Clear beginner-friendly concept</div>
              </button>
            </div>

            <FinancialDisclaimer compact />
          </div>
        ) : (
          /* Simple, readable Chat Messages */
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-sm ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {/* Attached Image Preview */}
                    {msg.attachedImage && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-slate-200 max-w-sm">
                        <img
                          src={msg.attachedImage.previewUrl || `data:${msg.attachedImage.mimeType};base64,${msg.attachedImage.data}`}
                          alt="Chart screenshot"
                          className="w-full h-auto object-cover max-h-56"
                        />
                      </div>
                    )}

                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <AiMarkdownRenderer
                        content={msg.content}
                        currency={currency}
                        onApplyToCalculator={onApplyToCalculator}
                        onAddToJournal={onAddToJournal}
                      />
                    )}

                    {msg.notice && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-400">
                        {msg.notice}
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1.5 flex items-center gap-2 ${
                        isUser ? 'text-slate-400 justify-end' : 'text-slate-400 justify-start'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isGenerating && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="ml-1">TradeMind is analyzing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Dock Area */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Quick suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {simplePrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onQuickPrompt(qp)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 whitespace-nowrap transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Attached image preview */}
          {attachedImage && (
            <div className="relative inline-flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <img
                src={attachedImage.previewUrl}
                alt="Upload preview"
                className="w-10 h-10 rounded object-cover border border-slate-200"
              />
              <div>
                <span className="font-medium text-slate-800 block">Chart screenshot attached</span>
                <span className="text-[10px] text-slate-500">Ready to analyze</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Simple ChatGPT-style Input Box */}
          <form
            onSubmit={handleSend}
            className="flex items-end gap-2 p-1.5 sm:p-2 rounded-2xl bg-white border border-slate-300 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100 transition-all shadow-xs"
          >
            {/* File Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Upload chart image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Voice Dictation Trigger */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2 rounded-xl transition-colors ${
                isRecording
                  ? 'bg-rose-100 text-rose-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title={isRecording ? 'Listening...' : 'Voice Dictation'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about the market..."
              className="flex-1 bg-transparent border-0 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none py-1 px-1 leading-relaxed max-h-32"
            />

            {/* Simple Send button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedImage) || isGenerating}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium disabled:opacity-30 transition-all shrink-0 shadow-xs"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between px-1">
            <FinancialDisclaimer compact />
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Press Enter to send
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
