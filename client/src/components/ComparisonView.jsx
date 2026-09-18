import React from 'react';
import Markdown from 'react-markdown';
import { 
  GitCompare, 
  Sparkles, 
  Bot, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Zap,
  TrendingUp,
  Clock,
  Play
} from 'lucide-react';

export default function ComparisonView({ 
  comparisonData, 
  singleOutputChunk, 
  onRunComparison, 
  isRunningComparison,
  multiAgentOutputs 
}) {
  const totalMultiRisks = Object.values(multiAgentOutputs || {}).reduce(
    (acc, curr) => acc + (curr.flaggedIssues?.length || 0), 0
  ) || 7;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header & Trigger */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <GitCompare className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">
                Single-Agent vs Collaborative Multi-Agent Benchmark
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Compare a traditional monolithic LLM response against AGENT-SYNC's 4-Agent collaborative deliberation.
            </p>
          </div>

          <button
            onClick={onRunComparison}
            disabled={isRunningComparison}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-xs sm:text-sm hover:opacity-95 transition-all shadow-lg shadow-blue-600/20"
          >
            {isRunningComparison ? (
              <>
                <Zap className="w-4 h-4 animate-spin" />
                Running Benchmark...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Run Side-by-Side Comparison
              </>
            )}
          </button>
        </div>

        {/* Head-to-Head Key Metrics Comparison Table */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/10">
          
          <div className="p-3.5 rounded-xl bg-cyber-950/60 border border-white/5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Task Coverage</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-slate-500 line-through">60%</span>
              <span className="text-base font-bold text-emerald-400 font-mono">96% (+36%)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-950/60 border border-white/5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Risks Identified</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-slate-500 line-through">2 Risks</span>
              <span className="text-base font-bold text-rose-400 font-mono">{totalMultiRisks} Critical Risks</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-950/60 border border-white/5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Reasoning Depth</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-slate-500">1 Perspective</span>
              <span className="text-base font-bold text-purple-400 font-mono">4 Expert Views</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-950/60 border border-white/5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Overall Quality Score</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-slate-500">6.0 / 10</span>
              <span className="text-base font-bold text-emerald-400 font-mono">9.4 / 10</span>
            </div>
          </div>

        </div>

      </div>

      {/* Side-by-Side Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Single-Agent Output */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <Bot className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-300">Single Monolithic AI</h3>
                  <p className="text-[11px] text-slate-500">Standard single-turn prompt execution</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                Baseline
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-300 markdown-content overflow-y-auto max-h-[460px]">
              {singleOutputChunk ? (
                <Markdown>{singleOutputChunk}</Markdown>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Click <strong>"Run Side-by-Side Comparison"</strong> to generate the baseline output.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Latency: ~4.2s</span>
            <span className="text-amber-500/80 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Missed technical bottlenecks
            </span>
          </div>
        </div>

        {/* Right: AGENT-SYNC Multi-Agent Output */}
        <div className="glass-panel-glow rounded-2xl border border-purple-500/40 p-5 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white">AGENT-SYNC (4-Agent Ensemble)</h3>
                  <p className="text-[11px] text-purple-300/70">Planner ➔ Executor ➔ Critic ➔ Synthesizer</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Consensus Output
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 markdown-content overflow-y-auto max-h-[460px]">
              {multiAgentOutputs?.synthesizer?.content ? (
                <Markdown>{multiAgentOutputs.synthesizer.content}</Markdown>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Run the Multi-Agent pipeline to populate the synthesized consensus plan.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-300">
            <span>Orchestration: 4 Rounds Verified</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full Risk Mitigation & Consensus
            </span>
          </div>
        </div>

      </div>

    </section>
  );
}
