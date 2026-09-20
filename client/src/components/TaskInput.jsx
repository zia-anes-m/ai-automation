import React, { useEffect } from 'react';
import { 
  Play, 
  Square, 
  Sparkles, 
  Compass, 
  AlertCircle, 
  Zap, 
  RotateCcw,
  SlidersHorizontal,
  Bot,
  Layers,
  CornerDownLeft
} from 'lucide-react';

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
  const isInputValid = taskPrompt.trim().length >= 12;

  // Keyboard shortcut: Ctrl/Cmd + Enter to trigger execution
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!isRunning && isInputValid) {
          e.preventDefault();
          onStartExecution();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, isInputValid, onStartExecution]);

  const handleClear = () => {
    setTaskPrompt('');
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      
      {/* Scenario Presets Deck */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Mission Scenarios
            </span>
            <span className="text-[11px] text-slate-500">
              Select a benchmark or compose a custom prompt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Engine:</span>
            <div className="flex items-center p-0.5 rounded-lg bg-obsidian-900 border border-white/[0.08]">
              {[
                { id: 'simulation', label: 'Instant Simulator', short: 'Simulator' },
                { id: 'anthropic', label: 'Claude 3.5 Sonnet', short: 'Claude 3.5' },
                { id: 'gemini', label: 'Gemini 1.5 Flash', short: 'Gemini 1.5' },
                { id: 'openai', label: 'GPT-4o Mini', short: 'GPT-4o' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    provider === p.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                  title={p.label}
                >
                  <span className="hidden sm:inline">{p.label}</span>
                  <span className="sm:hidden">{p.short}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preset Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario?.id === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => onSelectScenario(sc)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-obsidian-850 border-indigo-500/50 shadow-surface-elevated ring-1 ring-indigo-500/30'
                    : 'bg-obsidian-900/70 border-white/[0.06] hover:border-white/[0.14] hover:bg-obsidian-850/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                      isSelected 
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' 
                        : 'bg-white/[0.04] text-slate-400 border-white/[0.06] group-hover:text-slate-300'
                    }`}>
                      {sc.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {sc.timeline || 'Multi-round'}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {sc.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sc.prompt}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Orchestration Control Deck */}
      <div className="studio-card-elevated rounded-2xl p-4 border border-white/[0.09]">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="task-prompt-input" className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Problem Specification & Deliberation Objective</span>
          </label>
          
          {taskPrompt && !isRunning && (
            <button
              onClick={handleClear}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear prompt
            </button>
          )}
        </div>

        <textarea
          id="task-prompt-input"
          rows={3}
          value={taskPrompt}
          onChange={(e) => setTaskPrompt(e.target.value)}
          disabled={isRunning}
          placeholder="Describe your complex technical problem, architectural migration, or strategic dilemma for 4-agent collaborative consensus..."
          className="w-full bg-obsidian-950/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all resize-none font-sans leading-relaxed"
        />

        {/* Action Controls & Telemetry */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>
              Tokens: <strong className="text-slate-200">{Math.round(wordCount * 1.35)}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Words: <strong className={wordCount >= 10 ? 'text-emerald-400' : 'text-slate-400'}>{wordCount}</strong>
            </span>
            {wordCount > 0 && wordCount < 10 && (
              <span className="text-[11px] text-amber-400/90 flex items-center gap-1 font-sans">
                <AlertCircle className="w-3 h-3" /> Add more details for deeper deliberation
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isRunning ? (
              <button
                onClick={onAbortExecution}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/25 transition-all shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-rose-300" />
                <span>Abort Deliberation</span>
              </button>
            ) : (
              <button
                onClick={onStartExecution}
                disabled={!isInputValid}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  !isInputValid
                    ? 'opacity-40 cursor-not-allowed bg-obsidian-800 text-slate-500 border border-white/[0.05]'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-[0.98] border border-indigo-400/20'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Deploy 4-Agent Pipeline</span>
                <span className="hidden sm:inline-flex items-center gap-0.5 ml-1 text-[10px] text-indigo-200/70 font-mono bg-indigo-700/60 px-1.5 py-0.5 rounded border border-indigo-400/20">
                  <CornerDownLeft className="w-2.5 h-2.5" /> Enter
                </span>
              </button>
            )}
          </div>

        </div>
      </div>

    </section>
  );
}
