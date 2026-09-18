import React from 'react';
import { Play, Square, Sparkles, Compass, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function TaskInput({
  scenarios,
  selectedScenario,
  onSelectScenario,
  taskPrompt,
  setTaskPrompt,
  isRunning,
  onStartExecution,
  onAbortExecution,
  provider,
  setProvider
}) {
  const wordCount = taskPrompt.trim() ? taskPrompt.trim().split(/\s+/).length : 0;
  const isInputValid = taskPrompt.trim().length > 10;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header & Preset Badges */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Task Specification & Orchestration Trigger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a verified Hackathon scenario or formulate a custom complex mission for 4-agent deliberation.
          </p>
        </div>

        {/* Provider Mode Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-cyber-900/90 p-1 rounded-xl border border-white/10">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Engine:</span>
          {['simulation', 'anthropic', 'gemini', 'openai'].map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all uppercase ${
                provider === p
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p === 'simulation' ? '⚡ Instant Simulation' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario?.id === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`group cursor-pointer p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/50'
                  : 'bg-cyber-900/60 border-white/5 hover:border-purple-500/30 hover:bg-cyber-850'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {sc.badge}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {sc.timeline}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                {sc.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {sc.prompt}
              </p>
            </div>
          );
        })}
      </div>

      {/* Input Box & Action Bar */}
      <div className="relative glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl">
        <textarea
          rows={3}
          value={taskPrompt}
          onChange={(e) => setTaskPrompt(e.target.value)}
          disabled={isRunning}
          placeholder="Enter a complex mission or strategic dilemma (e.g. startup strategy, emergency coordination, architecture redesign)..."
          className="w-full bg-cyber-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
        />

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-white/5">
          
          {/* Word Count / Hint */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="font-mono">
              Word count: <strong className={wordCount >= 20 ? 'text-emerald-400' : 'text-amber-400'}>{wordCount}</strong>
            </span>
            {wordCount < 10 && (
              <span className="text-[11px] text-amber-400/80 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Minimum 10+ words recommended for deep multi-agent debate
              </span>
            )}
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isRunning ? (
              <button
                onClick={onAbortExecution}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600/80 text-white font-semibold text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/30"
              >
                <Square className="w-4 h-4 fill-white" />
                Abort Pipeline
              </button>
            ) : (
              <button
                onClick={onStartExecution}
                disabled={!isInputValid}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-xl ${
                  !isInputValid
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-400'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 text-white hover:opacity-95 hover:scale-[1.02] shadow-purple-600/25 active:scale-[0.98]'
                }`}
              >
                <Zap className="w-4 h-4" />
                Deploy 4-Agent Debate
              </button>
            )}
          </div>

        </div>
      </div>

    </section>
  );
}
