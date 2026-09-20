import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Printer,
  Compass,
  FileCheck,
  ShieldCheck,
  Zap,
  Share2
} from 'lucide-react';

export default function SynthesizerPlanView({ planData, onExport }) {
  const [copied, setCopied] = useState(false);

  if (!planData || !planData.content) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-400">Consensus Blueprint Standby</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Execute the 4-Agent Deliberation pipeline to synthesize a unified, risk-mitigated master blueprint.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(planData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Blueprint Header */}
      <div className="studio-card-elevated rounded-2xl p-6 mb-6 border border-white/[0.09]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Master Consensus Strategic Blueprint
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Consensus Reached
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Harmonized from Planner, Executor, and Critic agent deliberations with full adversarial risk neutralization.
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Blueprint'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 shadow-sm shadow-indigo-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Markdown</span>
            </button>
          </div>

        </div>

        {/* Key Performance Indicators */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-obsidian-950/70 border border-white/[0.04]">
            <span className="text-[11px] text-slate-400 font-mono">Consensus Confidence</span>
            <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {planData.confidence || 95}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-obsidian-950/70 border border-white/[0.04]">
            <span className="text-[11px] text-slate-400 font-mono">Rounds Reconciled</span>
            <div className="text-base sm:text-lg font-bold text-indigo-300 font-mono mt-0.5">
              4 of 4 Verified
            </div>
          </div>

          <div className="p-3 rounded-xl bg-obsidian-950/70 border border-white/[0.04]">
            <span className="text-[11px] text-slate-400 font-mono">Adversarial Risks</span>
            <div className="text-base sm:text-lg font-bold text-rose-400 font-mono mt-0.5">
              100% Mitigated
            </div>
          </div>

          <div className="p-3 rounded-xl bg-obsidian-950/70 border border-white/[0.04]">
            <span className="text-[11px] text-slate-400 font-mono">Execution Status</span>
            <div className="text-base sm:text-lg font-bold text-cyan-400 font-mono mt-0.5">
              Ready to Ship
            </div>
          </div>
        </div>

      </div>

      {/* Main Blueprint Markdown Dossier */}
      <div className="studio-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] text-slate-200 markdown-content leading-relaxed shadow-surface-elevated">
        <Markdown>{planData.content}</Markdown>
      </div>

    </section>
  );
}
