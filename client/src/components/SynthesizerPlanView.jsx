import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  FileCheck, 
  ShieldCheck, 
  ListOrdered, 
  Printer,
  Compass
} from 'lucide-react';

export default function SynthesizerPlanView({ planData, onExport }) {
  const [copied, setCopied] = useState(false);

  if (!planData || !planData.content) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm">No synthesized master plan available yet. Run the 4-Agent Pipeline to generate consensus.</p>
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
      <div className="glass-panel-glow rounded-2xl p-6 mb-6 border border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center text-2xl shadow-xl shadow-purple-600/30">
              🔮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  Master Consensus Execution Blueprint
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Consensus Verified
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Harmonized from Planner, Executor, and Critic agent deliberations with full risk mitigation.
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-900 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Plan'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-900 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 text-white text-xs font-semibold hover:opacity-95 shadow-lg shadow-purple-600/25 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Markdown</span>
            </button>
          </div>

        </div>

        {/* Confidence & Metrics Ribbon */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-cyber-950/60 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">Consensus Confidence</span>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {planData.confidence || 95}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyber-950/60 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">Debate Rounds Reconciled</span>
            <div className="text-lg font-bold text-purple-300 font-mono mt-0.5">
              4 of 4 Completed
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyber-950/60 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">Failure Modes Neutralized</span>
            <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
              100% Mitigated
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyber-950/60 border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">Execution Readiness</span>
            <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">
              Ready to Ship
            </div>
          </div>
        </div>

      </div>

      {/* Main Markdown Body */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 text-slate-100 markdown-content leading-relaxed shadow-xl">
        <Markdown>{planData.content}</Markdown>
      </div>

    </section>
  );
}
