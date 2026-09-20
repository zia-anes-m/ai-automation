import React, { useState } from 'react';
import { X, History, Clock, ArrowRight, CheckCircle2, ShieldAlert, Search, Trash2 } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, historyList, onLoadSession }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = (historyList || []).filter(item => 
    !searchTerm || (item.taskPrompt && item.taskPrompt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
      <div className="studio-card-elevated w-full max-w-3xl rounded-2xl border border-white/[0.1] p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Deliberation History</h3>
              <p className="text-xs text-slate-400">Past multi-agent collaborative sessions & audit runs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="pt-4 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search previous deliberation sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-obsidian-950/80 border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, idx) => (
              <div
                key={item.sessionId || idx}
                onClick={() => {
                  onLoadSession(item);
                  onClose();
                }}
                className="group cursor-pointer p-3.5 rounded-xl bg-obsidian-900/60 border border-white/[0.05] hover:border-indigo-500/40 hover:bg-obsidian-850 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {item.completedAt ? new Date(item.completedAt).toLocaleTimeString() : 'Recent'}
                    </span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> {item.averageConfidence}% Confidence
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                    {item.taskPrompt}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-3 font-mono">
                    <span>Duration: {item.durationSeconds || '4.5'}s</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-rose-400">
                      {item.totalRisksIdentified || 0} Risks Neutralized
                    </span>
                  </p>
                </div>

                <div className="flex-shrink-0 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              {searchTerm ? 'No sessions matching search query.' : 'No previous deliberation sessions saved yet.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
