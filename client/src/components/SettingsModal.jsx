import React, { useState } from 'react';
import { X, Key, ShieldCheck, Cpu, Zap, Save, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKeys, onSaveApiKeys }) {
  const [keys, setKeys] = useState(apiKeys || { anthropic: '', gemini: '', openai: '' });
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKeys(keys);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">LLM Provider & API Keys</h3>
              <p className="text-xs text-slate-400">Configure real LLMs or use Instant Simulation Mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="py-4 space-y-4 text-xs">
          
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-purple-200/90 leading-relaxed">
              <strong>Instant Simulation Engine</strong> is enabled by default with zero setup required. Enter custom API keys below to stream directly from live production LLMs.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Anthropic Claude API Key (Claude 3.5 Sonnet)
            </label>
            <input
              type="password"
              placeholder="sk-ant-api..."
              value={keys.anthropic || ''}
              onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })}
              className="w-full bg-cyber-950/70 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Google Gemini API Key (Gemini 1.5 Flash)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keys.gemini || ''}
              onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
              className="w-full bg-cyber-950/70 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              OpenAI API Key (GPT-4o Mini)
            </label>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={keys.openai || ''}
              onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
              className="w-full bg-cyber-950/70 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 shadow-lg shadow-purple-600/25 transition-all"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Keys</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
