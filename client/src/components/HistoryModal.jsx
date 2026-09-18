import React from 'react';
import { X, History, Clock, ArrowRight, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, historyList, onLoadSession }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-white/10 p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Deliberation History</h3>
              <p className="text-xs text-slate-400">Past collaborative multi-agent execution sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {historyList && historyList.length > 0 ? (
            historyList.map((item, idx) => (
              <div
                key={item.sessionId || idx}
                onClick={() => {
                  onLoadSession(item);
                  onClose();
                }}
                className="group cursor-pointer p-4 rounded-xl bg-cyber-900/70 border border-white/5 hover:border-purple-500/40 hover:bg-cyber-850 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {item.completedAt ? new Date(item.completedAt).toLocaleTimeString() : 'Recent'}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Avg Confidence {item.averageConfidence}%
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-purple-300 transition-colors truncate">
                    {item.taskPrompt}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Duration: {item.durationSeconds}s</span>
                    <span>•</span>
                    <span className="text-rose-400 font-medium">
                      {item.totalRisksIdentified} Risks Addressed
                    </span>
                  </p>
                </div>

                <div className="flex-shrink-0 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              No previous deliberation sessions saved yet. Run the multi-agent pipeline to record runs.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
