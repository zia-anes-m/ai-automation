import React from 'react';
import { 
  Sparkles, 
  Cpu, 
  Activity, 
  Layers, 
  GitCompare, 
  FileText, 
  History, 
  Settings, 
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isConnected, 
  onOpenSettings, 
  onOpenHistory, 
  hasPlan, 
  onExport 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-cyber-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-blue-500 to-emerald-400 p-[1.5px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-cyber-900 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-blue-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
                AGENT-SYNC
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase tracking-widest">
                Orion 1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-Agent Collaborative Intelligence Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-cyber-900/90 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pipeline'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Live 4-Agent Pipeline
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'comparison'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Single vs Multi Comparison
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            disabled={!hasPlan}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !hasPlan 
                ? 'opacity-40 cursor-not-allowed text-slate-500' 
                : activeTab === 'plan'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Master Blueprint
          </button>
        </div>

        {/* Right Tools & Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyber-900 border border-white/5 text-xs">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline">WS Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[11px] text-rose-400 font-medium hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Export Button */}
          {hasPlan && (
            <button
              onClick={onExport}
              title="Export Master Plan to Markdown"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Plan</span>
            </button>
          )}

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            title="View Past Deliberation Runs"
            className="p-2 rounded-lg bg-cyber-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Configure LLM & API Keys"
            className="p-2 rounded-lg bg-cyber-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
