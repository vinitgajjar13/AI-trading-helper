import React from 'react';
import { UserSettings } from '../../services/marketData';
import { Settings, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Preferred Currency */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Currency</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSaveSettings({ ...settings, preferredCurrency: 'INR' })}
                className={`py-1.5 px-3 rounded-lg border font-medium transition-colors ${
                  settings.preferredCurrency === 'INR'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ₹ INR (Rupee)
              </button>
              <button
                type="button"
                onClick={() => onSaveSettings({ ...settings, preferredCurrency: 'USD' })}
                className={`py-1.5 px-3 rounded-lg border font-medium transition-colors ${
                  settings.preferredCurrency === 'USD'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                $ USD (Dollar)
              </button>
            </div>
          </div>

          {/* Theme Mode */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSaveSettings({ ...settings, theme: 'light' })}
                className={`py-1.5 px-3 rounded-lg border font-medium transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Light Mode
              </button>
              <button
                type="button"
                onClick={() => onSaveSettings({ ...settings, theme: 'dark' })}
                className={`py-1.5 px-3 rounded-lg border font-medium transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Dark Mode
              </button>
            </div>
          </div>

          {/* Default Risk */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Default Risk Per Trade</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0.5, 1.0, 1.5, 2.0].map((risk) => (
                <button
                  key={risk}
                  type="button"
                  onClick={() => onSaveSettings({ ...settings, defaultRiskPercent: risk })}
                  className={`py-1 rounded-md border font-medium transition-colors ${
                    settings.defaultRiskPercent === risk
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {risk}%
                </button>
              ))}
            </div>
          </div>

          {/* Reset Action */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all chats and journal data?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-1.5 px-3 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs transition-colors"
            >
              Reset Chat History
            </button>
          </div>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
