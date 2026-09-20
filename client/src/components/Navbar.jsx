import React from 'react';
import { 
  Sparkles, 
  Layers, 
  GitCompare, 
  FileText, 
  History, 
  Settings, 
  Download,
  Cpu,
  Loader2
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  connectionState, // 'connected' | 'connecting' | 'disconnected'
  onOpenSettings, 
  onOpenHistory, 
  hasPlan, 
  onExport 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-obsidian-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        
        {/* Brand & Studio Status */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/25 border border-white/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white font-mono">
                AGENT<span className="text-indigo-400">SYNC</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
              Autonomous 4-Agent Orchestration Studio
            </p>
          </div>
        </div>

        {/* Studio View Navigation (Segmented Switcher) */}
        <nav className="flex items-center p-1 rounded-xl bg-obsidian-900 border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              activeTab === 'pipeline'
                ? 'bg-obsidian-800 text-white shadow-sm border border-white/[0.1]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Deliberation Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              activeTab === 'comparison'
                ? 'bg-obsidian-800 text-white shadow-sm border border-white/[0.1]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Empirical Benchmark</span>
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            disabled={!hasPlan}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              !hasPlan 
                ? 'opacity-40 cursor-not-allowed text-slate-500' 
                : activeTab === 'plan'
                  ? 'bg-obsidian-800 text-white shadow-sm border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-violet-400" />
            <span>Consensus Blueprint</span>
            {hasPlan && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          {/* Connection Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-obsidian-900 border border-white/[0.06] text-[11px] font-mono">
            {connectionState === 'connected' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-slate-300">Live Stream</span>
              </>
            ) : connectionState === 'connecting' ? (
              <>
                <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-amber-400">Connecting...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-rose-400">Offline</span>
              </>
            )}
          </div>

          {/* Export Plan Quick Button */}
          {hasPlan && (
            <button
              onClick={onExport}
              title="Export Consensus Blueprint (Markdown)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium hover:bg-indigo-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>
          )}

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            title="Deliberation History"
            className="p-1.5 rounded-lg bg-obsidian-900 border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Engine Settings & API Keys"
            className="p-1.5 rounded-lg bg-obsidian-900 border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
