import React, { useState } from 'react';
import { X, Key, ShieldCheck, Cpu, Zap, Save, Check, Eye, EyeOff } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKeys, onSaveApiKeys }) {
  const [keys, setKeys] = useState(apiKeys || { anthropic: '', gemini: '', openai: '' });
  const [showKeys, setShowKeys] = useState({ anthropic: false, gemini: false, openai: false });
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

  const toggleShow = (provider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
      <div className="studio-card-elevated w-full max-w-lg rounded-2xl border border-white/[0.1] p-6 shadow-2xl relative flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">LLM Orchestration Engine</h3>
              <p className="text-xs text-slate-400">Configure production API credentials or use Instant Simulator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Credentials Form */}
        <div className="py-4 space-y-4 text-xs">
          
          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Instant Simulator Engine</strong> is active out of the box with realistic multi-agent streaming. Add custom API keys below to query production LLM endpoints directly.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium">
                Anthropic API Key (Claude 3.5 Sonnet)
              </label>
              <button 
                type="button" 
                onClick={() => toggleShow('anthropic')}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showKeys.anthropic ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showKeys.anthropic ? 'text' : 'password'}
              placeholder="sk-ant-api03-..."
              value={keys.anthropic || ''}
              onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })}
              className="w-full bg-obsidian-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium">
                Google Gemini API Key (Gemini 1.5 Flash)
              </label>
              <button 
                type="button" 
                onClick={() => toggleShow('gemini')}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showKeys.gemini ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showKeys.gemini ? 'text' : 'password'}
              placeholder="AIzaSy..."
              value={keys.gemini || ''}
              onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
              className="w-full bg-obsidian-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium">
                OpenAI API Key (GPT-4o Mini)
              </label>
              <button 
                type="button" 
                onClick={() => toggleShow('openai')}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showKeys.openai ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showKeys.openai ? 'text' : 'password'}
              placeholder="sk-proj-..."
              value={keys.openai || ''}
              onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
              className="w-full bg-obsidian-950/80 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium hover:bg-white/[0.04] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 shadow-sm shadow-indigo-600/20 transition-all"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved Credentials</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
